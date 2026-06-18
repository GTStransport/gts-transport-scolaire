import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const backupsRoot = path.join(projectRoot, "backups");
const envPath = path.join(projectRoot, ".env.local");

const sourceCollections = [
  "transportTransfers",
  "children",
  "students",
  "circuits",
  "schools"
];

function parseArgs(argv = process.argv.slice(2)) {
  const args = { input: "", limit: 50, write: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") args.input = argv[index + 1] || "";
    if (arg === "--limit") args.limit = Number(argv[index + 1] || 50);
    if (arg === "--write") args.write = true;
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

function slugify(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "unknown";
}

function text(value = "") {
  return String(value || "").trim();
}

function unique(values = []) {
  return [...new Set(values.map(text).filter(Boolean))];
}

function firstNonEmpty(values = []) {
  return values.map(text).find(Boolean) || "";
}

function normalizeBackupDocuments(payload = {}) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.documents)) {
    return payload.documents.map((entry) => ({ id: entry.id, ...(entry.data || {}) }));
  }
  return [];
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function latestBackupDir() {
  const entries = await fs.readdir(backupsRoot, { withFileTypes: true }).catch(() => []);
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const fullPath = path.join(backupsRoot, entry.name);
    const stat = await fs.stat(fullPath).catch(() => null);
    if (stat) dirs.push({ path: fullPath, mtimeMs: stat.mtimeMs });
  }
  dirs.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return dirs[0]?.path || "";
}

async function loadCollection(inputDir, collectionName) {
  const payload = await readJson(path.join(inputDir, `${collectionName}.json`)).catch(() => null);
  return payload ? normalizeBackupDocuments(payload) : [];
}

async function loadLegacyData(inputPath = "") {
  const resolvedInput = inputPath ? path.resolve(projectRoot, inputPath) : await latestBackupDir();
  if (!resolvedInput) throw new Error("Aucune sauvegarde locale trouvée. Utiliser --input <dossier>.");
  const stat = await fs.stat(resolvedInput).catch(() => null);
  if (!stat || !stat.isDirectory()) throw new Error(`Dossier source introuvable : ${resolvedInput}`);
  const entries = await Promise.all(sourceCollections.map(async (name) => [name, await loadCollection(resolvedInput, name)]));
  return {
    source: path.relative(projectRoot, resolvedInput),
    data: Object.fromEntries(entries)
  };
}

function transferKey(record = {}) {
  const label = firstNonEmpty([
    record.transferName,
    record.transferLocation,
    record.location,
    record.name,
    record.label
  ]);
  const manager = firstNonEmpty([record.transportManagerId, "unknown-manager"]);
  return `${manager}:${slugify(label)}`;
}

function circuitRefsForChild(child = {}) {
  return unique([
    child.circuitNumber,
    child.pickupCircuitId,
    child.schoolCircuitId,
    child.transferCircuitId,
    child.transferSchoolCircuitId
  ]);
}

function circuitByRef(ref, circuits = []) {
  const value = text(ref);
  if (!value) return null;
  return circuits.find((circuit) => circuit.id === value || circuit.name === value || circuit.circuitNumber === value) || null;
}

function childHasTransfer(child = {}) {
  return child.hasTransfer === true
    || child.changesBusAtTransfer === true
    || child.staysInSameBus === false
    || !!text(child.transferLocation)
    || !!text(child.transferName)
    || !!text(child.transferCircuit)
    || !!text(child.transferCircuitId)
    || !!text(child.transferSchoolCircuitId);
}

function schoolIdsForRecord(record = {}, schools = []) {
  const names = unique([
    record.schoolName,
    ...(Array.isArray(record.schoolNames) ? record.schoolNames : [])
  ]);
  return unique([
    record.schoolId,
    ...(Array.isArray(record.schoolIds) ? record.schoolIds : []),
    ...schools.filter((school) => names.includes(school.name)).map((school) => school.id)
  ]);
}

