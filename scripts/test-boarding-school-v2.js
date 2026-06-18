import { loadGtsV2Helpers } from "./dry-run-gts-v2-migration.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function firstDateForWeekPattern(pattern) {
  const helpers = globalThis.__boardingHelpers;
  const start = new Date("2026-01-01T12:00:00.000Z");
  for (let offset = 0; offset < 370; offset += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + offset);
    const isFriday = date.getUTCDay() === 5;
    const weekPattern = helpers.transportViewWeekPattern(date);
    if (isFriday && weekPattern === pattern) return date;
  }
  throw new Error(`Aucune date ${pattern} trouvée`);
}

function baseChild(id, extra = {}) {
  return {
    id,
    firstName: "Élève",
    lastName: id,
    schoolName: "École Horizon",
    ...extra
  };
}

function buildScenario({
  child,
  boardingMode,
  destinationType,
  direction = "evening",
  weekPattern = "all",
  validDays = ["friday"],
  activeParentKey = "",
  activeParentLabel = ""
}) {
  const transportManagerId = "tm-test";
  const circuitId = `circuit-${child.id}`;
  const pickupPassageId = `pass-${child.id}-pickup`;
  const dropoffPassageId = `pass-${child.id}-dropoff`;
  const tripSegmentId = `seg-${child.id}`;
  const fromStop = direction === "morning"
    ? { type: destinationType === "weekend_parent_home" ? "home_address" : "tec_stop", id: `from-${child.id}`, label: "Domicile ou arrêt parent" }
    : { type: "boarding_school", id: "boarding-school-1", label: "Internat Sainte-Marie" };
  const toStop = direction === "morning"
    ? { type: "boarding_school", id: "boarding-school-1", label: "Internat Sainte-Marie" }
    : { type: destinationType === "weekend_parent_home" ? "home_address" : "tec_stop", id: `to-${child.id}`, label: "Destination week-end" };
  const tripSegments = [{
    id: tripSegmentId,
    transportManagerId,
    direction,
    transportType: "circuit_ferme",
    destinationType,
    boardingMode,
    circuitId,
    segmentOrder: 1,
    from: fromStop,
    to: toStop,
    plannedDepartureTime: direction === "morning" ? "07:15" : "16:15",
    plannedArrivalTime: direction === "morning" ? "08:00" : "17:00",
    vehicleId: "vehicle-test",
    driverId: "driver-test",
    assistantId: "assistant-test",
    validDays,
    weekPattern,
    active: true
  }];
  const stopPassages = [
    {
      id: pickupPassageId,
      transportManagerId,
      tripSegmentId,
      circuitId,
      direction,
      transportType: "circuit_ferme",
      destinationType,
      boardingMode,
      passageType: "pickup",
      stop: fromStop,
      plannedTime: direction === "morning" ? "07:15" : "16:15",
      passageOrder: 1,
      vehicleId: "vehicle-test",
      driverId: "driver-test",
      assistantId: "assistant-test",
      validDays,
      weekPattern,
      active: true
    },
    {
      id: dropoffPassageId,
      transportManagerId,
      tripSegmentId,
      circuitId,
      direction,
      transportType: "circuit_ferme",
      destinationType,
      boardingMode,
      passageType: "dropoff",
      stop: toStop,
      plannedTime: direction === "morning" ? "08:00" : "17:00",
      passageOrder: 2,
      vehicleId: "vehicle-test",
      driverId: "driver-test",
      assistantId: "assistant-test",
      validDays,
      weekPattern,
      active: true
    }
  ];
  const studentAssignments = [{
    id: `asg-${child.id}`,
    studentId: child.id,
    transportManagerId,
    direction,
    transportType: "circuit_ferme",
    destinationType,
    boardingMode,
    weekPattern,
    validDays,
    pickupPassageId,
    dropoffPassageId,
    passageIds: [pickupPassageId, dropoffPassageId],
    tripSegmentIds: [tripSegmentId],
    circuitIds: [circuitId],
    driverIds: ["driver-test"],
    assistantIds: ["assistant-test"],
    vehicleIds: ["vehicle-test"],
    activeParentKey,
    activeParentLabel,
    boardingSchoolId: "boarding-school-1",
    boardingSchoolLabel: "Internat Sainte-Marie",
    active: true
  }];
  return { studentAssignments, stopPassages, tripSegments };
}

