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
  expect(Math.abs((incomeBox?.y ?? 0) - (duoBox?.y ?? 0))).toBeLessThanOrEqual(6);
  expect(duoBox?.x ?? 0).toBeGreaterThan(incomeBox?.x ?? 0);
});
