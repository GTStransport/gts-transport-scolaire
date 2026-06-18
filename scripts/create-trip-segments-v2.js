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

function timeToMinutes(value) {
  if (!isValidTime(value)) return -1;
  const [hours, minutes] = value.split(":").map(Number);
  return (hours * 60) + minutes;
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

function normalizeTripSegment(segment = {}) {
  const driverIds = unique(segment.driverIds || []);
  const assistantIds = unique(segment.assistantIds || []);
  const vehicleIds = unique(segment.vehicleIds || []);
  return {
    id: text(segment.id),
    transportManagerId: text(segment.transportManagerId),
    direction: validDirections.includes(segment.direction) ? segment.direction : "morning",
    transportType: validTransportTypes.includes(segment.transportType) ? segment.transportType : "circuit_ferme",
    circuitId: text(segment.circuitId),
    segmentOrder: Number.isInteger(Number(segment.segmentOrder)) ? Number(segment.segmentOrder) : 0,
    from: normalizePoint(segment.from),
    to: normalizePoint(segment.to),
    plannedDepartureTime: text(segment.plannedDepartureTime),
    plannedArrivalTime: text(segment.plannedArrivalTime),
    vehicleId: text(segment.vehicleId || vehicleIds[0]),
    driverId: text(segment.driverId || driverIds[0]),
    assistantId: text(segment.assistantId || assistantIds[0]),
    driverIds,
    assistantIds,
    vehicleIds,
    validDays: Array.isArray(segment.validDays) ? segment.validDays.filter((day) => validDays.includes(day)) : [],
    weekPattern: validWeekPatterns.includes(segment.weekPattern) ? segment.weekPattern : "all",
    active: segment.active !== false,
    transferHubId: text(segment.transferHubId),
    schoolIds: unique(segment.schoolIds || []),
    stopPassageIds: unique(segment.stopPassageIds || []),
    pmrCompatibleRequired: segment.pmrCompatibleRequired === true,
    wheelchairCompatibleRequired: segment.wheelchairCompatibleRequired === true,
    source: firstNonEmpty([segment.source, "legacy_trip_import"]),
    migrationStatus: firstNonEmpty([segment.migrationStatus, "ready_for_review"]),
    legacyChildIds: unique(segment.legacyChildIds || []),
    legacyRefs: unique(segment.legacyRefs || [])
  };
}

function validateTripSegment(segment = {}) {
  const errors = [];
  if (!text(segment.id)) errors.push("id_missing");
  if (!text(segment.transportManagerId)) errors.push("transport_manager_id_missing");
  if (!validDirections.includes(segment.direction)) errors.push("direction_invalid");
  if (!validTransportTypes.includes(segment.transportType)) errors.push("transport_type_invalid");
  if (!text(segment.circuitId)) errors.push("circuit_id_missing");
  if (!Number.isInteger(segment.segmentOrder) || segment.segmentOrder < 0) errors.push("segment_order_invalid");
  if (!validPointTypes.includes(segment.from?.type) || !text(segment.from?.label)) errors.push("from_invalid");
  if (!validPointTypes.includes(segment.to?.type) || !text(segment.to?.label)) errors.push("to_invalid");
  if (!isValidTime(segment.plannedDepartureTime)) errors.push("planned_departure_time_invalid");
  if (!isValidTime(segment.plannedArrivalTime)) errors.push("planned_arrival_time_invalid");
  if (isValidTime(segment.plannedDepartureTime) && isValidTime(segment.plannedArrivalTime) && timeToMinutes(segment.plannedArrivalTime) < timeToMinutes(segment.plannedDepartureTime)) {
    errors.push("arrival_before_departure");
  }
  if (!text(segment.vehicleId)) errors.push("vehicle_id_missing");
  if (!text(segment.driverId)) errors.push("driver_id_missing");
  if (!Array.isArray(segment.validDays) || !segment.validDays.length) errors.push("valid_days_missing");
  if (!validWeekPatterns.includes(segment.weekPattern)) errors.push("week_pattern_invalid");
  if (typeof segment.active !== "boolean") errors.push("active_missing");
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

function segmentKey(segment = {}) {
  return [
    segment.transportManagerId,
    segment.direction,
    segment.weekPattern,
    segment.circuitId,
    segment.segmentOrder,
    segment.from?.type,
    segment.from?.label,
    segment.to?.type,
    segment.to?.label,
    segment.plannedDepartureTime,
    segment.plannedArrivalTime
  ].map((part) => slugify(part)).join(":");
}

function mergeSegment(target = {}, incoming = {}) {
  return normalizeTripSegment({
    ...target,
    driverIds: unique([...(target.driverIds || []), ...(incoming.driverIds || [])]),
    assistantIds: unique([...(target.assistantIds || []), ...(incoming.assistantIds || [])]),
    vehicleIds: unique([...(target.vehicleIds || []), ...(incoming.vehicleIds || [])]),
    schoolIds: unique([...(target.schoolIds || []), ...(incoming.schoolIds || [])]),
    legacyChildIds: unique([...(target.legacyChildIds || []), ...(incoming.legacyChildIds || [])]),
    legacyRefs: unique([...(target.legacyRefs || []), ...(incoming.legacyRefs || [])]),
    source: unique([target.source, incoming.source]).join("+")
  });
}

function addCandidate(candidates, duplicates, rawSegment, reason = "") {
  const segment = normalizeTripSegment(rawSegment);
  const key = segmentKey(segment);
  const existing = candidates.get(key);
  if (existing) {
    duplicates.push({ key, existingId: existing.id, incomingId: segment.id, reason });
    candidates.set(key, mergeSegment(existing, segment));
  } else {
    candidates.set(key, segment);
  }
}

function baseSegmentContext(child = {}, circuit = {}, vehicle = {}, schools = []) {
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
    validDays: validDaysForChild(child),
    active: true,
    source: "children",
    migrationStatus: "ready_for_review",
    legacyChildIds: unique([child.id]),
    legacyRefs: unique([child.id, circuit.id, vehicle.id])
  };
}

function buildSegmentsForChild(child = {}, data = {}) {
  const segments = [];
  const ignored = [];
  const circuits = data.circuits || [];
  const vehicles = data.vehicles || [];
  const schools = data.schools || [];
  const pickupCircuit = circuitByRef(child.pickupCircuitId || child.circuitNumber || child.schoolCircuitId, circuits) || {};
  const schoolCircuit = circuitByRef(child.transferSchoolCircuitId || child.schoolCircuitId || child.circuitNumber, circuits) || pickupCircuit;
  const vehicle = vehicleForTrip(child, pickupCircuit, vehicles) || {};
  const context = baseSegmentContext(child, pickupCircuit, vehicle, schools);
  const schoolLabel = schoolLabelForChild(child, schoolCircuit, schools);
  const pickupTime = pickupTimeForChild(child);
  const isPmr = childIsPmr(child);
  const hasTransfer = childHasTransfer(child, pickupCircuit);
  const transferLabel = firstNonEmpty([child.transferName, child.transferLocation, pickupCircuit.transferName, child.transferCircuit]);
  const transportType = isPmr ? "porte_a_porte" : hasTransfer ? "avec_transfert" : "circuit_ferme";

  if (!child.id) {
    ignored.push({ source: "children", id: "", reason: "child_id_missing" });
    return { segments, ignored };
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
      segments.push(normalizeTripSegment({
        ...common,
        id: `seg-${suffix}-pickup-transfer`,
        circuitId: firstNonEmpty([pickupCircuit.id, child.pickupCircuitId, child.circuitNumber]),
        segmentOrder: 1,
        from: { type: "tec_stop", label: pickupLabel },
        to: { type: "transfer_hub", id: transferHubId, label: transferLabel },
        plannedDepartureTime: pickupTime || "07:00",
        plannedArrivalTime: normalizeTime(child.transferArrivalTime, "07:30"),
        transferHubId
      }));
      segments.push(normalizeTripSegment({
        ...common,
        id: `seg-${suffix}-transfer-school`,
        circuitId: firstNonEmpty([schoolCircuit.id, child.transferSchoolCircuitId, child.schoolCircuitId, pickupCircuit.id, child.circuitNumber]),
        segmentOrder: 2,
        from: { type: "transfer_hub", id: transferHubId, label: transferLabel },
        to: { type: "school", id: child.schoolId || "", label: schoolLabel },
        plannedDepartureTime: normalizeTime(child.transferDepartureTime, "07:35"),
        plannedArrivalTime: normalizeTime(child.schoolArrivalTime, "08:00"),
        transferHubId
      }));
      return;
    }

    segments.push(normalizeTripSegment({
      ...common,
      id: `seg-${suffix}-direct`,
      circuitId: firstNonEmpty([pickupCircuit.id, child.pickupCircuitId, child.circuitNumber]),
      segmentOrder: 1,
      from: { type: isPmr ? "home_address" : "tec_stop", label: pickupLabel },
      to: { type: "school", id: child.schoolId || "", label: schoolLabel },
      plannedDepartureTime: pickupTime || "07:00",
      plannedArrivalTime: normalizeTime(child.schoolArrivalTime, "08:00"),
      pmrCompatibleRequired: isPmr,
      wheelchairCompatibleRequired: child.wheelchairRequired === true || child.hasWheelchair === true
    }));
  });

  return { segments, ignored };
}

