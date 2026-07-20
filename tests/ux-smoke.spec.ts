import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

type AppManifest = {
  slug: string;
  visibility?: "public" | "hidden";
};

const allowanceScanRoute = "/apps/toeslagen-scan";

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

test("maximale hypotheek toont rentelink en salarisverhogingsanalyse", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto("/apps/artifact-hypotheek-wonen-maximale-hypotheek", {
    waitUntil: "networkidle",
  });

  const rateLink = page.getByRole("link", {
    name: /Bekijk actuele hypotheekrentes ter inspiratie/,
  });
  await expect(rateLink).toBeVisible();
  await expect(rateLink).toHaveAttribute(
    "href",
    "https://www.geld.nl/hypotheek/hypotheekrente",
  );
  await expect(rateLink).toHaveAttribute("target", "_blank");
  await expect(rateLink).toHaveAttribute("rel", "noopener noreferrer");

  const rateInput = page.getByRole("textbox", { name: /Hypotheekrente/ });
  await rateInput.fill("4,2");
  await expect(rateInput).toHaveValue("4,2");

  await page.goto("/apps/hypotheek-impact-studieschuld", {
    waitUntil: "networkidle",
  });
  const impactRateLink = page.getByRole("link", {
    name: /Bekijk actuele hypotheekrentes ter inspiratie/,
  });
  await expect(impactRateLink).toBeVisible();
  await expect(impactRateLink).toHaveAttribute(
    "href",
    "https://www.geld.nl/hypotheek/hypotheekrente",
  );
  await expect(impactRateLink).toHaveAttribute("target", "_blank");
  await expect(impactRateLink).toHaveAttribute("rel", "noopener noreferrer");
  const impactRateInput = page.getByRole("textbox", {
    name: /Hypotheekrentepercentage/,
  });
  await impactRateInput.fill("4,3");
  await expect(impactRateInput).toHaveValue("4,3");

  await page.goto("/apps/artifact-hypotheek-wonen-maximale-hypotheek", {
    waitUntil: "networkidle",
  });

  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page.getByRole("button", { name: "Bereken maximale hypotheek" }).click();
  await expect(page.locator("#tool-result-summary").getByText("Einduitkomst")).toBeVisible();

  await page
    .getByText("Wat doet een salarisverhoging met mijn leenruimte?")
    .click();
  await expect(page.getByText("Huidig bruto jaarinkomen")).toBeVisible();

  await page.getByLabel("Nieuw bruto jaarinkomen slider").fill("81200");
  const newIncomeInput = page.getByRole("textbox", {
    name: /Nieuw bruto jaarinkomen/,
  });
  await expect(newIncomeInput).toHaveValue("81200");
  await expect(page.getByText("+ EUR 100 bruto per maand")).toBeVisible();

  await newIncomeInput.fill("100000");
  await expect(page.getByText("buiten het praktische sliderbereik")).toBeVisible();
  await expect(page.getByText("Gekozen nieuw inkomen")).toBeVisible();
  await expect(page.getByText("Verschil leenruimte gekozen inkomen")).toBeVisible();

  await newIncomeInput.fill("70000");
  await expect(page.getByText("Inkomensverschil")).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Verschil leenruimte" }),
  ).toBeVisible();
  await expect(page.getByText("het verschil in leenruimte kan daardoor negatief zijn")).toBeVisible();

  await page.getByRole("textbox", { name: /^Bruto jaarinkomen/ }).fill("90000");
  await expect(
    page.getByText("Deze analyse gebruikt nog je laatst berekende hypotheekscenario"),
  ).toBeVisible();

  await page.getByRole("button", { name: "Wis invoer" }).click();
  await expect(
    page.getByText("Wat doet een salarisverhoging met mijn leenruimte?"),
  ).toHaveCount(0);
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

  await page.getByRole("textbox", { name: /^Bruto jaarinkomen gebruiker/ }).fill("51000");
  await expect(pdfButton).toHaveCount(0);
  await expect(
    page.getByText("Bereken opnieuw om een actueel PDF-overzicht te downloaden."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Bereken opnieuw" }).click();
  await expect(pdfButton).toBeVisible();

  await page.getByRole("button", { name: "Wis invoer" }).click();
  await expect(pdfButton).toHaveCount(0);
  await expect(
    page.getByText("PDF-overzicht gemaakt met de laatst berekende invoer."),
  ).toHaveCount(0);
});

