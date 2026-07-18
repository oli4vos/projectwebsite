import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

type AppManifest = {
  slug: string;
  visibility?: "public" | "hidden";
};

function getPublicToolRoutes() {
  const appsDirectory = path.join(process.cwd(), "apps");

  return fs
    .readdirSync(appsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const manifestPath = path.join(appsDirectory, entry.name, "app.json");
      if (!fs.existsSync(manifestPath)) return [];

      const manifest = JSON.parse(
        fs.readFileSync(manifestPath, "utf8"),
      ) as AppManifest;

      return (manifest.visibility ?? "public") === "public"
        ? [`/apps/${manifest.slug}`]
        : [];
    })
    .sort();
}

const routes = ["/", "/kennisbank", "/variabelen", ...getPublicToolRoutes()];

for (const route of routes) {
  test(`${route} heeft een bruikbare basisstructuur`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    expect(pageErrors).toEqual([]);

    const audit = await page.evaluate(() => {
      function accessibleName(control: Element) {
        const id = control.getAttribute("id");
        const explicitLabel = id
          ? document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent
          : "";

        return (
          control.getAttribute("aria-label") ||
          explicitLabel ||
          control.closest("label")?.textContent ||
          ""
        ).trim();
      }

      const controls = [...document.querySelectorAll("input, select, textarea")];
      const fieldFlows = [...document.querySelectorAll('[class*="md:hidden"]')]
        .filter((element) => /Veld\s+\d+\s+van\s+\d+/.test(element.textContent ?? ""))
        .map((element) => Boolean(element.getClientRects().length));

      return {
        bodyWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
        h1Count: document.querySelectorAll("h1").length,
        mainCount: document.querySelectorAll("main").length,
        unlabeledControlCount: controls.filter(
          (control) => accessibleName(control).length === 0,
        ).length,
        fieldFlows,
      };
    });

    expect(audit.bodyWidth).toBeLessThanOrEqual(audit.viewportWidth + 1);
    expect(audit.h1Count).toBe(1);
    expect(audit.mainCount).toBe(1);
    expect(audit.unlabeledControlCount).toBe(0);
    if (testInfo.project.name.startsWith("mobile")) {
      expect(audit.fieldFlows.every(Boolean)).toBe(true);
    }
  });
}

test("mobiele hypotheekflow kan naar veld 2", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Alleen relevant op mobiel");

  await page.goto("/apps/hypotheek-impact-studieschuld", {
    waitUntil: "networkidle",
  });

  await expect(page.getByText("Veld 1 van 15")).toBeVisible();
  await page.getByRole("button", { name: "Volgende veld" }).click();
  await expect(page.getByText(/Veld 2 van \d+/)).toBeVisible();
  await expect(page.getByLabel("Terugbetalingsregel")).toBeVisible();
});

test("DUO-impact staat rechtsboven in de hypotheekuitkomst", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktoppositie controleren");

  await page.goto("/apps/artifact-hypotheek-wonen-maximale-hypotheek", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page.getByRole("button", { name: "Bereken maximale hypotheek" }).click();

  const summary = page.locator("#tool-result-summary");
  const incomeCard = summary.locator("article").filter({
    hasText: "Maximale hypotheek op inkomen",
  });
  const duoCard = summary.locator("article").filter({ hasText: "Impact DUO-schuld" });

  await expect(duoCard).toContainText("− € 42.334");

  const incomeBox = await incomeCard.boundingBox();
  const duoBox = await duoCard.boundingBox();
  expect(incomeBox).not.toBeNull();
  expect(duoBox).not.toBeNull();
  expect(duoBox?.x ?? 0).toBeGreaterThan(incomeBox?.x ?? 0);
});

test("DUO-tools tonen de uitgebreide PDF-download", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  for (const route of [
    "/apps/duo-schuld-bij-starten-lenen",
    "/apps/duo-stoppen-kosten-prestatiebeurs",
    "/apps/duo-leenbedrag-impact",
    "/apps/duo-maandbedrag",
    "/apps/duo-extra-aflossen",
  ]) {
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: "Download uitgebreid PDF-overzicht" })).toBeVisible();
  }
});

test("hypotheek-impact maakt een PDF vanuit de laatst berekende invoer", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto("/apps/hypotheek-impact-studieschuld", {
    waitUntil: "networkidle",
  });

  const pdfButton = page.getByRole("button", {
    name: "Download uitgebreid PDF-overzicht",
  });
  await expect(pdfButton).toHaveCount(0);

  await page.getByRole("button", { name: "Start met voorbeeldwaarden" }).click();
  await page.getByRole("button", { name: "Bereken", exact: true }).click();
  await expect(pdfButton).toBeVisible();
  await expect(page.getByText("Verplicht DUO-bedrag:")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await pdfButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(
    /^hypotheek-impact-studieschuld-\d{4}-\d{2}\.pdf$/,
  );
  await expect(
    page.getByText("PDF-overzicht gemaakt met de laatst berekende invoer."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Wis invoer" }).click();
  await expect(pdfButton).toHaveCount(0);
  await expect(
    page.getByText("PDF-overzicht gemaakt met de laatst berekende invoer."),
  ).toHaveCount(0);
});

test("v2 routes houden mobiele breedtes zonder horizontale overflow", async ({
  page,
}) => {
  for (const route of ["/v2", "/v2/apps"]) {
    for (const width of [320, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(route, { waitUntil: "networkidle" });

      const audit = await page.evaluate(() => ({
        bodyWidth: document.body.scrollWidth,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      }));

      expect(audit.documentWidth, `${route} document @ ${width}px`).toBeLessThanOrEqual(
        audit.viewportWidth + 1,
      );
      expect(audit.bodyWidth, `${route} body @ ${width}px`).toBeLessThanOrEqual(
        audit.viewportWidth + 1,
      );
    }
  }
});

test("dashboard toont publieke toolkaarten met centrale surface-stijl", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop dashboardstijl controleren");

  await page.goto("/", { waitUntil: "networkidle" });

  const cards = page.locator('a[href^="/apps/"]').filter({ hasText: "Openen" });
  await expect(cards.first()).toBeVisible();

  const cardClass = await cards.first().getAttribute("class");
  expect(cardClass).toContain("surface-panel");
  const uniqueToolRoutes = await cards.evaluateAll((links) => [
    ...new Set(links.map((link) => link.getAttribute("href")).filter(Boolean)),
  ]);
  expect(uniqueToolRoutes).toHaveLength(9);
  await expect(page.getByText("Waarom dit rustig blijft")).toBeVisible();
});

test("losse DUO-tools tonen simpele scenario-uitkomst en schuldenvrije datum", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto("/apps/duo-leenbedrag-impact", { waitUntil: "networkidle" });
  await expect(page.getByLabel("Lening per maand slider")).toBeVisible();
  await page.getByLabel("Lening per maand slider").fill("250");
  await page.getByRole("button", { name: "Voorbeeld invullen" }).first().click();
  await page.getByRole("button", { name: "Bereken impact" }).first().click();

  await expect(page.getByRole("heading", { name: "Ik studeer al: impact nieuw leenbedrag per maand" })).toBeVisible();
  await expect(page.getByText("Schuldenvrij rond")).toBeVisible();
  await expect(page.getByText("Totaal betalen incl. rente")).toBeVisible();
});