function validateScenario(name, helpers, child, generated, context, expected) {
  const invalidSegments = generated.tripSegments.filter((segment) => !helpers.isValidTripSegment(segment));
  const invalidPassages = generated.stopPassages.filter((passage) => !helpers.isValidStopPassage(passage));
  const invalidAssignments = generated.studentAssignments.filter((assignment) => !helpers.isValidStudentAssignment(assignment));
  assert(invalidSegments.length === 0, `${name}: segment invalide`);
  assert(invalidPassages.length === 0, `${name}: passage invalide`);
  assert(invalidAssignments.length === 0, `${name}: assignment invalide`);

  const view = helpers.transportViewForChild(child, {
    ...context,
    ...generated,
    vehicles: [{ id: "vehicle-test", name: "Véhicule test" }],
    drivers: [{ id: "driver-test", firstName: "Jean", lastName: "Test" }],
    assistants: [{ id: "assistant-test", firstName: "Marie", lastName: "Test" }]
  });

  assert(view.summary.isBoardingStudent === true, `${name}: isBoardingStudent attendu`);
  assert(view.summary.boardingMode === expected.boardingMode, `${name}: boardingMode attendu`);
  assert(view.summary.destinationType === expected.destinationType, `${name}: destinationType attendu`);
  if (expected.activeParentKey) assert(view.summary.activeParentKey === expected.activeParentKey, `${name}: activeParentKey attendu`);
  if (expected.activeParentLabel) assert(view.summary.activeParentLabel === expected.activeParentLabel, `${name}: activeParentLabel attendu`);

  return {
    name,
    source: view.source,
    isBoardingStudent: view.summary.isBoardingStudent,
    boardingMode: view.summary.boardingMode,
    destinationType: view.summary.destinationType,
    activeParentKey: view.summary.activeParentKey,
    activeParentLabel: view.summary.activeParentLabel,
    alerts: view.alerts.map((alert) => alert.code)
  };
}

async function main() {
  const helpers = await loadGtsV2Helpers();
  globalThis.__boardingHelpers = helpers;
  const evenFriday = firstDateForWeekPattern("even");
  const oddFriday = firstDateForWeekPattern("odd");
  const alternatingChild = baseChild("boarding-alternating", {
    alternatingResidence: {
      enabled: true,
      evenWeekParent: "Maman",
      oddWeekParent: "Papa",
      motherPickupStop: "Domicile maman",
      fatherPickupStop: "Domicile papa"
    }
  });

  const scenarios = [
    {
      name: "internat semaine complète",
      child: baseChild("boarding-full-week"),
      generated: buildScenario({
        child: baseChild("boarding-full-week"),
        boardingMode: "full_week",
        destinationType: "boarding_school",
        direction: "morning",
        validDays: ["monday"]
      }),
      context: { date: new Date("2026-01-05T12:00:00.000Z"), direction: "morning" },
      expected: { boardingMode: "full_week", destinationType: "boarding_school" }
    },
    {
      name: "retour week-end",
      child: baseChild("boarding-weekly-return"),
      generated: buildScenario({
        child: baseChild("boarding-weekly-return"),
        boardingMode: "weekly_return",
        destinationType: "weekend_parent_home"
      }),
      context: { date: new Date("2026-01-09T12:00:00.000Z"), direction: "evening" },
      expected: { boardingMode: "weekly_return", destinationType: "weekend_parent_home" }
    },
    {
      name: "retour un week-end sur deux",
      child: baseChild("boarding-alternate"),
      generated: buildScenario({
        child: baseChild("boarding-alternate"),
        boardingMode: "alternate_weekend_return",
        destinationType: "weekend_parent_home",
        weekPattern: "even"
      }),
      context: { date: evenFriday, direction: "evening" },
      expected: { boardingMode: "alternate_weekend_return", destinationType: "weekend_parent_home" }
    },
    {
      name: "garde alternée week-end",
      child: alternatingChild,
      generated: buildScenario({
        child: alternatingChild,
        boardingMode: "alternate_weekend_return",
        destinationType: "weekend_parent_home",
        weekPattern: "odd",
        activeParentKey: "father",
        activeParentLabel: "Papa"
      }),
      context: { date: oddFriday, direction: "evening" },
      expected: {
        boardingMode: "alternate_weekend_return",
        destinationType: "weekend_parent_home",
        activeParentKey: "father",
        activeParentLabel: "Papa"
      }
    }
  ];

  const results = scenarios.map((scenario) =>
    validateScenario(scenario.name, helpers, scenario.child, scenario.generated, scenario.context, scenario.expected)
  );

  console.log("Tests mémoire Internat V2");
  results.forEach((result) => {
    console.log(`- ${result.name}: OK`, JSON.stringify(result));
  });
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
