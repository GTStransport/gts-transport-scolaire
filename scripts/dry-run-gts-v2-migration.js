import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const appPath = path.join(projectRoot, "app.js");
const backupsRoot = path.join(projectRoot, "backups");

const collectionNames = [
  "children",
  "students",
  "parents",
  "circuits",
  "vehicles",
  "drivers",
  "assistants",
  "schools",
  "transportTransfers"
];

function parseArgs(argv = process.argv.slice(2)) {
  const args = { input: "", limit: 10 };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") args.input = argv[index + 1] || "";
    if (arg === "--limit") args.limit = Number(argv[index + 1] || 10);
  }
  return args;
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

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function text(value = "") {
  return String(value || "").trim();
}

function firstNonEmpty(values = []) {
  return values.map(text).find(Boolean) || "";
}

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}`);
  if (start < 0) throw new Error(`Helper introuvable dans app.js : ${name}`);
  const bodyMarker = source.indexOf(") {", start);
  if (bodyMarker < 0) throw new Error(`Corps de helper introuvable : ${name}`);
  const braceStart = bodyMarker + 2;
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Helper incomplet : ${name}`);
}

function extractConst(source, name) {
  const start = source.indexOf(`const ${name} = [`);
  if (start < 0) throw new Error(`Constante introuvable dans app.js : ${name}`);
  const end = source.indexOf("];", start);
  if (end < 0) throw new Error(`Constante incomplete dans app.js : ${name}`);
  return source.slice(start, end + 2);
}

