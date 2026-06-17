import { createGtsV2DryRunPlan } from "./dry-run-gts-v2-migration.js";

const COLLECTION_SCHEMAS = {
  transferHubs: {
    required: ["id", "name", "label", "transportManagerIds", "active"],
    optional: ["schoolIds", "source", "migrationStatus", "createdAt", "updatedAt", "notes"],
    ruleFields: ["transportManagerIds", "schoolIds", "active"]
  },
  tripSegments: {
    required: [
      "id",
      "transportManagerId",
      "direction",
      "transportType",
      "circuitId",
      "segmentOrder",
      "from",
      "to",
      "plannedDepartureTime",
      "plannedArrivalTime",
      "vehicleId",
      "driverId",
      "validDays",
      "weekPattern",
      "active"
    ],
    optional: [
      "assistantId",
      "transferHubId",
      "schoolIds",
      "stopPassageIds",
      "replacementVehicleId",
      "replacementDriverId",
      "replacementAssistantId",
      "pmrCompatibleRequired",
      "wheelchairCompatibleRequired",
      "capacity",
      "wheelchairPlaces",
      "notes",
      "createdAt",
      "updatedAt"
    ],
    ruleFields: [
      "transportManagerId",
      "direction",
      "transportType",
      "circuitId",
      "vehicleId",
      "driverId",
      "assistantId",
      "transferHubId",
      "schoolIds",
      "validDays",
      "weekPattern",
      "active"
    ]
  },
  stopPassages: {
    required: [
      "id",
      "transportManagerId",
      "tripSegmentId",
      "circuitId",
      "direction",
      "transportType",
      "passageType",
      "stop",
      "plannedTime",
      "passageOrder",
      "validDays",
      "weekPattern",
      "active"
    ],
    optional: [
      "transferHubId",
      "schoolId",
      "tecStopId",
      "vehicleId",
      "driverId",
      "assistantId",
      "studentIds",
      "capacity",
      "wheelchairPlaces",
      "isTransferPoint",
      "isTerminalPoint",
      "isPmrHomePickup",
      "isPmrHomeDropoff",
      "notes",
      "createdAt",
      "updatedAt"
    ],
    ruleFields: [
      "transportManagerId",
      "tripSegmentId",
      "circuitId",
      "direction",
      "transportType",
      "passageType",
      "stop.type",
      "transferHubId",
      "schoolId",
      "tecStopId",
      "vehicleId",
      "driverId",
      "assistantId",
      "studentIds",
      "validDays",
      "weekPattern",
      "active"
    ]
  },
  studentAssignments: {
    required: [
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
    ],
    optional: [
      "transferHubIds",
      "driverIds",
      "assistantIds",
      "vehicleIds",
      "parentIds",
      "schoolId",
      "activeParentKey",
      "alternatingResidenceMode",
      "pmrRequired",
      "wheelchairRequired",
      "source",
      "migrationStatus",
      "notes",
      "createdAt",
      "updatedAt"
    ],
    ruleFields: [
      "studentId",
      "transportManagerId",
      "direction",
      "transportType",
      "weekPattern",
      "validDays",
      "passageIds",
      "tripSegmentIds",
      "circuitIds",
      "transferHubIds",
      "driverIds",
      "assistantIds",
      "vehicleIds",
      "parentIds",
      "schoolId",
      "activeParentKey",
      "active"
    ]
  }
};

function parseArgs(argv = process.argv.slice(2)) {
  const args = { input: "", limit: 10, showDocs: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") args.input = argv[index + 1] || "";
    if (arg === "--limit") args.limit = Number(argv[index + 1] || 10);
    if (arg === "--show-docs") args.showDocs = true;
  }
  return args;
}

function hasField(document = {}, fieldPath = "") {
  const value = fieldPath.split(".").reduce((current, key) => (current && typeof current === "object" ? current[key] : undefined), document);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return value !== undefined && value !== null;
}

function validateDocument(collectionName, document, helpers) {
  const schema = COLLECTION_SCHEMAS[collectionName];
  const missingRequired = schema.required.filter((field) => !hasField(document, field));
  const missingRuleFields = schema.ruleFields.filter((field) => !hasField(document, field));
  const helperValidations = {
    tripSegments: helpers.isValidTripSegment,
    stopPassages: helpers.isValidStopPassage,
    studentAssignments: helpers.isValidStudentAssignment
  };
  const helperValidation = helperValidations[collectionName];
  const helperValid = helperValidation ? helperValidation(document) : missingRequired.length === 0;
  return {
    id: document.id || "",
    collectionName,
    helperValid,
    missingRequired,
    missingRuleFields,
    ready: helperValid && missingRequired.length === 0
  };
}

function collectionEntries(generated, collectionName) {
  return [...(generated[collectionName]?.values?.() || [])];
}

