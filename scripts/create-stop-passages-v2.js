import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const backupsRoot = path.join(projectRoot, "backups");
const envPath = path.join(projectRoot, ".env.local");

const sourceCollections = [
  "children",
  "students",
  "circuits",
  "vehicles",
  "schools",
  "transportTransfers"
];

const validDirections = ["morning", "evening"];
const validTransportTypes = ["avec_transfert", "circuit_ferme", "porte_a_porte"];
const validWeekPatterns = ["all", "even", "odd"];
const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const validPointTypes = ["tec_stop", "transfer_hub", "school", "home_address", "custom_address"];
const validPassageTypes = ["pickup", "dropoff", "transfer_arrival", "transfer_departure", "school_arrival", "school_departure"];

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

function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(text(value));
}

function normalizeTime(value = "", fallback = "") {
  const candidate = text(value);
  if (isValidTime(candidate)) return candidate;
  return isValidTime(fallback) ? fallback : "";
}

function normalizePoint(point = {}) {
  return {
    type: validPointTypes.includes(point.type) ? point.type : "custom_address",
    id: text(point.id),
    label: text(point.label)
  };
}

function normalizeStopPassage(passage = {}) {
  const driverIds = unique(passage.driverIds || []);
  const assistantIds = unique(passage.assistantIds || []);
  const vehicleIds = unique(passage.vehicleIds || []);
  return {
    id: text(passage.id),
    transportManagerId: text(passage.transportManagerId),
    tripSegmentId: text(passage.tripSegmentId),
    circuitId: text(passage.circuitId),
    direction: validDirections.includes(passage.direction) ? passage.direction : "morning",
    transportType: validTransportTypes.includes(passage.transportType) ? passage.transportType : "circuit_ferme",
    passageType: validPassageTypes.includes(passage.passageType) ? passage.passageType : "pickup",
    stop: normalizePoint(passage.stop),
    plannedTime: text(passage.plannedTime),
    passageOrder: Number.isInteger(Number(passage.passageOrder)) ? Number(passage.passageOrder) : 0,
    validDays: Array.isArray(passage.validDays) ? passage.validDays.filter((day) => validDays.includes(day)) : [],
    weekPattern: validWeekPatterns.includes(passage.weekPattern) ? passage.weekPattern : "all",
    active: passage.active !== false,
    transferHubId: text(passage.transferHubId),
    schoolId: text(passage.schoolId),
    tecStopId: text(passage.tecStopId),
    vehicleId: text(passage.vehicleId || vehicleIds[0]),
    driverId: text(passage.driverId || driverIds[0]),
    assistantId: text(passage.assistantId || assistantIds[0]),
    driverIds,
    assistantIds,
    vehicleIds,
    studentIds: unique(passage.studentIds || []),
    parentIds: unique(passage.parentIds || []),
    isTransferPoint: passage.isTransferPoint === true,
    isTerminalPoint: passage.isTerminalPoint === true,
    isPmrHomePickup: passage.isPmrHomePickup === true,
    isPmrHomeDropoff: passage.isPmrHomeDropoff === true,
    source: firstNonEmpty([passage.source, "legacy_stop_passage_import"]),
    migrationStatus: firstNonEmpty([passage.migrationStatus, "ready_for_review"]),
    legacyChildIds: unique(passage.legacyChildIds || []),
    legacyRefs: unique(passage.legacyRefs || [])
  };
}

function validateStopPassage(passage = {}) {
  const errors = [];
  if (!text(passage.id)) errors.push("id_missing");
  if (!text(passage.transportManagerId)) errors.push("transport_manager_id_missing");
  if (!text(passage.tripSegmentId)) errors.push("trip_segment_id_missing");
  if (!text(passage.circuitId)) errors.push("circuit_id_missing");
  if (!validDirections.includes(passage.direction)) errors.push("direction_invalid");
  if (!validTransportTypes.includes(passage.transportType)) errors.push("transport_type_invalid");
  if (!validPassageTypes.includes(passage.passageType)) errors.push("passage_type_invalid");
  if (!validPointTypes.includes(passage.stop?.type) || !text(passage.stop?.label)) errors.push("stop_invalid");
  if (!isValidTime(passage.plannedTime)) errors.push("planned_time_invalid");
  if (!Number.isInteger(passage.passageOrder) || passage.passageOrder < 0) errors.push("passage_order_invalid");
  if (!Array.isArray(passage.validDays) || !passage.validDays.length) errors.push("valid_days_missing");
  if (!validWeekPatterns.includes(passage.weekPattern)) errors.push("week_pattern_invalid");
  if (passage.stop?.type === "transfer_hub" && !text(passage.transferHubId || passage.stop.id)) errors.push("transfer_hub_id_missing");
  if (passage.stop?.type === "school" && !text(passage.schoolId || passage.stop.id)) errors.push("school_id_missing");
  if (typeof passage.active !== "boolean") errors.push("active_missing");
  return errors;
}