export async function loadGtsV2Helpers() {
  const source = await fs.readFile(appPath, "utf8");
  const constNames = [
    "GTS_V2_DIRECTIONS",
    "GTS_V2_TRANSPORT_TYPES",
    "GTS_V2_WEEK_PATTERNS",
    "GTS_V2_VALID_DAYS",
    "GTS_V2_POINT_TYPES",
    "GTS_V2_PASSAGE_TYPES"
  ];
  const functionNames = [
    "fullName",
    "normalizeAlternatingResidence",
    "isoWeekNumber",
    "activeResidenceForChild",
    "activePickupStopForChild",
    "isNonEmptyString",
    "isValidGtsV2IdList",
    "isValidGtsV2Time",
    "isValidGtsV2ValidDays",
    "isValidGtsV2Point",
    "gtsV2TimeToMinutes",
    "hasMatchingGtsV2Schedule",
    "isValidTripSegment",
    "normalizeTripSegment",
    "buildTripSegmentFromDraft",
    "tripSegmentSummary",
    "isValidStopPassage",
    "normalizeStopPassage",
    "buildStopPassageFromDraft",
    "stopPassageSummary",
    "isValidStudentAssignment",
    "normalizeStudentAssignment",
    "buildStudentAssignmentFromDraft",
    "studentAssignmentSummary",
    "assignmentsForChild",
    "stopPassagesForChild",
    "tripSegmentsForChild",
    "uniqueArray",
    "transportViewDayKey",
    "transportViewWeekPattern",
    "transportViewLabelById",
    "transportViewVehicleLabel",
    "transportViewVehicleLabels",
    "transportViewIsPmrChild",
    "transportViewIsAdaptedVehicle",
    "transportViewAlert",
    "transportViewHasLegacyTransport",
    "transportViewLegacyCircuitIds",
    "transportViewLegacyDriverIds",
    "transportViewLegacyAssistantIds",
    "transportViewBase",
    "childHasTransfer",
    "transportViewForChild"
  ];
  const code = [
    ...constNames.map((name) => extractConst(source, name)),
    ...functionNames.map((name) => extractFunction(source, name)),
    `return { ${functionNames.join(", ")} };`
  ].join("\n");
  return Function(code)();
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

async function loadCollectionFromBackupDir(inputDir, collectionName) {
  const filePath = path.join(inputDir, `${collectionName}.json`);
  const payload = await readJson(filePath).catch(() => null);
  return payload ? normalizeBackupDocuments(payload) : [];
}

export async function loadLegacyData(inputPath = "") {
  const resolvedInput = inputPath ? path.resolve(projectRoot, inputPath) : await latestBackupDir();
  if (!resolvedInput) {
    return { source: "none", data: Object.fromEntries(collectionNames.map((name) => [name, []])) };
  }
  const stat = await fs.stat(resolvedInput).catch(() => null);
  if (!stat) throw new Error(`Source introuvable : ${resolvedInput}`);
  if (stat.isDirectory()) {
    const entries = await Promise.all(collectionNames.map(async (name) => [name, await loadCollectionFromBackupDir(resolvedInput, name)]));
    const data = Object.fromEntries(entries);
    return { source: path.relative(projectRoot, resolvedInput), data };
  }
  const payload = await readJson(resolvedInput);
  const data = Object.fromEntries(collectionNames.map((name) => [name, Array.isArray(payload[name]) ? payload[name] : []]));
  return { source: path.relative(projectRoot, resolvedInput), data };
}

function parentIdsForChild(child = {}, parents = []) {
  return unique([
    ...(Array.isArray(child.parentIds) ? child.parentIds : []),
    child.parentId,
    child.motherId,
    child.fatherId,
    ...parents.filter((parent) => (parent.linkedChildrenIds || []).includes(child.id)).map((parent) => parent.id)
  ]);
}

function findCircuit(ref, circuits = []) {
  const value = text(ref);
  if (!value) return null;
  return circuits.find((circuit) => circuit.id === value || circuit.name === value || circuit.circuitNumber === value) || null;
}

function findVehicle(child = {}, circuit = {}, vehicles = []) {
  return vehicles.find((vehicle) => vehicle.id === child.vehicleId)
    || vehicles.find((vehicle) => vehicle.id === circuit.vehicleId)
    || vehicles.find((vehicle) => vehicle.circuitId === circuit.id || vehicle.circuitId === circuit.name)
    || null;
}

function driverIdsFromRecord(record = {}) {
  return unique([...(Array.isArray(record.driverIds) ? record.driverIds : []), record.driverId]);
}

function assistantIdFromRecords(child = {}, circuit = {}, vehicle = {}) {
  return firstNonEmpty([child.assistantId, child.transferAssistantId, circuit.assistantId, vehicle.assistantId]);
}

function childHasTransfer(child = {}, circuit = {}) {
  if (typeof child.hasTransfer === "boolean") return child.hasTransfer;
  return child.changesBusAtTransfer === true
    || child.staysInSameBus === false
    || !!child.transferLocation
    || !!child.transferName
    || !!child.transferSchoolCircuitId
    || !!circuit.transferName;
}

function childIsPmr(child = {}) {
  return child.pmrRequired === true
    || child.requiresAdaptedVehicle === true
    || child.wheelchairRequired === true
    || child.hasWheelchair === true
    || String(child.mobilityHelp || "").toLowerCase().includes("fauteuil")
    || String(child.disability || child.handicap || "").toLowerCase().includes("pmr");
}

function pickupStopForWeek(child = {}, weekPattern = "all") {
  const residence = child.alternatingResidence || {};
  if (weekPattern === "even") return firstNonEmpty([residence.motherPickupStop, child.motherPickupStop, child.pickupStop]);
  if (weekPattern === "odd") return firstNonEmpty([residence.fatherPickupStop, child.fatherPickupStop, child.pickupStop]);
  return firstNonEmpty([child.pickupStop, residence.motherPickupStop, child.motherPickupStop]);
}

function weekPatternsForChild(child = {}) {
  const residence = child.alternatingResidence || {};
  const enabled = residence.enabled === true || child.alternatingCustody?.enabled === true;
  return enabled ? ["even", "odd"] : ["all"];
}

function timeForChild(child = {}, fallback = "") {
  return firstNonEmpty([
    child.morningPassageTime,
    child.pickupTime,
    child.plannedPickupTime,
    child.scheduleTime,
    fallback
  ]);
}

function schoolLabelForChild(child = {}, circuit = {}, schools = []) {
  const school = schools.find((item) => item.id === child.schoolId || item.name === child.schoolName || item.id === circuit.schoolId);
  return firstNonEmpty([school?.name, child.schoolName, child.school, circuit.schoolName, (circuit.schoolNames || [])[0]]);
}

export function addUnique(map, item) {
  if (!item?.id || map.has(item.id)) return;
  map.set(item.id, item);
}

export function buildMigrationForChild(child, legacy, helpers) {
  const result = {
    childId: child.id || "",
    childName: [child.firstName, child.lastName].filter(Boolean).join(" ") || child.id || "Sans nom",
    status: "migrable",
    warnings: [],
    errors: [],
    transferHubs: [],
    tripSegments: [],
    stopPassages: [],
    studentAssignments: [],
    transportViews: []
  };
  if (!child.id) result.errors.push("child_id_missing");

  const circuits = legacy.circuits || [];
  const circuit = findCircuit(child.pickupCircuitId || child.circuitNumber || child.schoolCircuitId, circuits) || {};
  const schoolCircuit = findCircuit(child.schoolCircuitId || child.transferSchoolCircuitId || child.circuitNumber, circuits) || circuit;
  const vehicle = findVehicle(child, circuit, legacy.vehicles || []) || {};
  const driverIds = unique([
    ...driverIdsFromRecord(child),
    ...driverIdsFromRecord(circuit),
    ...driverIdsFromRecord(vehicle)
  ]);
  const assistantId = assistantIdFromRecords(child, circuit, vehicle);
  const transportManagerId = firstNonEmpty([child.transportManagerId, circuit.transportManagerId, vehicle.transportManagerId, (legacy.transportManagers || [])[0]?.id, "legacy-transport-manager"]);
  const parentIds = parentIdsForChild(child, legacy.parents || []);
  const schoolLabel = schoolLabelForChild(child, schoolCircuit, legacy.schools || []);
  const pickupTime = timeForChild(child, "");
  const hasTransfer = childHasTransfer(child, circuit);
  const transferLabel = firstNonEmpty([child.transferName, child.transferLocation, circuit.transferName, "Transfert legacy"]);
  const isPmr = childIsPmr(child);

  if (!pickupTime) result.warnings.push("pickup_time_missing");
  if (!driverIds.length) result.errors.push("driver_missing");
  if (!vehicle.id && !child.vehicleId) result.errors.push("vehicle_missing");
  if (!schoolLabel) result.errors.push("school_missing");
  if (!findCircuit(child.pickupCircuitId || child.circuitNumber || child.schoolCircuitId, circuits)) result.warnings.push("circuit_match_uncertain");
  if (!parentIds.length) result.warnings.push("parent_ids_missing");

  const weekPatterns = weekPatternsForChild(child);
  const transferHubsById = new Map();
  const tripSegments = [];
  const stopPassages = [];
  const studentAssignments = [];

  for (const weekPattern of weekPatterns) {
    const pickupLabel = isPmr ? "Domicile parent actif" : pickupStopForWeek(child, weekPattern);
    if (!pickupLabel) result.errors.push(`pickup_stop_missing_${weekPattern}`);
    const suffix = slugify(`${child.id}-${weekPattern}`);
    const circuitId = firstNonEmpty([circuit.id, child.pickupCircuitId, child.circuitNumber, "legacy-circuit"]);
    const vehicleId = firstNonEmpty([vehicle.id, child.vehicleId, "legacy-vehicle"]);
    const driverId = driverIds[0] || "legacy-driver";
    const assistantIds = unique([assistantId]);
    const validDays = Array.isArray(child.transportDays) && child.transportDays.length ? child.transportDays : ["monday", "tuesday", "wednesday", "thursday", "friday"];
    const common = {
      transportManagerId,
      direction: "morning",
      validDays,
      weekPattern,
      active: true
    };
    const transportType = isPmr ? "porte_a_porte" : hasTransfer ? "avec_transfert" : "circuit_ferme";
    const segmentIds = [];
    const passageIds = [];

    if (hasTransfer && !isPmr) {
      const transferId = `transfer-${slugify(transferLabel)}`;
      addUnique(transferHubsById, {
        id: transferId,
        name: transferLabel,
        label: transferLabel,
        transportManagerIds: [transportManagerId],
        schoolIds: unique([child.schoolId].filter(Boolean)),
        active: true,
        source: "legacy_import",
        migrationStatus: "needs_review"
      });
      const firstSegment = helpers.buildTripSegmentFromDraft({
        id: `seg-${suffix}-pickup-transfer`,
        transportType,
        circuitId,
        segmentOrder: 1,
        from: { type: "tec_stop", label: pickupLabel },
        to: { type: "transfer_hub", id: transferId, label: transferLabel },
        plannedDepartureTime: pickupTime || "07:00",
        plannedArrivalTime: child.transferArrivalTime || "07:30",
        vehicleId,
        driverId,
        assistantId,
        transferHubId: transferId,
        source: "legacy_import"
      }, common);
      const secondCircuit = schoolCircuit || circuit;
      const secondSegment = helpers.buildTripSegmentFromDraft({
        id: `seg-${suffix}-transfer-school`,
        transportType,
        circuitId: firstNonEmpty([secondCircuit.id, child.transferSchoolCircuitId, child.schoolCircuitId, circuitId]),
        segmentOrder: 2,
        from: { type: "transfer_hub", id: transferId, label: transferLabel },
        to: { type: "school", id: child.schoolId || "", label: schoolLabel },
        plannedDepartureTime: child.transferDepartureTime || "07:35",
        plannedArrivalTime: child.schoolArrivalTime || "08:00",
        vehicleId,
        driverId,
        assistantId,
        transferHubId: transferId,
        schoolIds: unique([child.schoolId].filter(Boolean))
      }, common);
      tripSegments.push(firstSegment, secondSegment);
      segmentIds.push(firstSegment.id, secondSegment.id);
      const pickupPassage = helpers.buildStopPassageFromDraft({
        id: `pass-${suffix}-pickup`,
        tripSegmentId: firstSegment.id,
        circuitId: firstSegment.circuitId,
        transportType,
        passageType: "pickup",
        stop: { type: "tec_stop", label: pickupLabel },
        plannedTime: pickupTime || "07:00",
        passageOrder: 1,
        vehicleId,
        driverId,
        assistantId
      }, common);
      const transferArrival = helpers.buildStopPassageFromDraft({
        id: `pass-${suffix}-transfer-arrival`,
        tripSegmentId: firstSegment.id,
        circuitId: firstSegment.circuitId,
        transportType,
        passageType: "transfer_arrival",
        stop: { type: "transfer_hub", id: transferId, label: transferLabel },
        transferHubId: transferId,
        plannedTime: child.transferArrivalTime || "07:30",
        passageOrder: 2,
        vehicleId,
        driverId,
        assistantId
      }, common);
      const transferDeparture = helpers.buildStopPassageFromDraft({
        id: `pass-${suffix}-transfer-departure`,
        tripSegmentId: secondSegment.id,
        circuitId: secondSegment.circuitId,
        transportType,
        passageType: "transfer_departure",
        stop: { type: "transfer_hub", id: transferId, label: transferLabel },
        transferHubId: transferId,
        plannedTime: child.transferDepartureTime || "07:35",
        passageOrder: 1,
        vehicleId,
        driverId,
        assistantId
      }, common);
      const schoolPassage = helpers.buildStopPassageFromDraft({
        id: `pass-${suffix}-school`,
        tripSegmentId: secondSegment.id,
        circuitId: secondSegment.circuitId,
        transportType,
        passageType: "school_arrival",
        stop: { type: "school", id: child.schoolId || "", label: schoolLabel },
        schoolId: child.schoolId || "",
        plannedTime: child.schoolArrivalTime || "08:00",
        passageOrder: 2,
        vehicleId,
        driverId,
        assistantId
      }, common);
      stopPassages.push(pickupPassage, transferArrival, transferDeparture, schoolPassage);
      passageIds.push(pickupPassage.id, transferArrival.id, transferDeparture.id, schoolPassage.id);
    } else {
      const segment = helpers.buildTripSegmentFromDraft({
        id: `seg-${suffix}-direct`,
        transportType,
        circuitId,
        segmentOrder: 1,
        from: { type: isPmr ? "home_address" : "tec_stop", label: pickupLabel },
        to: { type: "school", id: child.schoolId || "", label: schoolLabel },
        plannedDepartureTime: pickupTime || "07:00",
        plannedArrivalTime: child.schoolArrivalTime || "08:00",
        vehicleId,
        driverId,
        assistantId,
        schoolIds: unique([child.schoolId].filter(Boolean)),
        pmrCompatibleRequired: isPmr,
        wheelchairCompatibleRequired: child.wheelchairRequired === true || child.hasWheelchair === true
      }, common);
      tripSegments.push(segment);
      segmentIds.push(segment.id);
      const pickupPassage = helpers.buildStopPassageFromDraft({
        id: `pass-${suffix}-pickup`,
        tripSegmentId: segment.id,
        circuitId: segment.circuitId,
        transportType,
        passageType: "pickup",
        stop: { type: isPmr ? "home_address" : "tec_stop", label: pickupLabel },
        plannedTime: pickupTime || "07:00",
        passageOrder: 1,
        vehicleId,
        driverId,
        assistantId,
        isPmrHomePickup: isPmr
      }, common);
      const schoolPassage = helpers.buildStopPassageFromDraft({
        id: `pass-${suffix}-school`,
        tripSegmentId: segment.id,
        circuitId: segment.circuitId,
        transportType,
        passageType: "school_arrival",
        stop: { type: "school", id: child.schoolId || "", label: schoolLabel },
        schoolId: child.schoolId || "",
        plannedTime: child.schoolArrivalTime || "08:00",
        passageOrder: 2,
        vehicleId,
        driverId,
        assistantId
      }, common);
      stopPassages.push(pickupPassage, schoolPassage);
      passageIds.push(pickupPassage.id, schoolPassage.id);
    }

    const assignment = helpers.buildStudentAssignmentFromDraft({
      id: `asg-${suffix}-morning`,
      studentId: child.id,
      transportType,
      pickupPassageId: passageIds[0],
      dropoffPassageId: passageIds[passageIds.length - 1],
      passageIds,
      tripSegmentIds: segmentIds,
      circuitIds: unique(tripSegments.filter((segment) => segmentIds.includes(segment.id)).map((segment) => segment.circuitId)),
      parentIds,
      driverIds,
      assistantIds,
      vehicleIds: unique([vehicleId]),
      schoolId: child.schoolId || "",
      transferHubIds: [...transferHubsById.keys()],
      activeParentKey: weekPattern === "even" ? "mother" : weekPattern === "odd" ? "father" : "",
      alternatingResidenceMode: weekPattern === "all" ? "" : "uses_child_alternating_residence",
      pmrRequired: isPmr,
      wheelchairRequired: child.wheelchairRequired === true || child.hasWheelchair === true,
      source: "legacy_import",
      migrationStatus: "needs_review"
    }, common);
    studentAssignments.push(assignment);
  }

  result.transferHubs = [...transferHubsById.values()];
  result.tripSegments = tripSegments;
  result.stopPassages = stopPassages;
  result.studentAssignments = studentAssignments;

  const invalidSegments = tripSegments.filter((segment) => !helpers.isValidTripSegment(segment)).map((segment) => segment.id);
  const invalidPassages = stopPassages.filter((passage) => !helpers.isValidStopPassage(passage)).map((passage) => passage.id);
  const invalidAssignments = studentAssignments.filter((assignment) => !helpers.isValidStudentAssignment(assignment)).map((assignment) => assignment.id);
  if (invalidSegments.length) result.errors.push(`invalid_trip_segments:${invalidSegments.join(",")}`);
  if (invalidPassages.length) result.errors.push(`invalid_stop_passages:${invalidPassages.join(",")}`);
  if (invalidAssignments.length) result.errors.push(`invalid_student_assignments:${invalidAssignments.join(",")}`);

  for (const assignment of studentAssignments) {
    const view = helpers.transportViewForChild(child, {
      date: "2026-06-17",
      direction: "morning",
      transportManagerId,
      studentAssignments,
      stopPassages,
      tripSegments,
      vehicles: legacy.vehicles || [],
      drivers: legacy.drivers || [],
      assistants: legacy.assistants || [],
      includeRaw: false
    });
    result.transportViews.push({
      assignmentId: assignment.id,
      source: view.source,
      pickup: view.summary.activePickupStopLabel,
      circuitIds: view.transport.circuitIds,
      alerts: view.alerts.map((alert) => alert.code)
    });
  }

  if (result.errors.length) result.status = "incoherent";
  else if (result.warnings.length) result.status = "incomplet";
  return result;
}

function printSection(title) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function printList(title, items, limit) {
  printSection(title);
  if (!items.length) {
    console.log("Aucun.");
    return;
  }
  items.slice(0, limit).forEach((item) => {
    console.log(`- ${item.childName} (${item.childId})`);
    if (item.warnings.length) console.log(`  warnings: ${item.warnings.join(", ")}`);
    if (item.errors.length) console.log(`  erreurs: ${item.errors.join(", ")}`);
  });
  if (items.length > limit) console.log(`... ${items.length - limit} autre(s) non affiché(s).`);
}

async function main() {
  const args = parseArgs();
  const plan = await createGtsV2DryRunPlan({ input: args.input });
  const { source, children, results, generated } = plan;

  console.log("Dry-run migration GTS V2");
  console.log("========================");
  console.log(`Source: ${source}`);
  console.log("Mode: lecture locale uniquement, aucune écriture Firestore.");
  console.log(`Élèves détectés: ${children.length}`);

  const migrable = results.filter((item) => item.status === "migrable");
  const incomplets = results.filter((item) => item.status === "incomplet");
  const incoherents = results.filter((item) => item.status === "incoherent");

  printSection("Objets V2 générés en mémoire");
  console.log(`transferHubs: ${generated.transferHubs.size}`);
  console.log(`tripSegments: ${generated.tripSegments.size}`);
  console.log(`stopPassages: ${generated.stopPassages.size}`);
  console.log(`studentAssignments: ${generated.studentAssignments.size}`);

  printSection("Statuts élèves");
  console.log(`Migrables: ${migrable.length}`);
  console.log(`Incomplets: ${incomplets.length}`);
  console.log(`Incohérents: ${incoherents.length}`);

  printList("Élèves migrables", migrable, args.limit);
  printList("Élèves incomplets", incomplets, args.limit);
  printList("Élèves incohérents", incoherents, args.limit);

  printSection("Vérification transportViewForChild");
  const views = results.flatMap((item) => item.transportViews.map((view) => ({ childId: item.childId, childName: item.childName, ...view })));
  if (!views.length) console.log("Aucune vue à vérifier.");
  views.slice(0, args.limit).forEach((view) => {
    console.log(`- ${view.childName}: source=${view.source}, pickup=${view.pickup || "n/a"}, circuits=${view.circuitIds.join(",") || "n/a"}, alertes=${view.alerts.join(",") || "aucune"}`);
  });
  if (views.length > args.limit) console.log(`... ${views.length - args.limit} vue(s) non affichée(s).`);

  printSection("Conclusion");
  if (!children.length) {
    console.log("Aucune donnée legacy exploitable trouvée dans la source locale. Fournir --input <dossier backup|json> après sauvegarde Firestore.");
  } else if (incoherents.length) {
    console.log("Dry-run terminé avec incohérences. Ne pas écrire V2 avant correction ou validation manuelle.");
  } else {
    console.log("Dry-run terminé sans écriture. Les objets V2 restent en mémoire uniquement.");
  }
}

export async function createGtsV2DryRunPlan({ input = "" } = {}) {
  const helpers = await loadGtsV2Helpers();
  const { source, data } = await loadLegacyData(input);
  const children = [...(data.children || []), ...(data.students || [])]
    .filter((child, index, list) => child?.id && list.findIndex((item) => item.id === child.id) === index);
  const results = children.map((child) => buildMigrationForChild(child, data, helpers));
  const generated = {
    transferHubs: new Map(),
    tripSegments: new Map(),
    stopPassages: new Map(),
    studentAssignments: new Map()
  };

  results.forEach((result) => {
    result.transferHubs.forEach((item) => addUnique(generated.transferHubs, item));
    result.tripSegments.forEach((item) => addUnique(generated.tripSegments, item));
    result.stopPassages.forEach((item) => addUnique(generated.stopPassages, item));
    result.studentAssignments.forEach((item) => addUnique(generated.studentAssignments, item));
  });

  return { source, data, children, results, generated, helpers };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error("Dry-run migration GTS V2 impossible.");
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  });
}
