import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGtsV2DryRunPlan } from "./dry-run-gts-v2-migration.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env.local");

const requiredFields = [
  "id",
  "studentId",
  "transportManagerId",
  "direction",
  "transportType",
  "weekPattern",
  "validDays",
  "pickupPassageId",
  "dropoffPassageId",
  "passageIds",
  "tripSegmentIds",
  "circuitIds",
  "active"
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

function text(value = "") {
  return String(value || "").trim();
}

function hasField(document = {}, fieldPath = "") {
  const value = fieldPath.split(".").reduce((current, key) => (current && typeof current === "object" ? current[key] : undefined), document);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return value !== undefined && value !== null;
}

function unique(values = []) {
  return [...new Set(values.map(text).filter(Boolean))];
}

function assignmentKey(assignment = {}) {
  return [
    assignment.studentId,
    assignment.transportManagerId,
    assignment.direction,
    assignment.weekPattern,
    assignment.transportType,
    ...(assignment.passageIds || []),
    ...(assignment.tripSegmentIds || [])
  ].map(text).join("|");
}

function detectDuplicates(assignments = []) {
  const byId = new Map();
  const byKey = new Map();
  const duplicates = [];
  assignments.forEach((assignment) => {
    if (assignment.id && byId.has(assignment.id)) {
      duplicates.push({
        type: "id",
        key: assignment.id,
        existingId: byId.get(assignment.id).id,
        incomingId: assignment.id
      });
    } else if (assignment.id) {
      byId.set(assignment.id, assignment);
    }
    const key = assignmentKey(assignment);
    if (key && byKey.has(key) && byKey.get(key).id !== assignment.id) {
      duplicates.push({
        type: "semantic",
        key,
        existingId: byKey.get(key).id,
        incomingId: assignment.id
      });
    } else if (key) {
      byKey.set(key, assignment);
    }
  });
  return duplicates;
}

function validateAssignment(assignment = {}, generated, helpers) {
  const missingRequired = requiredFields.filter((field) => !hasField(assignment, field));
  const errors = [];
  const warnings = [];
  const incomplete = [];
  const passageIds = unique(assignment.passageIds || []);
  const tripSegmentIds = unique(assignment.tripSegmentIds || []);
  const stopPassages = generated.stopPassages || new Map();
  const tripSegments = generated.tripSegments || new Map();

  if (!helpers.isValidStudentAssignment(assignment)) errors.push("assignment_invalid");
  missingRequired.forEach((field) => errors.push(`${field}_missing`));

  if (!passageIds.includes(assignment.pickupPassageId)) errors.push("pickup_passage_not_in_passage_ids");
  if (!passageIds.includes(assignment.dropoffPassageId)) errors.push("dropoff_passage_not_in_passage_ids");

  passageIds.forEach((passageId) => {
    const passage = stopPassages.get(passageId);
    if (!passage) {
      incomplete.push(`missing_passage:${passageId}`);
      return;
    }
    if (!helpers.isValidStopPassage(passage)) incomplete.push(`invalid_passage:${passageId}`);
  });

  tripSegmentIds.forEach((segmentId) => {
    const segment = tripSegments.get(segmentId);
    if (!segment) {
      incomplete.push(`missing_trip_segment:${segmentId}`);
      return;
    }
    if (!helpers.isValidTripSegment(segment)) incomplete.push(`invalid_trip_segment:${segmentId}`);
  });

  if (!Array.isArray(assignment.driverIds) || !assignment.driverIds.length) warnings.push("driver_ids_missing");
  if (!Array.isArray(assignment.vehicleIds) || !assignment.vehicleIds.length) warnings.push("vehicle_ids_missing");
  if (!Array.isArray(assignment.parentIds) || !assignment.parentIds.length) warnings.push("parent_ids_missing");
  if (assignment.weekPattern !== "all" && !assignment.activeParentKey) warnings.push("active_parent_key_missing");

  let status = "ready";
  if (errors.length) status = "incoherent";
  else if (incomplete.length || warnings.length) status = "incomplete";

  return {
    id: assignment.id || "",
    assignment,
    status,
    errors,
    incomplete,
    warnings
  };
}

function collectAssignments(results = []) {
  return results.flatMap((result) => result.studentAssignments || []);
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

async function writeStudentAssignments(assignments = []) {
  const [{ initializeApp }, { doc, getFirestore, setDoc }] = await Promise.all([
    import("firebase/app"),
    import("firebase/firestore")
  ]);
  const app = initializeApp(await firebaseConfig(), "gts-student-assignments-v2");
  const db = getFirestore(app);
  for (const assignment of assignments) {
    await setDoc(doc(db, "studentAssignments", assignment.id), assignment, { merge: false });
    console.log(`written: studentAssignments/${assignment.id}`);
  }
}

function printSection(title) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function printAssignment(assignment) {
  console.log(`- ${assignment.studentId} (${assignment.id})`);
  console.log(`  type: ${assignment.transportType}, direction: ${assignment.direction}, semaine: ${assignment.weekPattern}`);
  console.log(`  passages: ${(assignment.passageIds || []).join(", ") || "n/a"}`);
  console.log(`  segments: ${(assignment.tripSegmentIds || []).join(", ") || "n/a"}`);
  console.log(`  circuits: ${(assignment.circuitIds || []).join(", ") || "n/a"}`);
  console.log(`  chauffeurs: ${(assignment.driverIds || []).join(", ") || "n/a"}, véhicules: ${(assignment.vehicleIds || []).join(", ") || "n/a"}`);
}

function printValidation(item) {
  console.log(`- ${item.assignment.studentId || "student n/a"} (${item.id || "sans-id"})`);
  if (item.errors.length) console.log(`  erreurs: ${item.errors.join(", ")}`);
  if (item.incomplete.length) console.log(`  incomplet: ${item.incomplete.join(", ")}`);
  if (item.warnings.length) console.log(`  avertissements: ${item.warnings.join(", ")}`);
}

async function main() {
  const args = parseArgs();
  const plan = await createGtsV2DryRunPlan({ input: args.input });
  const assignments = collectAssignments(plan.results);
  const duplicates = detectDuplicates(assignments);
  const validations = assignments.map((assignment) => validateAssignment(assignment, plan.generated, plan.helpers));
  const ready = validations.filter((item) => item.status === "ready");
  const incomplete = validations.filter((item) => item.status === "incomplete");
  const incoherent = validations.filter((item) => item.status === "incoherent");

  console.log("Création studentAssignments GTS V2");
  console.log("==================================");
  console.log(`Source: ${plan.source}`);
  console.log(`Mode: ${args.write ? "WRITE EXPLICITE" : "DRY-RUN uniquement"}`);
  console.log("Collection cible: studentAssignments uniquement");
  console.log("Aucune création de transferHubs, tripSegments ou stopPassages.");

  printSection("Assignments détectés");
  console.log(`Détectés: ${assignments.length}`);
  console.log(`Prêts: ${ready.length}`);
  console.log(`Incomplets: ${incomplete.length}`);
  console.log(`Doublons: ${duplicates.length}`);
  console.log(`Incohérences: ${incoherent.length}`);

  printSection("Assignments prêts");
  if (!ready.length) console.log("Aucun.");
  ready.slice(0, args.limit).forEach((item) => printAssignment(item.assignment));
  if (ready.length > args.limit) console.log(`... ${ready.length - args.limit} autre(s) assignment(s) non affiché(s).`);

  printSection("Assignments incomplets");
  if (!incomplete.length) console.log("Aucun.");
  incomplete.slice(0, args.limit).forEach(printValidation);
  if (incomplete.length > args.limit) console.log(`... ${incomplete.length - args.limit} autre(s) assignment(s) incomplet(s) non affiché(s).`);

  printSection("Doublons");
  if (!duplicates.length) console.log("Aucun.");
  duplicates.slice(0, args.limit).forEach((item) => {
    console.log(`- ${item.type}:${item.key} ${item.incomingId} en doublon avec ${item.existingId}`);
  });

  printSection("Incohérences");
  if (!incoherent.length) console.log("Aucune.");
  incoherent.slice(0, args.limit).forEach(printValidation);
  if (incoherent.length > args.limit) console.log(`... ${incoherent.length - args.limit} autre(s) incohérence(s) non affichée(s).`);

  printSection(args.write ? "Écriture Firestore" : "Plan d'écriture dry-run");
  if (!ready.length) {
    console.log("Aucun document prêt à écrire.");
  } else {
    ready.slice(0, args.limit).forEach((item) => console.log(`${args.write ? "will_write" : "would_write"}: studentAssignments/${item.assignment.id}`));
    if (ready.length > args.limit) console.log(`... ${ready.length - args.limit} autre(s) écriture(s) non affichée(s).`);
  }

  if (args.write) {
    if (duplicates.length || incoherent.length || incomplete.length) {
      throw new Error("Écriture bloquée : doublons, incohérences ou assignments incomplets détectés.");
    }
    await writeStudentAssignments(ready.map((item) => item.assignment));
  }

  printSection("Commande écriture future");
  console.log(`node scripts/create-student-assignments-v2.js --input ${plan.source} --write`);

  printSection("Conclusion");
  if (args.write) console.log("Écriture terminée pour studentAssignments uniquement.");
  else console.log("Dry-run terminé. Aucune écriture Firestore effectuée.");
}

main().catch((error) => {
  console.error("Création studentAssignments GTS V2 impossible.");
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