function baseHubFromRecord(record = {}, source = "legacy") {
  const label = firstNonEmpty([
    record.transferName,
    record.transferLocation,
    record.location,
    record.name,
    record.label
  ]);
  return {
    id: firstNonEmpty([record.transferHubId, record.transferId, record.id, `transfer-hub-${slugify(label)}`]),
    name: firstNonEmpty([record.transferName, label]),
    label,
    locationLabel: firstNonEmpty([record.transferLocation, record.location, label]),
    address: firstNonEmpty([record.transferAddress, record.address]),
    transportManagerIds: unique([record.transportManagerId]),
    circuitIds: unique([record.circuitId, record.transferCircuitId, record.transferSchoolCircuitId]),
    schoolIds: unique([...(Array.isArray(record.schoolIds) ? record.schoolIds : []), record.schoolId]),
    driverIds: unique([...(Array.isArray(record.driverIds) ? record.driverIds : []), record.driverId]),
    assistantIds: unique([record.assistantId, record.convoyeurId, record.transferAssistantId]),
    studentIds: unique([...(Array.isArray(record.studentsIds) ? record.studentsIds : []), ...(Array.isArray(record.studentIds) ? record.studentIds : [])]),
    parentIds: unique([...(Array.isArray(record.parentIds) ? record.parentIds : [])]),
    active: record.active !== false,
    source,
    migrationStatus: "ready_for_review",
    legacyRefs: unique([record.id, record.transferId])
  };
}

function mergeHub(target = {}, incoming = {}) {
  return {
    ...target,
    name: firstNonEmpty([target.name, incoming.name]),
    label: firstNonEmpty([target.label, incoming.label]),
    locationLabel: firstNonEmpty([target.locationLabel, incoming.locationLabel]),
    address: firstNonEmpty([target.address, incoming.address]),
    transportManagerIds: unique([...(target.transportManagerIds || []), ...(incoming.transportManagerIds || [])]),
    circuitIds: unique([...(target.circuitIds || []), ...(incoming.circuitIds || [])]),
    schoolIds: unique([...(target.schoolIds || []), ...(incoming.schoolIds || [])]),
    driverIds: unique([...(target.driverIds || []), ...(incoming.driverIds || [])]),
    assistantIds: unique([...(target.assistantIds || []), ...(incoming.assistantIds || [])]),
    studentIds: unique([...(target.studentIds || []), ...(incoming.studentIds || [])]),
    parentIds: unique([...(target.parentIds || []), ...(incoming.parentIds || [])]),
    active: target.active !== false && incoming.active !== false,
    source: unique([target.source, incoming.source]).join("+"),
    migrationStatus: target.migrationStatus || incoming.migrationStatus || "ready_for_review",
    legacyRefs: unique([...(target.legacyRefs || []), ...(incoming.legacyRefs || [])])
  };
}

function normalizeTransferHub(hub = {}) {
  const label = firstNonEmpty([hub.label, hub.name, hub.locationLabel]);
  return {
    id: text(hub.id) || `transfer-hub-${slugify(label)}`,
    name: firstNonEmpty([hub.name, label]),
    label,
    locationLabel: firstNonEmpty([hub.locationLabel, label]),
    address: text(hub.address),
    transportManagerIds: unique(hub.transportManagerIds || []),
    circuitIds: unique(hub.circuitIds || []),
    schoolIds: unique(hub.schoolIds || []),
    driverIds: unique(hub.driverIds || []),
    assistantIds: unique(hub.assistantIds || []),
    studentIds: unique(hub.studentIds || []),
    parentIds: unique(hub.parentIds || []),
    active: hub.active !== false,
    source: firstNonEmpty([hub.source, "legacy_transfer_import"]),
    migrationStatus: firstNonEmpty([hub.migrationStatus, "ready_for_review"]),
    legacyRefs: unique(hub.legacyRefs || [])
  };
}

function validateTransferHub(hub = {}) {
  const errors = [];
  if (!text(hub.id)) errors.push("id_missing");
  if (!text(hub.name)) errors.push("name_missing");
  if (!text(hub.label)) errors.push("label_missing");
  if (!Array.isArray(hub.transportManagerIds) || hub.transportManagerIds.length === 0) errors.push("transport_manager_ids_missing");
  if (typeof hub.active !== "boolean") errors.push("active_missing");
  return errors;
}

