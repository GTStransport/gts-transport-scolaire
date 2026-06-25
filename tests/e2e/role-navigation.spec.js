import { expect, test } from "@playwright/test";

const sessionBase = {
  activeApp: "gts",
  createdAt: Date.now(),
  lastActivityAt: Date.now(),
  lastUnlockedAt: Date.now(),
  persistentMobile: false,
  appLocked: false
};

const roleSessions = [
  {
    roleName: "transporteur",
    session: {
      id: "e2e-transport-manager",
      role: "admin",
      userSnapshot: {
        id: "e2e-transport-manager",
        role: "admin",
        firstName: "Gestionnaire",
        lastName: "E2E",
        identifierNumber: "TR-0001",
        assignedCircuits: ["C-12"],
        isActive: true
      }
    },
    desktopTexts: ["Tableau de bord", "Véhicules hors service/retard", "Chauffeurs"]
  },
  {
    roleName: "chauffeur",
    session: {
      id: "driver",
      role: "driver",
      userSnapshot: {
        id: "driver",
        role: "driver",
        firstName: "Marc",
        lastName: "Lefèvre",
        identifierNumber: "1234",
        assignedCircuits: ["C-12"],
        assignedVehicleId: "vehicle-1",
        isActive: true
      }
    },
    desktopTexts: ["Marc Lefèvre", "Tableau de bord", "Élèves", "Messages"]
  },
  {
    roleName: "convoyeuse",
    session: {
      id: "assistant",
      role: "assistant",
      userSnapshot: {
        id: "assistant",
        role: "assistant",
        firstName: "Nadia",
        lastName: "Lambert",
        identifierNumber: "5678",
        assignedCircuits: ["C-12"],
        isActive: true
      }
    },
    desktopTexts: ["Nadia Lambert", "Tableau de bord", "Élèves", "Messages"]
  },
  {
    roleName: "parent",
    session: {
      id: "parent-1",
      role: "parent",
      userSnapshot: {
        id: "parent-1",
        role: "parent",
        firstName: "Claire",
        lastName: "Moreau",
        linkedChildrenIds: ["child-1", "child-2"],
        isActive: true
      }
    },
    desktopTexts: ["Claire Moreau", "Accueil", "Enfant(s)", "Messages"]
  },
  {
    roleName: "spw",
    session: {
      id: "e2e-spw",
      role: "admin",
      userSnapshot: {
        id: "e2e-spw",
        role: "admin",
        visualTheme: "spw",
        firstName: "SPW",
        lastName: "E2E",
        identifierNumber: "SPW-0001",
        assignedCircuits: [],
        isActive: true
      }
    },
    desktopTexts: ["Tableau de bord", "Élèves", "Messages"]
  },
  {
    roleName: "support",
    session: {
      id: "support",
      role: "support",
      userSnapshot: {
        id: "support",
        role: "support",
        firstName: "Centre",
        lastName: "Support",
        identifierNumber: "1990",
        assignedCircuits: [],
        isActive: true
      }
    },
    desktopTexts: ["Centre Support", "Supervision système", "Connexions"]
  }
];

async function openWithSession(page, session) {
  await page.addInitScript((storedSession) => {
    localStorage.setItem("gts-session", JSON.stringify({
      ...storedSession,
      activeApp: "gts",
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      lastUnlockedAt: Date.now(),
      persistentMobile: false,
      appLocked: false
    }));
    localStorage.setItem("gts-view-state", JSON.stringify({
      userId: storedSession.id,
      role: storedSession.role,
      activeApp: "gts",
      screen: "dashboard",
      savedAt: Date.now()
    }));
  }, { ...sessionBase, ...session });
  await page.goto("/app");
}

test.describe("navigation connectee par role", () => {
  for (const role of roleSessions) {
    test(`affiche les acces attendus pour ${role.roleName}`, async ({ page }, testInfo) => {
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") pageErrors.push(message.text());
      });

      await openWithSession(page, role.session);
      await expect(page.locator(".app-shell")).toBeVisible();
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("main")).toContainText(/Tableau de bord|Centre Support|Aucun enfant/i);

      if (testInfo.project.name.includes("mobile")) {
        await expect(page.locator("[data-screen]").first()).toBeAttached();
        await expect(pageErrors).toEqual([]);
        return;
      }

      for (const text of role.desktopTexts) {
        await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
      }

      await expect(pageErrors).toEqual([]);
    });
  }
});

test("la recherche connectee accepte une saisie sans erreur", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "La recherche mobile est couverte par le rendu responsive public.");
  const transport = roleSessions.find((role) => role.roleName === "transporteur");
  await openWithSession(page, transport.session);
  const search = page.getByPlaceholder(/Rechercher/i).first();
  await expect(search).toBeVisible();
  await search.fill("Lucas");
  await expect(search).toHaveValue("Lucas");
});