function printSection(title) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function printSchemaSummary() {
  printSection("Schémas Firestore V2 vérifiés");
  Object.entries(COLLECTION_SCHEMAS).forEach(([collectionName, schema]) => {
    console.log(`- ${collectionName}`);
    console.log(`  obligatoires: ${schema.required.join(", ")}`);
    console.log(`  dénormalisés rules: ${schema.ruleFields.join(", ")}`);
  });
}

function printWritePlan(collectionName, documents, validations, limit, showDocs) {
  const ready = validations.filter((item) => item.ready);
  const blocked = validations.filter((item) => !item.ready);
  console.log(`- ${collectionName}: ${documents.length} document(s) préparé(s), ${ready.length} prêt(s), ${blocked.length} bloqué(s)`);
  documents.slice(0, limit).forEach((document) => {
    const validation = validations.find((item) => item.id === document.id);
    const path = `${collectionName}/${document.id}`;
    const status = validation?.ready ? "would_write" : "blocked";
    console.log(`  ${status}: ${path}`);
    if (validation?.missingRuleFields.length) console.log(`    champs rules à vérifier: ${validation.missingRuleFields.join(", ")}`);
    if (validation && !validation.ready) {
      if (validation.missingRequired.length) console.log(`    champs obligatoires manquants: ${validation.missingRequired.join(", ")}`);
      if (!validation.helperValid) console.log("    validation helper: échec");
    }
    if (showDocs) console.log(JSON.stringify(document, null, 2));
  });
  if (documents.length > limit) console.log(`  ... ${documents.length - limit} autre(s) document(s) non affiché(s).`);
}

async function main() {
  const args = parseArgs();
  const plan = await createGtsV2DryRunPlan({ input: args.input });
  const { source, children, results, generated, helpers } = plan;
  const collections = Object.keys(COLLECTION_SCHEMAS);
  const validationsByCollection = {};

  collections.forEach((collectionName) => {
    validationsByCollection[collectionName] = collectionEntries(generated, collectionName)
      .map((document) => validateDocument(collectionName, document, helpers));
  });

  const incoherentChildren = results.filter((item) => item.status === "incoherent");
  const incompleteChildren = results.filter((item) => item.status === "incomplet");
  const blockedDocuments = Object.values(validationsByCollection).flat().filter((item) => !item.ready);
  const readyDocuments = Object.values(validationsByCollection).flat().filter((item) => item.ready);

  console.log("Préparation Firestore GTS V2");
  console.log("============================");
  console.log(`Source: ${source}`);
  console.log("Mode: dry-run uniquement, aucune écriture Firestore.");
  console.log("Collections ciblées: transferHubs, tripSegments, stopPassages, studentAssignments");
  console.log(`Élèves analysés: ${children.length}`);

  printSchemaSummary();

  printSection("Plan d'écriture dry-run");
  collections.forEach((collectionName) => {
    const documents = collectionEntries(generated, collectionName);
    printWritePlan(collectionName, documents, validationsByCollection[collectionName], args.limit, args.showDocs);
  });

  printSection("Synthèse validation");
  console.log(`Documents prêts: ${readyDocuments.length}`);
  console.log(`Documents bloqués: ${blockedDocuments.length}`);
  console.log(`Élèves incomplets: ${incompleteChildren.length}`);
  console.log(`Élèves incohérents: ${incoherentChildren.length}`);

  if (blockedDocuments.length) {
    printSection("Blocages documents");
    blockedDocuments.slice(0, args.limit).forEach((item) => {
      console.log(`- ${item.collectionName}/${item.id || "sans-id"}`);
      if (item.missingRequired.length) console.log(`  champs obligatoires manquants: ${item.missingRequired.join(", ")}`);
      if (item.missingRuleFields.length) console.log(`  champs rules à vérifier: ${item.missingRuleFields.join(", ")}`);
      if (!item.helperValid) console.log("  validation helper: échec");
    });
    if (blockedDocuments.length > args.limit) console.log(`... ${blockedDocuments.length - args.limit} autre(s) blocage(s) non affiché(s).`);
  }

  printSection("Commande dry-run");
  console.log(`node scripts/prepare-firestore-v2.js${args.input ? ` --input ${args.input}` : ""} --limit ${args.limit}`);

  printSection("Conclusion");
  if (!children.length) {
    console.log("Aucune donnée source exploitable. Fournir une sauvegarde avec --input <dossier>.");
  } else if (blockedDocuments.length || incoherentChildren.length) {
    console.log("Préparation terminée avec blocages. Aucune écriture V2 ne doit être lancée avant validation/correction.");
  } else {
    console.log("Préparation terminée. Les écritures V2 restent théoriques et non exécutées.");
  }
}

main().catch((error) => {
  console.error("Préparation Firestore GTS V2 impossible.");
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
