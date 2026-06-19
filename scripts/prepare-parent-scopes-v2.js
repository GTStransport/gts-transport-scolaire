import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const backupRoot = path.join(projectRoot, "backups");
const envPath = path.join(projectRoot, ".env.local");

const SCOPE_FIELDS = [
  "driverIds",
  "assistantIds",
  "circuitIds",
  "securityScopeVersion",
  "securityScopeUpdatedAt",
  "securityScopeSource"
];

function parseArgs(argv = process.argv.slice(2)) {
  const args = { input: "", limit: 50, write: false, showDocs: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") args.input = argv[index + 1] || "";
    if (arg === "--limit") args.limit = Number(argv[index + 1] || 50);
    if (arg === "--write") args.write = true;
    if (arg === "--show-docs") args.showDocs = true;
  }
  return args;
}

function parseEnv(content = "") {
  return content.split(/\r?\n/).reduce((env, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return env;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return env;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
    return env;
  }, {});
}

function text(value = "") {
  return String(value || "").trim();
}

function unique(values = []) {
  return [...new Set(values.map(text).filter(Boolean))];
}

function sortById(items = []) {
  return [...items].sort((a, b) => text(a.id).localeCompare(text(b.id), "fr"));
}

function documentData(doc = {}) {
  if (doc && typeof doc === "object" && doc.data && typeof doc.data === "object") {
    return { id: doc.id || doc.data.id || "", ...doc.data };
  }
  return doc || {};
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function collectionDocs(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload.map(documentData);
  if (Array.isArray(payload.documents)) return payload.documents.map(documentData);
  if (payload && typeof payload === "object") {
    return Object.entries(payload)
      .filter(([, value]) => value && typeof value === "object")
      .map(([id, value]) => ({ id, ...documentData(value) }));
  }
  return [];
}

async function latestBackupDir() {
  const entries = await fs.readdir(backupRoot, { withFileTypes: true }).catch(() => []);
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const fullPath = path.join(backupRoot, entry.name);
    const parentsFile = path.join(fullPath, "parents.json");
    const stat = await fs.stat(parentsFile).catch(() => null);
    if (stat) dirs.push({ fullPath, mtimeMs: stat.mtimeMs });
  }
  dirs.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return dirs[0]?.fullPath || "";
}

async function loadBackup(inputPath = "") {
  const resolvedInput = inputPath
    ? path.resolve(projectRoot, inputPath)
    : await latestBackupDir();
  if (!resolvedInput) throw new Error("Aucun dossier de sauvegarde trouve. Utilisez --input <dossier>.");

  const [parentsPayload, childrenPayload, studentsPayload] = await Promise.all([
    readJsonIfExists(path.join(resolvedInput, "parents.json")),
    readJsonIfExists(path.join(resolvedInput, "children.json")),
    readJsonIfExists(path.join(resolvedInput, "students.json"))
  ]);

  const parents = sortById(collectionDocs(parentsPayload));
  const studentsById = new Map();
  [...collectionDocs(childrenPayload), ...collectionDocs(studentsPayload)].forEach((student) => {
    const id = text(student.id);
    if (!id) return;
    studentsById.set(id, { ...(studentsById.get(id) || {}), ...student, id });
  });

  return {
    inputDir: resolvedInput,
    parents,
    students: sortById([...studentsById.values()])
  };
}

function parentLinkedToChild(parent = {}, child = {}) {
  const parentId = text(parent.id);
  const childId = text(child.id);
  return (
    childId && Array.isArray(parent.linkedChildrenIds) && parent.linkedChildrenIds.map(text).includes(childId)
  ) || (
    parentId && Array.isArray(child.parentIds) && child.parentIds.map(text).includes(parentId)
  ) || (
    parentId && text(child.parentId) === parentId
  );
}

function driverIdsFromChild(child = {}) {
  return unique([
    ...(Array.isArray(child.driverIds) ? child.driverIds : []),
    child.driverId,
    child.transferDriverId
  ]);
}