test("hypotheek-impact haalt DUO-maandbedrag op via expliciete returnflow", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto("/apps/hypotheek-impact-studieschuld", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Start met voorbeeldwaarden" }).click();
  await page
    .getByRole("button", { name: "Bereken eerst mijn DUO-maandbedrag" })
    .click();

  await expect(page).toHaveURL(/\/apps\/duo-maandbedrag\?duoMortgageTransfer=/);
  const duoUrl = new URL(page.url());
  expect([...duoUrl.searchParams.keys()]).toEqual(["duoMortgageTransfer"]);
  expect(duoUrl.search).not.toContain("150");
  expect(duoUrl.search).not.toContain("48000");
  await expect(page.getByText("Je kwam vanuit de hypotheektool")).toBeVisible();

  await page
    .getByRole("button", { name: "Terug naar mijn hypotheekberekening" })
    .click();

  await expect(page).toHaveURL(/\/apps\/hypotheek-impact-studieschuld/);
  await expect(page.getByText("DUO-bedrag uit rekentool")).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Dit bedrag gebruiken in mijn hypotheekberekening",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Huidig DUO-maandbedrag" }),
  ).toHaveValue("150");

  await page
    .getByRole("button", {
      name: "Dit bedrag gebruiken in mijn hypotheekberekening",
    })
    .click();

  await expect(
    page.getByText("Klik opnieuw op Bereken om de uitkomst te vernieuwen."),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Huidig DUO-maandbedrag" }),
  ).not.toHaveValue("150");
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
  expect(uniqueToolRoutes).not.toContain(allowanceScanRoute);
  await expect(page.getByText("Waarom dit rustig blijft")).toBeVisible();

  await page.getByRole("button", { name: "Alle tools" }).click();
  await expect(page.locator(`a[href="${allowanceScanRoute}"]`)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Welke toeslagen passen mogelijk bij mij?" }),
  ).toBeVisible();
});

