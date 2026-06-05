import fs from "node:fs/promises";
import test from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";

const projectId = `gts-rules-${Date.now()}`;
const rules = await fs.readFile("firestore.rules", "utf8");

const testEnv = await initializeTestEnvironment({
  projectId,
  firestore: { rules }
});

test.after(async () => {
  await testEnv.cleanup();
});

async function seedData() {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "users", "spw-1"), {
      id: "spw-1",
      role: "admin",
      visualTheme: "spw",
      transportManagerId: "tm-1"
    });
    await setDoc(doc(db, "users", "tm-1"), {
      id: "tm-1",
      role: "admin",
      transportManagerId: "tm-1"
    });
    await setDoc(doc(db, "parents", "parent-1"), {
      id: "parent-1",
      role: "parent",
      linkedChildrenIds: ["child-1"]
    });
    await setDoc(doc(db, "students", "child-1"), {
      id: "child-1",
      firstName: "Test",
      lastName: "Eleve",
      transportManagerId: "tm-1",
      parentIds: ["parent-1"],
      driverId: "driver-1",
      assistantId: "assistant-1",
      circuitNumber: "C-1"
    });
    await setDoc(doc(db, "studentMedical", "child-1"), {
      id: "child-1",
      parentIds: ["parent-1"],
      allergies: "Non",
      driverId: "driver-1",
      assistantId: "assistant-1"
    });
    await setDoc(doc(db, "studentSensitive", "child-1"), {
      id: "child-1",
      parentIds: ["parent-1"],
      sensitiveStudent: { internalNotes: "SPW only" },
      attentionSpeciale: true
    });
  });
}

function authedDb(uid, token = {}) {
  return testEnv.authenticatedContext(uid, token).firestore();
}

test("parent cannot read SPW sensitive student data", async () => {
  await seedData();
  const db = authedDb("parent-1", { role: "parent", linkedChildrenIds: ["child-1"] });
  await assertFails(getDoc(doc(db, "studentSensitive", "child-1")));
});

test("SPW can read SPW sensitive student data", async () => {
  await seedData();
  const db = authedDb("spw-1", { role: "spw", transportManagerId: "tm-1" });
  await assertSucceeds(getDoc(doc(db, "studentSensitive", "child-1")));
});

test("linked parent can read and update student medical sheet", async () => {
  await seedData();
  const db = authedDb("parent-1", { role: "parent", linkedChildrenIds: ["child-1"] });
  await assertSucceeds(getDoc(doc(db, "studentMedical", "child-1")));
  await assertSucceeds(updateDoc(doc(db, "studentMedical", "child-1"), {
    allergies: "Oui",
    updatedAt: new Date().toISOString()
  }));
});

test("transport manager cannot update sensitive fields on public student document", async () => {
  await seedData();
  const db = authedDb("tm-1", { role: "transport_manager", transportManagerId: "tm-1" });
  await assertFails(updateDoc(doc(db, "students", "child-1"), {
    attentionSpeciale: true
  }));
});