function assistantIdsFromChild(child = {}) {
  return unique([
    ...(Array.isArray(child.assistantIds) ? child.assistantIds : []),
    child.assistantId,
    child.transferAssistantId,
    child.convoyeurId
  ]);
}

function circuitIdsFromChild(child = {}) {
  return unique([
    ...(Array.isArray(child.circuitIds) ? child.circuitIds : []),
    child.circuitId,
    child.circuitNumber,
    child.pickupCircuitId,
    child.schoolCircuitId,
    child.transferCircuitId,
    child.transferSchoolCircuitId,
    child.morningCircuit,
    child.returnCircuit
  ]);
}

function scopeForParent(parent = {}, students = [], now = new Date().toISOString()) {
  const linkedChildren = students.filter((child) => parentLinkedToChild(parent, child));
  const existingLinkedChildrenIds = Array.isArray(parent.linkedChildrenIds)
    ? parent.linkedChildrenIds.map(text).filter(Boolean)
    : [];
  const foundChildIds = linkedChildren.map((child) => child.id).filter(Boolean);
  const linkedChildrenIds = unique([...existingLinkedChildrenIds, ...foundChildIds]);
  const driverIds = unique(linkedChildren.flatMap(driverIdsFromChild));
  const assistantIds = unique(linkedChildren.flatMap(assistantIdsFromChild));
  const circuitIds = unique(linkedChildren.flatMap(circuitIdsFromChild));
  const warnings = [];

  if (!linkedChildren.length) warnings.push("no_linked_child");
  if (!text(parent.transportManagerId)) warnings.push("missing_transportManagerId");
  if (!driverIds.length) warnings.push("driverIds_empty");
  if (!assistantIds.length) warnings.push("assistantIds_empty");
  if (!circuitIds.length) warnings.push("circuitIds_empty");

  return {
    parentId: parent.id,
    parent,
    linkedChildren,
    linkedChildrenIds,
    scope: {
      driverIds,
      assistantIds,
      circuitIds,
      securityScopeVersion: 1,
      securityScopeUpdatedAt: now,
      securityScopeSource: "lot4a-parent-scope-migration"
    },
    previousScope: Object.fromEntries(SCOPE_FIELDS.map((field) => [field, parent[field]])),
    warnings
  };
}

function hasScopeChanges(item = {}) {
  return SCOPE_FIELDS.some((field) => {
    const before = JSON.stringify(item.previousScope[field] ?? null);
    const after = JSON.stringify(item.scope[field] ?? null);
    return before !== after;
  });
}

function summarize(items = []) {
  return {
    parents: items.length,
    parentsWithLinkedChildrenIds: items.filter((item) => item.linkedChildrenIds.length > 0).length,
    parentsFoundViaChildParentIds: items.filter((item) =>
      item.linkedChildren.some((child) => Array.isArray(child.parentIds) && child.parentIds.map(text).includes(text(item.parentId)))
    ).length,
    parentsWithoutChild: items.filter((item) => !item.linkedChildren.length).length,
    parentsWithoutTransportManagerId: items.filter((item) => !text(item.parent.transportManagerId)).length,
    parentsWithCalculableDriverIds: items.filter((item) => item.scope.driverIds.length > 0).length,
    parentsWithCalculableAssistantIds: items.filter((item) => item.scope.assistantIds.length > 0).length,
    parentsWithCalculableCircuitIds: items.filter((item) => item.scope.circuitIds.length > 0).length,
    parentsReady: items.filter((item) => !item.warnings.length).length,
    parentsIncomplete: items.filter((item) => item.warnings.length > 0).length,
    parentsChanged: items.filter(hasScopeChanges).length
  };
}

