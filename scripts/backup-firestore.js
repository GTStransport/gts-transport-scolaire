import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env.local");
const backupRoot = path.join(projectRoot, "backups");
const retentionDays = Number(process.env.GTS_BACKUP_RETENTION_DAYS || 30);

const collectionsToBackup = [
  "students",
  "children",
  "users",
  "parents",
  "transportManagers",
  "circuits",
  "schools",
  "vehicles",
  "drivers",
  "assistants",
  "messages",
  "privateMessages",
  "teamMessages",
  "directMessages",
  "studentMedical",
  "studentSensitive",
  "studentIssues",
  "studentAbsences",
  "parentChangeRequests",
  "transportTransfers",
  "transferDelays",
  "supportRequests",
  "supportReports",
  "supportPermissions",
  "accessRequests",
  "historyLogs",
  "securityLogs",
  "loginLogs",
  "serviceStatus",
  "settings"
];

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

async function loadFirebaseConfig() {
  const envFile = await fs.readFile(envPath, "utf8").catch(() => "");
  const env = { ...parseEnv(envFile), ...process.env };
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
  };
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missingKeys.length) {
    throw new Error(`Configuration Firebase incomplete dans .env.local : ${missingKeys.join(", ")}`);
  }
  return firebaseConfig;
}

function backupFolderName(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
}

function normalizeFirestoreValue(value) {
  if (!value) return value;
  if (typeof value.toDate === "function" && typeof value.seconds === "number") {
    return {
      __type: "timestamp",
      iso: value.toDate().toISOString(),
      seconds: value.seconds,
      nanoseconds: value.nanoseconds
    };
  }
  if (Array.isArray(value)) return value.map((item) => normalizeFirestoreValue(item));
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeFirestoreValue(nestedValue)])
    );
  }
  return value;
}

async function backupCollection(db, collectionName, outputDir, exportedAt) {
  const snapshot = await getDocs(collection(db, collectionName));
  const documents = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    path: `${collectionName}/${docSnap.id}`,
    data: normalizeFirestoreValue(docSnap.data())
  }));
  const payload = {
    collection: collectionName,
    exportedAt,
    count: documents.length,
    documents
  };
  const outputFile = path.join(outputDir, `${collectionName}.json`);
  await fs.writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return { collection: collectionName, count: documents.length, file: outputFile };
}

async function cleanupOldBackups() {
  if (!Number.isFinite(retentionDays) || retentionDays <= 0) return [];
  const entries = await fs.readdir(backupRoot, { withFileTypes: true }).catch(() => []);
  const threshold = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const removed = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const fullPath = path.join(backupRoot, entry.name);
    const stat = await fs.stat(fullPath).catch(() => null);
    if (!stat || stat.mtimeMs >= threshold) continue;
    await fs.rm(fullPath, { recursive: true, force: true });
    removed.push(entry.name);
  }
  return removed;
}

async function main() {
  const exportedAt = new Date().toISOString();
  const outputDir = path.join(backupRoot, backupFolderName());
  await fs.mkdir(outputDir, { recursive: true });

  const app = initializeApp(await loadFirebaseConfig());
  const db = getFirestore(app);
  const results = [];

  for (const collectionName of collectionsToBackup) {
    const result = await backupCollection(db, collectionName, outputDir, exportedAt);
    results.push(result);
    console.log(`✓ ${collectionName}: ${result.count} document(s)`);
  }

  const manifest = {
    exportedAt,
    projectId: app.options.projectId,
    outputDir,
    retentionDays,
    collections: results.map((result) => ({
      name: result.collection,
      count: result.count,
      file: path.relative(projectRoot, result.file)
    }))
  };
  await fs.writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  const removed = await cleanupOldBackups();
  if (removed.length) console.log(`Anciennes sauvegardes supprimées (${retentionDays} j) : ${removed.join(", ")}`);
  console.log(`Sauvegarde terminee : ${path.relative(projectRoot, outputDir)}`);
}

main().catch((error) => {
  console.error("Sauvegarde Firestore impossible.");
  console.error(error.message || error);
  process.exitCode = 1;
});