function addCandidate(candidates, duplicates, rawHub, reason = "") {
  const hub = normalizeTransferHub(rawHub);
  const key = transferKey(hub);
  const existing = candidates.get(key);
  if (existing) {
    duplicates.push({ key, existingId: existing.id, incomingId: hub.id, reason });
    candidates.set(key, normalizeTransferHub(mergeHub(existing, hub)));
  } else {
    candidates.set(key, hub);
  }
}

function detectTransferHubs(data = {}) {
  const candidates = new Map();
  const ignored = [];
  const duplicates = [];
  const circuits = data.circuits || [];
  const schools = data.schools || [];
  const children = [...(data.children || []), ...(data.students || [])]
    .filter((child, index, list) => child?.id && list.findIndex((item) => item.id === child.id) === index);

  (data.transportTransfers || []).forEach((transfer) => {
    const rawHub = baseHubFromRecord(transfer, "transportTransfers");
    if (!rawHub.label) {
      ignored.push({ source: "transportTransfers", id: transfer.id || transfer.transferId || "", reason: "missing_transfer_label" });
      return;
    }
    addCandidate(candidates, duplicates, rawHub, "same_manager_and_label");
  });

  children.forEach((child) => {
    if (!childHasTransfer(child)) return;
    const label = firstNonEmpty([child.transferName, child.transferLocation, child.transferCircuit]);
    if (!label) {
      ignored.push({ source: "children", id: child.id, reason: "transfer_without_label" });
      return;
    }
    const circuitRefs = circuitRefsForChild(child);
    const relatedCircuits = circuitRefs.map((ref) => circuitByRef(ref, circuits)).filter(Boolean);
    const rawHub = baseHubFromRecord({
      id: `child-transfer-${child.id}`,
      transferName: child.transferName || label,
      transferLocation: child.transferLocation || label,
      transportManagerId: firstNonEmpty([child.transportManagerId, ...relatedCircuits.map((circuit) => circuit.transportManagerId)]),
      circuitId: firstNonEmpty([child.transferCircuitId, child.pickupCircuitId, child.circuitNumber]),
      transferSchoolCircuitId: child.transferSchoolCircuitId,
      schoolId: child.schoolId,
      schoolIds: unique([child.schoolId, ...relatedCircuits.flatMap((circuit) => schoolIdsForRecord(circuit, schools))]),
      driverIds: unique([
        ...(Array.isArray(child.driverIds) ? child.driverIds : []),
        child.driverId,
        child.transferDriverId,
        ...relatedCircuits.flatMap((circuit) => Array.isArray(circuit.driverIds) ? circuit.driverIds : [circuit.driverId])
      ]),
      assistantId: firstNonEmpty([child.assistantId, child.transferAssistantId, ...relatedCircuits.map((circuit) => circuit.assistantId)]),
      studentsIds: [child.id],
      parentIds: child.parentIds || []
    }, "children");
    addCandidate(candidates, duplicates, rawHub, "same_manager_and_label");
  });

  circuits.forEach((circuit) => {
    if (!text(circuit.transferName)) return;
    const rawHub = baseHubFromRecord({
      id: `circuit-transfer-${circuit.id || slugify(circuit.name)}`,
      transferName: circuit.transferName,
      transportManagerId: circuit.transportManagerId,
      circuitId: circuit.id || circuit.name,
      schoolIds: schoolIdsForRecord(circuit, schools),
      driverIds: Array.isArray(circuit.driverIds) ? circuit.driverIds : [circuit.driverId],
      assistantId: circuit.assistantId
    }, "circuits");
    addCandidate(candidates, duplicates, rawHub, "same_manager_and_label");
  });

  const hubs = [...candidates.values()].map(normalizeTransferHub);
  const ready = [];
  const errors = [];
  hubs.forEach((hub) => {
    const hubErrors = validateTransferHub(hub);
    if (hubErrors.length) errors.push({ id: hub.id, label: hub.label, errors: hubErrors });
    else ready.push(hub);
  });
  return { hubs, ready, ignored, duplicates, errors };
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

async function writeTransferHubs(hubs = []) {
  const [{ initializeApp }, { doc, getFirestore, setDoc }] = await Promise.all([
    import("firebase/app"),
    import("firebase/firestore")
  ]);
  const app = initializeApp(await firebaseConfig(), "gts-transfer-hubs-v2");
  const db = getFirestore(app);
  for (const hub of hubs) {
    await setDoc(doc(db, "transferHubs", hub.id), hub, { merge: false });
    console.log(`written: transferHubs/${hub.id}`);
  }
}

function printSection(title) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function printHub(hub) {
  console.log(`- ${hub.label} (${hub.id})`);
  console.log(`  transportManagerIds: ${hub.transportManagerIds.join(", ") || "n/a"}`);
  console.log(`  circuits: ${hub.circuitIds.join(", ") || "n/a"}`);
  console.log(`  élèves: ${hub.studentIds.length}`);
  console.log(`  source: ${hub.source}`);
}

async function main() {
  const args = parseArgs();
  const { source, data } = await loadLegacyData(args.input);
  const result = detectTransferHubs(data);

  console.log("Création transferHubs GTS V2");
  console.log("============================");
  console.log(`Source: ${source}`);
  console.log(`Mode: ${args.write ? "WRITE EXPLICITE" : "DRY-RUN uniquement"}`);
  console.log("Collection cible: transferHubs uniquement");
  console.log("Aucune création de tripSegments, stopPassages ou studentAssignments.");

  printSection("Hubs détectés");
  console.log(`Détectés: ${result.hubs.length}`);
  console.log(`Prêts: ${result.ready.length}`);
  console.log(`Ignorés: ${result.ignored.length}`);
  console.log(`Doublons fusionnés: ${result.duplicates.length}`);
  console.log(`Erreurs: ${result.errors.length}`);

  printSection("Hubs prêts");
  if (!result.ready.length) console.log("Aucun.");
  result.ready.slice(0, args.limit).forEach(printHub);
  if (result.ready.length > args.limit) console.log(`... ${result.ready.length - args.limit} autre(s) hub(s) non affiché(s).`);

  printSection("Ignorés");
  if (!result.ignored.length) console.log("Aucun.");
  result.ignored.slice(0, args.limit).forEach((item) => {
    console.log(`- ${item.source}/${item.id || "sans-id"}: ${item.reason}`);
  });

  printSection("Doublons");
  if (!result.duplicates.length) console.log("Aucun.");
  result.duplicates.slice(0, args.limit).forEach((item) => {
    console.log(`- ${item.key}: ${item.incomingId} fusionné avec ${item.existingId} (${item.reason})`);
  });

  printSection("Erreurs");
  if (!result.errors.length) console.log("Aucune.");
  result.errors.slice(0, args.limit).forEach((item) => {
    console.log(`- ${item.id || item.label || "hub sans identifiant"}: ${item.errors.join(", ")}`);
  });

  printSection(args.write ? "Écriture Firestore" : "Plan d'écriture dry-run");
  if (!result.ready.length) {
    console.log("Aucun document prêt à écrire.");
  } else {
    result.ready.slice(0, args.limit).forEach((hub) => console.log(`${args.write ? "will_write" : "would_write"}: transferHubs/${hub.id}`));
    if (result.ready.length > args.limit) console.log(`... ${result.ready.length - args.limit} autre(s) écriture(s) non affichée(s).`);
  }

  if (args.write) {
    if (result.errors.length) throw new Error("Écriture bloquée : des hubs contiennent des erreurs.");
    await writeTransferHubs(result.ready);
  }

  printSection("Commande écriture future");
  console.log(`node scripts/create-transfer-hubs-v2.js --input ${source} --write`);

  printSection("Conclusion");
  if (args.write) console.log("Écriture terminée pour transferHubs uniquement.");
  else console.log("Dry-run terminé. Aucune écriture Firestore effectuée.");
}

main().catch((error) => {
  console.error("Création transferHubs GTS V2 impossible.");
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
