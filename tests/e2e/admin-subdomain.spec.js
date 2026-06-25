import { expect, test } from "@playwright/test";

const sessionBase = {
  activeApp: "gts",
  createdAt: Date.now(),
  lastActivityAt: Date.now(),
  lastUnlockedAt: Date.now(),
  persistentMobile: false,
  appLocked: false
};

const sessions = {
  admin: {
    id: "admin",
    role: "admin",
    userSnapshot: {
      id: "admin",
      role: "admin",
      firstName: "Administrateur",
      lastName: "Système",
      identifierNumber: "6183",
      assignedCircuits: ["C-12", "C-18"],
      isActive: true
    }
  },
  support: {
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
  transporteur: {
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
  chauffeur: {
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
  convoyeuse: {
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
  parent: {
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
  spw: {
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
  }
};

async function openAdminHost(page, session = null) {
  await page.addInitScript((storedSession) => {
    window.__GTS_HOSTNAME_OVERRIDE__ = "admin.gts-connect.be";
    window.__GTS_PUBLIC_SITE_URL_OVERRIDE__ = "/?adminDenied=1";
    if (storedSession) {
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
    }
  }, session ? { ...sessionBase, ...session } : null);
  await page.goto("/app");
}

test("admin.gts-connect.be affiche uniquement les profils administrateur et support", async ({ page }) => {
  await openAdminHost(page);

  await expect(page.getByRole("heading", { name: "Administration GTS Connect" })).toBeVisible();
  await expect(page.locator('[data-login-profile="system_admin"]')).toBeVisible();
  await expect(page.locator('[data-login-profile="support"]')).toBeVisible();
  await expect(page.locator('[data-login-profile="transport_manager"]')).toHaveCount(0);
  await expect(page.locator('[data-login-profile="driver"]')).toHaveCount(0);
  await expect(page.locator('[data-login-profile="assistant"]')).toHaveCount(0);
  await expect(page.locator('[data-login-profile="parent"]')).toHaveCount(0);
  await expect(page.locator('[data-login-profile="spw"]')).toHaveCount(0);
});

test("admin.gts-connect.be autorise un administrateur connecté", async ({ page }) => {
  await openAdminHost(page, sessions.admin);
  await expect(page.locator(".app-shell")).toBeVisible();
  await expect(page.locator("main")).toContainText(/Supervision technique|Supervision système/i);
});

test("admin.gts-connect.be autorise le support connecté", async ({ page }) => {
  await openAdminHost(page, sessions.support);
  await expect(page.locator(".app-shell")).toBeVisible();
  await expect(page.locator("main")).toContainText(/Centre Support|Supervision système/i);
});

for (const roleName of ["parent", "chauffeur", "convoyeuse", "transporteur", "spw"]) {
  test(`admin.gts-connect.be refuse le rôle ${roleName}`, async ({ page }) => {
    await openAdminHost(page, sessions[roleName]);

    await expect(page.locator(".app-shell")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Administration GTS Connect" })).toBeVisible();
    await expect(page.getByText("Accès réservé à l’administration")).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("gts-session"))).toBeNull();
    await page.waitForURL("**/?adminDenied=1");
  });
}
