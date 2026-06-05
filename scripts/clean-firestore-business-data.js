import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env.local");

const confirmDelete = process.argv.includes("--confirm-clean");
const dryRun = !confirmDelete;

const collectionsToClear = [
  "students",
  "children",
  "parents",
  "drivers",
  "assistants",
  "vehicles",
  "schools",
  "circuits",
  "transportManagers",
  "incidents",
  "studentIssues",
  "studentMedical",
  "studentSensitive",
  "studentAbsences",
  "privateMessages",
  "teamMessages",
  "directMessages",
  "roleAnnouncements",
  "supportRequests",
  "accessRequests",
  "parentChangeRequests",
  "replacementRules",
  "transportTransfers",
  "transferDelays",
  "vehicleRepairs",
  "vehicleReports",
  "anomalies",
  "leaveRequests",
  "poolTransport",
  "extraSchoolTransport",
  "extraTransports",
  "historyLogs",
  "loginLogs",
  "securityLogs",
  "connectionLogs",
  "notifications",
  "smsAlerts",
  "pdfExports",
  "temporarySupportAccess",
  "temporarySupportAccessLogs"
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

function isPrimarySystemAdmin(user = {}) {
  return user.id === "admin"
    || user.identifierNumber === "6183"
    || user.identifier === "6183"
    || user.adminType === "system"
    || user.role === "system_admin"
    || user.role === "admin_system";
}

function isSupportAccount(user = {}) {
  return user.id === "support" || user.role === "support" || user.identifierNumber === "1990" || user.identifier === "1990";
}

function publicSafeUser(user = {}) {
  return {
    ...user,
    isActive: user.isActive !== false,
    updatedAt: new Date().toISOString(),
    updatedBy: "cleanup-script"
  };
}

async function collectionDocs(db, collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, data: docSnap.data() }));
}

async function deleteDocuments(db, collectionName, docs) {
  if (dryRun || docs.length === 0) return;
  for (const item of docs) {
    await deleteDoc(doc(db, collectionName, item.id));
  }
}

async function cleanUsers(db) {
  const docs = await collectionDocs(db, "users");
  const keep = docs.filter((item) => isPrimarySystemAdmin({ id: item.id, ...item.data }) || isSupportAccount({ id: item.id, ...item.data }));
  const remove = docs.filter((item) => !keep.some((kept) => kept.id === item.id));
  console.log(`${dryRun ? "Aperçu" : "Nettoyage"} users: ${remove.length} supprimé(s), ${keep.length} conservé(s)`);
  if (!dryRun) {
    await deleteDocuments(db, "users", remove);
    await Promise.all(keep.map((item) => setDoc(doc(db, "users", item.id), publicSafeUser({ id: item.id, ...item.data }), { merge: true })));
  }
  return { collection: "users", removed: remove.length, kept: keep.length };
}

async function cleanCollection(db, collectionName) {
  const docs = await collectionDocs(db, collectionName);
  console.log(`${dryRun ? "Aperçu" : "Nettoyage"} ${collectionName}: ${docs.length} document(s) à supprimer`);
  await deleteDocuments(db, collectionName, docs);
  return { collection: collectionName, removed: docs.length, kept: 0 };
}

async function main() {
  const app = initializeApp(await loadFirebaseConfig());
  const db = getFirestore(app);
  console.log(dryRun ? "Mode aperçu seulement. Rien ne sera supprimé." : "MODE SUPPRESSION CONFIRMÉ.");
  console.log(`Projet Firebase: ${app.options.projectId}`);
  const results = [];
  results.push(await cleanUsers(db));
  for (const collectionName of collectionsToClear) {
    results.push(await cleanCollection(db, collectionName));
  }
  const totalRemoved = results.reduce((sum, item) => sum + item.removed, 0);
  const totalKept = results.reduce((sum, item) => sum + item.kept, 0);
  console.log(`${dryRun ? "Aperçu terminé" : "Nettoyage terminé"} : ${totalRemoved} document(s) supprimable(s), ${totalKept} conservé(s).`);
  if (dryRun) {
    console.log("Pour supprimer réellement : npm run clean:firestore -- --confirm-clean");
  }
}

main().catch((error) => {
  console.error("Nettoyage Firestore impossible.");
  console.error(error.message || error);
  process.exitCode = 1;
});