function printSection(title) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function printItem(item = {}) {
  console.log(`- parent ${item.parentId || "sans-id"}`);
  console.log(`  enfants lies: ${item.linkedChildren.map((child) => child.id).join(", ") || "aucun"}`);
  console.log(`  chauffeurs: ${item.scope.driverIds.join(", ") || "aucun"}`);
  console.log(`  convoyeuses: ${item.scope.assistantIds.join(", ") || "aucune"}`);
  console.log(`  circuits: ${item.scope.circuitIds.join(", ") || "aucun"}`);
  console.log(`  statut: ${item.warnings.length ? `incomplet (${item.warnings.join(", ")})` : "pret"}`);
}

function rollbackPayload(items = [], inputDir = "") {
  return {
    generatedAt: new Date().toISOString(),
    source: "lot4a-parent-scope-migration",
    inputDir,
    collection: "parents",
    fields: SCOPE_FIELDS,
    documents: items.map((item) => ({
      id: item.parentId,
      path: `parents/${item.parentId}`,
      previousScope: item.previousScope,
      appliedScope: item.scope
    }))
  };
}

async function writeRollbackFile(items = [], inputDir = "") {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputDir = path.join(backupRoot, "rollback");
  const outputFile = path.join(outputDir, `parent-scopes-v2-${timestamp}.json`);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputFile, `${JSON.stringify(rollbackPayload(items, inputDir), null, 2)}\n`, "utf8");
  return outputFile;
}

async function firebaseConfig() {
  const envFile = await fs.readFile(envPath, "utf8").catch(() => "");
  const env = { ...parseEnv(envFile), ...process.env };
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
  };
  const missing = Object.entries(config).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error(`Configuration Firebase incomplete : ${missing.join(", ")}`);
  return config;
}

async function writeScopes(items = [], inputDir = "") {
  const rollbackFile = await writeRollbackFile(items, inputDir);
  const app = initializeApp(await firebaseConfig(), "gts-parent-scopes-v2");
  const db = getFirestore(app);
  for (const item of items) {
    if (!item.parentId) continue;
    await setDoc(doc(db, "parents", item.parentId), item.scope, { merge: true });
    console.log(`written: parents/${item.parentId}`);
  }
  return rollbackFile;
}

async function main() {
  const args = parseArgs();
  const now = new Date().toISOString();
  const { inputDir, parents, students } = await loadBackup(args.input);
  const items = parents.map((parent) => scopeForParent(parent, students, now));
  const summary = summarize(items);
  const changedItems = items.filter(hasScopeChanges);

  printSection("Lot 4A parents scopes V2");
  console.log(`Mode: ${args.write ? "WRITE" : "DRY-RUN"}`);
  console.log(`Source: ${path.relative(projectRoot, inputDir) || inputDir}`);
  console.log(`Parents: ${summary.parents}`);
  console.log(`Eleves children/students: ${students.length}`);

  printSection("Resume");
  Object.entries(summary).forEach(([key, value]) => console.log(`${key}: ${value}`));

  printSection("Parents prets");
  items.filter((item) => !item.warnings.length).slice(0, args.limit).forEach(printItem);

  printSection("Parents incomplets");
  items.filter((item) => item.warnings.length).slice(0, args.limit).forEach(printItem);

  if (args.showDocs) {
    printSection("Documents proposes");
    changedItems.slice(0, args.limit).forEach((item) => {
      console.log(`parents/${item.parentId}`);
      console.log(JSON.stringify(item.scope, null, 2));
    });
  }

  if (!args.write) {
    printSection("Dry-run");
    console.log("Aucune ecriture Firestore effectuee.");
    console.log("Commande future --write :");
    console.log(`node scripts/prepare-parent-scopes-v2.js --input ${path.relative(projectRoot, inputDir)} --write`);
    return;
  }

  if (!args.input) {
    throw new Error("Le mode --write exige un dossier --input explicite.");
  }
  const rollbackFile = await writeScopes(changedItems, inputDir);
  printSection("Write");
  console.log(`Documents ecrits: ${changedItems.length}`);
  console.log(`Rollback genere: ${path.relative(projectRoot, rollbackFile)}`);
}

main().catch((error) => {
  console.error("Preparation des scopes parents V2 impossible.");
  console.error(error?.message || error);
  process.exitCode = 1;
});