function circuitByRef(ref, circuits = []) {
  const value = text(ref);
  if (!value) return null;
  return circuits.find((circuit) => circuit.id === value || circuit.name === value || circuit.circuitNumber === value) || null;
}

function vehicleByRef(ref, vehicles = []) {
  const value = text(ref);
  if (!value) return null;
  return vehicles.find((vehicle) => vehicle.id === value || vehicle.busNumber === value || vehicle.licensePlate === value) || null;
}

function vehicleForTrip(child = {}, circuit = {}, vehicles = []) {
  return vehicleByRef(child.vehicleId, vehicles)
    || vehicleByRef(circuit.vehicleId, vehicles)
    || vehicles.find((vehicle) => vehicle.circuitId === circuit.id || vehicle.circuitId === circuit.name)
    || null;
}

function driverIdsFromRecord(record = {}) {
  return unique([...(Array.isArray(record.driverIds) ? record.driverIds : []), record.driverId]);
}

function assistantIdsFromRecords(...records) {
  return unique(records.flatMap((record) => [record?.assistantId, record?.convoyeurId, record?.transferAssistantId]));
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

function schoolLabelForChild(child = {}, circuit = {}, schools = []) {
  const school = schools.find((item) => item.id === child.schoolId || item.name === child.schoolName || item.id === circuit.schoolId);
  return firstNonEmpty([school?.name, child.schoolName, child.school, circuit.schoolName, (circuit.schoolNames || [])[0]]);
}

function childHasTransfer(child = {}, circuit = {}) {
  return child.hasTransfer === true
    || child.changesBusAtTransfer === true
    || child.staysInSameBus === false
    || !!text(child.transferLocation)
    || !!text(child.transferName)
    || !!text(child.transferCircuit)
    || !!text(child.transferCircuitId)
    || !!text(child.transferSchoolCircuitId)
    || !!text(circuit.transferName);
}

function childIsPmr(child = {}) {
  return child.pmrRequired === true
    || child.requiresAdaptedVehicle === true
    || child.wheelchairRequired === true
    || child.hasWheelchair === true
    || String(child.mobilityHelp || "").toLowerCase().includes("fauteuil")
    || String(child.disability || child.handicap || "").toLowerCase().includes("pmr");
}

function weekPatternsForChild(child = {}) {
  const residence = child.alternatingResidence || {};
  const enabled = residence.enabled === true || child.alternatingCustody?.enabled === true;
  return enabled ? ["even", "odd"] : ["all"];
}

function pickupStopForWeek(child = {}, weekPattern = "all") {
  const residence = child.alternatingResidence || {};
  if (weekPattern === "even") return firstNonEmpty([residence.motherPickupStop, child.motherPickupStop, child.pickupStop]);
  if (weekPattern === "odd") return firstNonEmpty([residence.fatherPickupStop, child.fatherPickupStop, child.pickupStop]);
  return firstNonEmpty([child.pickupStop, residence.motherPickupStop, child.motherPickupStop]);
}

function validDaysForChild(child = {}) {
  return Array.isArray(child.transportDays) && child.transportDays.length
    ? child.transportDays.filter((day) => validDays.includes(day))
    : [...validDays];
}

function pickupTimeForChild(child = {}) {
  return normalizeTime(firstNonEmpty([
    child.morningPassageTime,
    child.morningPickupTime,
    child.pickupTime,
    child.plannedPickupTime,
    child.scheduleTime
  ]), "");
}

function transferHubIdFor(label = "") {
  return `transfer-hub-${slugify(label)}`;
}

function passageKey(passage = {}) {
  return [
    passage.transportManagerId,
    passage.direction,
    passage.weekPattern,
    passage.circuitId,
    passage.tripSegmentId,
    passage.passageType,
    passage.stop?.type,
    passage.stop?.label,
    passage.plannedTime
  ].map((part) => slugify(part)).join(":");
}

function mergePassage(target = {}, incoming = {}) {
  return normalizeStopPassage({
    ...target,
    driverIds: unique([...(target.driverIds || []), ...(incoming.driverIds || [])]),
    assistantIds: unique([...(target.assistantIds || []), ...(incoming.assistantIds || [])]),
    vehicleIds: unique([...(target.vehicleIds || []), ...(incoming.vehicleIds || [])]),
    studentIds: unique([...(target.studentIds || []), ...(incoming.studentIds || [])]),
    parentIds: unique([...(target.parentIds || []), ...(incoming.parentIds || [])]),
    legacyChildIds: unique([...(target.legacyChildIds || []), ...(incoming.legacyChildIds || [])]),
    legacyRefs: unique([...(target.legacyRefs || []), ...(incoming.legacyRefs || [])]),
    source: unique([target.source, incoming.source]).join("+")
  });
}

function addCandidate(candidates, duplicates, rawPassage, reason = "") {
  const passage = normalizeStopPassage(rawPassage);
  const key = passageKey(passage);
  const existing = candidates.get(key);
  if (existing) {
    duplicates.push({ key, existingId: existing.id, incomingId: passage.id, reason });
    candidates.set(key, mergePassage(existing, passage));
  } else {
    candidates.set(key, passage);
  }
}

function basePassageContext(child = {}, circuit = {}, vehicle = {}, schools = []) {
  const driverIds = unique([
    ...driverIdsFromRecord(child),
    ...driverIdsFromRecord(circuit),
    ...driverIdsFromRecord(vehicle)
  ]);
  const assistantIds = assistantIdsFromRecords(child, circuit, vehicle);
  const vehicleIds = unique([vehicle.id, child.vehicleId, circuit.vehicleId]);
  return {
    transportManagerId: firstNonEmpty([child.transportManagerId, circuit.transportManagerId, vehicle.transportManagerId, "legacy-transport-manager"]),
    driverId: driverIds[0] || "",
    driverIds,
    assistantId: assistantIds[0] || "",
    assistantIds,
    vehicleId: vehicleIds[0] || "",
    vehicleIds,
    schoolIds: unique([child.schoolId, ...schoolIdsForRecord(circuit, schools)]),
    studentIds: unique([child.id]),
    parentIds: unique(child.parentIds || []),
    validDays: validDaysForChild(child),
    active: true,
    source: "children",
    migrationStatus: "ready_for_review",
    legacyChildIds: unique([child.id]),
    legacyRefs: unique([child.id, circuit.id, vehicle.id])
  };
}

function buildPassagesForChild(child = {}, data = {}) {
  const passages = [];
  const ignored = [];
  const circuits = data.circuits || [];
  const vehicles = data.vehicles || [];
  const schools = data.schools || [];
  const pickupCircuit = circuitByRef(child.pickupCircuitId || child.circuitNumber || child.schoolCircuitId, circuits) || {};
  const schoolCircuit = circuitByRef(child.transferSchoolCircuitId || child.schoolCircuitId || child.circuitNumber, circuits) || pickupCircuit;
  const vehicle = vehicleForTrip(child, pickupCircuit, vehicles) || {};
  const context = basePassageContext(child, pickupCircuit, vehicle, schools);
  const schoolLabel = schoolLabelForChild(child, schoolCircuit, schools);
  const pickupTime = pickupTimeForChild(child);
  const isPmr = childIsPmr(child);
  const hasTransfer = childHasTransfer(child, pickupCircuit);
  const transferLabel = firstNonEmpty([child.transferName, child.transferLocation, pickupCircuit.transferName, child.transferCircuit]);
  const transportType = isPmr ? "porte_a_porte" : hasTransfer ? "avec_transfert" : "circuit_ferme";

  if (!child.id) {
    ignored.push({ source: "children", id: "", reason: "child_id_missing" });
    return { passages, ignored };
  }

  weekPatternsForChild(child).forEach((weekPattern) => {
    const pickupLabel = isPmr ? firstNonEmpty([child.homeAddress, "Domicile parent actif"]) : pickupStopForWeek(child, weekPattern);
    const suffix = slugify(`${child.id}-${weekPattern}`);
    const common = {
      ...context,
      direction: "morning",
      transportType,
      weekPattern
    };

    if (hasTransfer && !isPmr && transferLabel) {
      const transferHubId = transferHubIdFor(transferLabel);
      const pickupTransferSegmentId = `seg-${suffix}-pickup-transfer`;
      const transferSchoolSegmentId = `seg-${suffix}-transfer-school`;
      const pickupCircuitId = firstNonEmpty([pickupCircuit.id, child.pickupCircuitId, child.circuitNumber]);
      const schoolCircuitId = firstNonEmpty([schoolCircuit.id, child.transferSchoolCircuitId, child.schoolCircuitId, pickupCircuitId]);
      passages.push(
        normalizeStopPassage({
          ...common,
          id: `pass-${suffix}-pickup`,
          tripSegmentId: pickupTransferSegmentId,
          circuitId: pickupCircuitId,
          passageType: "pickup",
          stop: { type: "tec_stop", label: pickupLabel },
          plannedTime: pickupTime || "07:00",
          passageOrder: 1,
          tecStopId: child.pickupStopId || child.tecStopId || ""
        }),
        normalizeStopPassage({
          ...common,
          id: `pass-${suffix}-transfer-arrival`,
          tripSegmentId: pickupTransferSegmentId,
          circuitId: pickupCircuitId,
          passageType: "transfer_arrival",
          stop: { type: "transfer_hub", id: transferHubId, label: transferLabel },
          transferHubId,
          plannedTime: normalizeTime(child.transferArrivalTime, "07:30"),
          passageOrder: 2,
          isTransferPoint: true
        }),
        normalizeStopPassage({
          ...common,
          id: `pass-${suffix}-transfer-departure`,
          tripSegmentId: transferSchoolSegmentId,
          circuitId: schoolCircuitId,
          passageType: "transfer_departure",
          stop: { type: "transfer_hub", id: transferHubId, label: transferLabel },
          transferHubId,
          plannedTime: normalizeTime(child.transferDepartureTime, "07:35"),
          passageOrder: 1,
          isTransferPoint: true
        }),
        normalizeStopPassage({
          ...common,
          id: `pass-${suffix}-school`,
          tripSegmentId: transferSchoolSegmentId,
          circuitId: schoolCircuitId,
          passageType: "school_arrival",
          stop: { type: "school", id: child.schoolId || "", label: schoolLabel },
          schoolId: child.schoolId || "",
          plannedTime: normalizeTime(child.schoolArrivalTime, "08:00"),
          passageOrder: 2,
          isTerminalPoint: true
        })
      );
      return;
    }

    const directSegmentId = `seg-${suffix}-direct`;
    const circuitId = firstNonEmpty([pickupCircuit.id, child.pickupCircuitId, child.circuitNumber]);
    passages.push(
      normalizeStopPassage({
        ...common,
        id: `pass-${suffix}-pickup`,
        tripSegmentId: directSegmentId,
        circuitId,
        passageType: "pickup",
        stop: { type: isPmr ? "home_address" : "tec_stop", label: pickupLabel },
        plannedTime: pickupTime || "07:00",
        passageOrder: 1,
        tecStopId: isPmr ? "" : (child.pickupStopId || child.tecStopId || ""),
        isPmrHomePickup: isPmr
      }),
      normalizeStopPassage({
        ...common,
        id: `pass-${suffix}-school`,
        tripSegmentId: directSegmentId,
        circuitId,
        passageType: "school_arrival",
        stop: { type: "school", id: child.schoolId || "", label: schoolLabel },
        schoolId: child.schoolId || "",
        plannedTime: normalizeTime(child.schoolArrivalTime, "08:00"),
        passageOrder: 2,
        isTerminalPoint: true
      })
    );
  });

  return { passages, ignored };
}

function detectStopPassages(data = {}) {
  const candidates = new Map();
  const ignored = [];
  const duplicates = [];
  const errors = [];
  const children = [...(data.children || []), ...(data.students || [])]
    .filter((child, index, list) => child?.id && list.findIndex((item) => item.id === child.id) === index);

  children.forEach((child) => {
    const built = buildPassagesForChild(child, data);
    ignored.push(...built.ignored);
    built.passages.forEach((passage) => addCandidate(candidates, duplicates, passage, "same_stop_and_schedule"));
  });

  const passages = [...candidates.values()].map(normalizeStopPassage);
  const ready = [];
  passages.forEach((passage) => {
    const passageErrors = validateStopPassage(passage);
    if (passageErrors.length) errors.push({ id: passage.id, label: passage.stop.label || "n/a", errors: passageErrors });
    else ready.push(passage);
  });
  return { passages, ready, ignored, duplicates, errors };
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

async function writeStopPassages(passages = []) {
  const [{ initializeApp }, { doc, getFirestore, setDoc }] = await Promise.all([
    import("firebase/app"),
    import("firebase/firestore")
  ]);
  const app = initializeApp(await firebaseConfig(), "gts-stop-passages-v2");
  const db = getFirestore(app);
  for (const passage of passages) {
    await setDoc(doc(db, "stopPassages", passage.id), passage, { merge: false });
    console.log(`written: stopPassages/${passage.id}`);
  }
}

function printSection(title) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function printPassage(passage) {
  console.log(`- ${passage.plannedTime} ${passage.stop.label || "n/a"} (${passage.id})`);
  console.log(`  type: ${passage.passageType}, stop: ${passage.stop.type}, direction: ${passage.direction}, semaine: ${passage.weekPattern}`);
  console.log(`  segment: ${passage.tripSegmentId}, circuit: ${passage.circuitId}`);
  console.log(`  véhicule: ${passage.vehicleId || "n/a"}, chauffeur: ${passage.driverId || "n/a"}, élèves: ${passage.studentIds.join(", ") || "n/a"}`);
}

async function main() {
  const args = parseArgs();
  const { source, data } = await loadLegacyData(args.input);
  const result = detectStopPassages(data);

  console.log("Création stopPassages GTS V2");
  console.log("============================");
  console.log(`Source: ${source}`);
  console.log(`Mode: ${args.write ? "WRITE EXPLICITE" : "DRY-RUN uniquement"}`);
  console.log("Collection cible: stopPassages uniquement");
  console.log("Aucune création de tripSegments ou studentAssignments.");

  printSection("Passages détectés");
  console.log(`Détectés: ${result.passages.length}`);
  console.log(`Prêts: ${result.ready.length}`);
  console.log(`Ignorés: ${result.ignored.length}`);
  console.log(`Doublons fusionnés: ${result.duplicates.length}`);
  console.log(`Erreurs: ${result.errors.length}`);

  printSection("Passages prêts");
  if (!result.ready.length) console.log("Aucun.");
  result.ready.slice(0, args.limit).forEach(printPassage);
  if (result.ready.length > args.limit) console.log(`... ${result.ready.length - args.limit} autre(s) passage(s) non affiché(s).`);

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
    console.log(`- ${item.id || item.label || "passage sans identifiant"}: ${item.errors.join(", ")}`);
  });

  printSection(args.write ? "Écriture Firestore" : "Plan d'écriture dry-run");
  if (!result.ready.length) {
    console.log("Aucun document prêt à écrire.");
  } else {
    result.ready.slice(0, args.limit).forEach((passage) => console.log(`${args.write ? "will_write" : "would_write"}: stopPassages/${passage.id}`));
    if (result.ready.length > args.limit) console.log(`... ${result.ready.length - args.limit} autre(s) écriture(s) non affichée(s).`);
  }

  if (args.write) {
    if (result.errors.length) throw new Error("Écriture bloquée : des passages contiennent des erreurs.");
    await writeStopPassages(result.ready);
  }

  printSection("Commande écriture future");
  console.log(`node scripts/create-stop-passages-v2.js --input ${source} --write`);

  printSection("Conclusion");
  if (args.write) console.log("Écriture terminée pour stopPassages uniquement.");
  else console.log("Dry-run terminé. Aucune écriture Firestore effectuée.");
}

main().catch((error) => {
  console.error("Création stopPassages GTS V2 impossible.");
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