function detectTripSegments(data = {}) {
  const candidates = new Map();
  const ignored = [];
  const duplicates = [];
  const errors = [];
  const children = [...(data.children || []), ...(data.students || [])]
    .filter((child, index, list) => child?.id && list.findIndex((item) => item.id === child.id) === index);

  children.forEach((child) => {
    const built = buildSegmentsForChild(child, data);
    ignored.push(...built.ignored);
    built.segments.forEach((segment) => addCandidate(candidates, duplicates, segment, "same_route_and_schedule"));
  });

  const segments = [...candidates.values()].map(normalizeTripSegment);
  const ready = [];
  segments.forEach((segment) => {
    const segmentErrors = validateTripSegment(segment);
    if (segmentErrors.length) errors.push({ id: segment.id, label: `${segment.from.label || "n/a"} -> ${segment.to.label || "n/a"}`, errors: segmentErrors });
    else ready.push(segment);
  });
  return { segments, ready, ignored, duplicates, errors };
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

async function writeTripSegments(segments = []) {
  const [{ initializeApp }, { doc, getFirestore, setDoc }] = await Promise.all([
    import("firebase/app"),
    import("firebase/firestore")
  ]);
  const app = initializeApp(await firebaseConfig(), "gts-trip-segments-v2");
  const db = getFirestore(app);
  for (const segment of segments) {
    await setDoc(doc(db, "tripSegments", segment.id), segment, { merge: false });
    console.log(`written: tripSegments/${segment.id}`);
  }
}

function printSection(title) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function printSegment(segment) {
  console.log(`- ${segment.from.label || "n/a"} -> ${segment.to.label || "n/a"} (${segment.id})`);
  console.log(`  type: ${segment.transportType}, direction: ${segment.direction}, semaine: ${segment.weekPattern}`);
  console.log(`  circuit: ${segment.circuitId || "n/a"}, véhicule: ${segment.vehicleId || "n/a"}, chauffeur: ${segment.driverId || "n/a"}`);
  console.log(`  horaires: ${segment.plannedDepartureTime || "n/a"} -> ${segment.plannedArrivalTime || "n/a"}`);
  console.log(`  élèves legacy: ${segment.legacyChildIds.join(", ") || "n/a"}`);
}

async function main() {
  const args = parseArgs();
  const { source, data } = await loadLegacyData(args.input);
  const result = detectTripSegments(data);

  console.log("Création tripSegments GTS V2");
  console.log("============================");
  console.log(`Source: ${source}`);
  console.log(`Mode: ${args.write ? "WRITE EXPLICITE" : "DRY-RUN uniquement"}`);
  console.log("Collection cible: tripSegments uniquement");
  console.log("Aucune création de stopPassages ou studentAssignments.");

  printSection("Segments détectés");
  console.log(`Détectés: ${result.segments.length}`);
  console.log(`Prêts: ${result.ready.length}`);
  console.log(`Ignorés: ${result.ignored.length}`);
  console.log(`Doublons fusionnés: ${result.duplicates.length}`);
  console.log(`Erreurs: ${result.errors.length}`);

  printSection("Segments prêts");
  if (!result.ready.length) console.log("Aucun.");
  result.ready.slice(0, args.limit).forEach(printSegment);
  if (result.ready.length > args.limit) console.log(`... ${result.ready.length - args.limit} autre(s) segment(s) non affiché(s).`);

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
    console.log(`- ${item.id || item.label || "segment sans identifiant"}: ${item.errors.join(", ")}`);
  });

  printSection(args.write ? "Écriture Firestore" : "Plan d'écriture dry-run");
  if (!result.ready.length) {
    console.log("Aucun document prêt à écrire.");
  } else {
    result.ready.slice(0, args.limit).forEach((segment) => console.log(`${args.write ? "will_write" : "would_write"}: tripSegments/${segment.id}`));
    if (result.ready.length > args.limit) console.log(`... ${result.ready.length - args.limit} autre(s) écriture(s) non affichée(s).`);
  }

  if (args.write) {
    if (result.errors.length) throw new Error("Écriture bloquée : des segments contiennent des erreurs.");
    await writeTripSegments(result.ready);
  }

  printSection("Commande écriture future");
  console.log(`node scripts/create-trip-segments-v2.js --input ${source} --write`);

  printSection("Conclusion");
  if (args.write) console.log("Écriture terminée pour tripSegments uniquement.");
  else console.log("Dry-run terminé. Aucune écriture Firestore effectuée.");
}

main().catch((error) => {
  console.error("Création tripSegments GTS V2 impossible.");
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
