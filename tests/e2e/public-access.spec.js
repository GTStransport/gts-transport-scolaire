import { expect, test } from "@playwright/test";

const profiles = [
  { id: "transport_manager", label: "Transporteur", submit: "Se connecter", identifier: "Identifiant" },
  { id: "driver", label: "Chauffeurs", submit: "Se connecter", identifier: "Identifiant" },
  { id: "spw", label: "SPW", submit: "Se connecter", identifier: "Identifiant" },
  { id: "assistant", label: "Convoyeuses", submit: "Se connecter", identifier: "Identifiant" },
  { id: "parent", label: "Parents", submit: "Connexion parent", identifier: "Nom de l’élève" }
];

test.beforeEach(async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (["error"].includes(message.type())) pageErrors.push(message.text());
  });
  page.pageErrors = pageErrors;
});

test.afterEach(async ({ page }) => {
  expect(page.pageErrors).toEqual([]);
});

test("les profils de connexion ouvrent les bons formulaires", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
  await expect(page.getByText("Sélectionnez votre profil")).toBeVisible();

  for (const profile of profiles) {
    await page.locator(`[data-login-profile="${profile.id}"]`).click();
    await expect(page.getByText(profile.label).first()).toBeVisible();
    await expect(page.getByLabel(profile.identifier)).toBeVisible();
    await expect(page.getByRole("button", { name: new RegExp(profile.submit) })).toBeVisible();
    await page.goto("/");
  }
});

test("le formulaire support public est disponible sans envoi de donnees", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Contactez le support" }).click();

  await expect(page.getByRole("heading", { name: "Demande support" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Nom", exact: true })).toBeVisible();
  await expect(page.getByLabel("Prénom")).toBeVisible();
  await expect(page.getByLabel("Téléphone")).toBeVisible();
  await expect(page.getByLabel("Adresse e-mail")).toBeVisible();
  await expect(page.getByLabel("Profil concerné")).toBeVisible();
  await expect(page.getByLabel("Sujet")).toBeVisible();
  await expect(page.getByLabel("Catégorie")).toBeVisible();
  await expect(page.getByLabel("Priorité")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Envoyer demande support" })).toBeVisible();

  await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Test");
  await page.getByLabel("Prénom").fill("Support");
  await page.getByLabel("Téléphone").fill("0400000000");
  await page.getByLabel("Adresse e-mail").fill("test@example.invalid");
  await page.getByLabel("Sujet").fill("Test interface");
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Verification du formulaire sans envoi.");
});

test("les pages legales publiques sont accessibles", async ({ page }) => {
  const pages = [
    ["/conditions-generales", "Conditions générales"],
    ["/confidentialite-rgpd", "Confidentialité RGPD"],
    ["/mentions-legales", "Mentions légales"]
  ];

  for (const [url, title] of pages) {
    await page.goto(url);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }
});

test("la page de connexion ne deborde pas horizontalement", async ({ page }) => {
  await page.goto("/");
  const sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth);
});