test("toeslagenscan is publiek vindbaar via dashboard en app-overzicht", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop routecontrole");

  await page.goto("/apps", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Alle tools" }).click();
  await expect(page.locator(`a[href="${allowanceScanRoute}"]`)).toBeVisible();

  await page.goto("/v2/apps", { waitUntil: "networkidle" });
  await expect(page.getByText("10 van 10")).toBeVisible();
  await page.getByLabel("Zoek tool").fill("zorgtoeslag");
  await expect(
    page.getByRole("heading", { name: "Welke toeslagen passen mogelijk bij mij?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Regelingen en maandruimte" }).click();
  await expect(page.getByText("1 van 10")).toBeVisible();
});

test("publieke toeslagenscan route, formulier en signal-only resultaat werken", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  const response = await page.goto(allowanceScanRoute, { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await page.reload({ waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Welke toeslagen passen mogelijk bij mij?", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Beta · toeslagenadviseur 2026")).toBeVisible();
  await expect(
    page.getByText("Geen advies en geen officiële beschikking"),
  ).toBeVisible();
  await expect(page.getByText("centrale vraagflow en toeslagenberekening")).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Voortgang van relevante toeslagenvragen" }),
  ).toBeVisible();
  await expect(page.getByText("Volgende stap: vul leeftijd in.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Download uitgebreid PDF-overzicht" })).toHaveCount(0);

  const bodyText = (await page.locator("body").innerText()).toLowerCase();
  expect(bodyText).not.toContain("je hebt recht op");
  expect(bodyText).not.toContain("je ontvangt");
  expect(bodyText).not.toContain("gegarandeerd recht");

  await page.getByRole("button", { name: "Voorbeeldwaarden" }).click();
  await expect(page.getByText("Niet van toepassing")).toBeVisible();
  await page.getByLabel("Leeftijden kinderen").fill("6");
  await page.getByLabel("Heb je kinderen?", { exact: true }).selectOption("unknown");
  await expect(page.getByLabel("Kale huur per maand")).toBeVisible();
  await expect(page.getByText("Afgeleid uit eerdere antwoorden")).toBeVisible();
  await page.getByRole("button", { name: "Bekijk mijn toeslagenadvies" }).click();
  await expect(page.locator("#tool-result-summary article")).toHaveCount(4);
  await expect(page.getByRole("heading", { name: "Zorgtoeslag" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Huurtoeslag" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kindgebonden budget" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kinderopvangtoeslag" })).toBeVisible();
  await expect(page.getByText("eligible-estimate").first()).toBeVisible();
  await expect(page.getByText("Per maand").first()).toBeVisible();
  await expect(page.getByText("Betrouwbaarheid:").first()).toBeVisible();

  const officialLinks = page.locator("#tool-result-summary a[href^='https://www.belastingdienst.nl/']");
  await expect(officialLinks.first()).toBeVisible();
  expect(await officialLinks.count()).toBeGreaterThanOrEqual(4);

  await page.getByRole("textbox", { name: "Leeftijd", exact: true }).fill("35");
  await expect(
    page.getByText("Je hebt de invoer gewijzigd na de laatste scan."),
  ).toBeVisible();

  await page.getByLabel("Woonsituatie", { exact: true }).selectOption("owner");
  await expect(page.getByLabel("Kale huur per maand")).toHaveCount(0);
  await expect(page.getByText("Niet gevraagd in deze route")).toBeVisible();
  await page.getByLabel("Heb je kinderen?", { exact: true }).selectOption("no");
  await expect(page.getByLabel("Opvanguren per maand")).toHaveCount(0);

  await page.getByRole("button", { name: "Wis invoer" }).click();
  await expect(page.getByText("Nog geen scan uitgevoerd")).toBeVisible();
});

test("toeslagenscan v2-route werkt en verborgen routes blijven 404", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop routecontrole");

  const response = await page.goto("/v2/apps/toeslagen-scan", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await page.reload({ waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Welke toeslagen passen mogelijk bij mij?", level: 1 }),
  ).toBeVisible();

  const hiddenResponse = await page.goto("/apps/volgende-euro", { waitUntil: "networkidle" });
  expect(hiddenResponse?.status()).toBe(404);
  const response404 = await page.goto("/apps/bestaat-niet", {
    waitUntil: "networkidle",
  });
  expect(response404?.status()).toBe(404);
});

test("mobiele toeslagenscan houdt 390px zonder horizontale overflow en focusbasis", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobiele controle");

  await page.goto(allowanceScanRoute, { waitUntil: "networkidle" });
  await expect(
    page.getByRole("progressbar", { name: "Voortgang van relevante toeslagenvragen" }),
  ).toBeVisible();
  await expect(page.getByText("Volgende stap: vul leeftijd in.")).toBeVisible();
  await page.keyboard.press("Tab");
  const activeTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
  expect(activeTag).toMatch(/a|button|input|select/);

  const audit = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(audit.bodyWidth).toBeLessThanOrEqual(audit.viewportWidth + 1);
});

test("hidden toeslagenscan route is niet langer 404", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop routecontrole");

  const response = await page.goto(allowanceScanRoute, {
    waitUntil: "networkidle",
  });
  expect(response?.status()).toBe(200);
  await expect(page.getByText("Hidden draft")).toHaveCount(0);
  await expect(page.getByText("hidden draft")).toHaveCount(0);
});

test("onbekende app slug blijft 404", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop routecontrole");

  const response = await page.goto("/apps/onbekende-tool", {
    waitUntil: "networkidle",
  });
  expect(response?.status()).toBe(404);
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
