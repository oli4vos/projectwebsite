import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

type AppManifest = {
  slug: string;
  enabled?: boolean;
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

      return manifest.enabled !== false && (manifest.visibility ?? "public") === "public"
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

  await expect(page.getByText("Veld 1 van 13")).toBeVisible();
  await page.getByRole("button", { name: "Volgende veld" }).click();
  await expect(page.getByText(/Veld 2 van \d+/)).toBeVisible();
  await expect(page.getByLabel("Terugbetalingsregel")).toBeVisible();
});

test("maximale hypotheek toont één primaire uitkomst", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopuitkomst controleren");

  await page.goto("/apps/artifact-hypotheek-wonen-maximale-hypotheek", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page.getByRole("button", { name: "Bereken", exact: true }).click();

  const summary = page.locator("#tool-result-summary");
  await expect(summary.getByText("Indicatieve maximale hypotheek")).toBeVisible();
  await expect(summary.locator("article")).toHaveCount(1);
  await expect(summary.getByText("Impact DUO-schuld")).toHaveCount(0);
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
  await page.getByRole("button", { name: "Bereken", exact: true }).click();
  await expect(
    page.locator("#tool-result-summary").getByText("Indicatieve maximale hypotheek"),
  ).toBeVisible();

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
    if (
      route === "/apps/duo-schuld-bij-starten-lenen" ||
      route === "/apps/duo-stoppen-kosten-prestatiebeurs" ||
      route === "/apps/duo-leenbedrag-impact"
    ) {
      await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
      await page.getByRole("button", { name: "Bereken", exact: true }).click();
    }
    await expect(page.getByRole("button", { name: "Download overzicht" })).toBeVisible();
  }
});

test("gerichte DUO-tools gebruiken begrijpelijke PDF-bestandsnamen", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopdownload controleren");

  for (const { route, filename } of [
    {
      route: "/apps/duo-schuld-bij-starten-lenen",
      filename: /^verwachte-studieschuld-\d{4}-\d{2}\.pdf$/,
    },
    {
      route: "/apps/duo-stoppen-kosten-prestatiebeurs",
      filename: /^kosten-stoppen-met-studeren-\d{4}-\d{2}\.pdf$/,
    },
    {
      route: "/apps/duo-leenbedrag-impact",
      filename: /^impact-leenbedrag-\d{4}-\d{2}\.pdf$/,
    },
  ]) {
    await page.goto(route, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
    await page.getByRole("button", { name: "Bereken", exact: true }).click();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download overzicht" }).last().click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(filename);
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
    name: "Download overzicht",
  });
  await expect(pdfButton).toHaveCount(0);

  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page.getByRole("button", { name: "Bereken", exact: true }).click();
  await expect(pdfButton).toBeVisible();
  await expect(page.getByText(/Voor jouw situatie is het verplichte DUO-bedrag/)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await pdfButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(
    /^impact-studieschuld-op-hypotheek-\d{4}-\d{2}\.pdf$/,
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
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page
    .getByRole("button", { name: "Open DUO-maandbedrag" })
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

test("v2 routes zijn gepauzeerd voor de publieke livegang", async ({
  page,
}) => {
  for (const route of ["/v2", "/v2/apps", "/v2/apps/toeslagen-scan"]) {
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status(), `${route} should not be public`).toBe(404);
    expect(page.url()).toContain(route);
  }
});

test("homepage verwijst één keer naar het volledige tooloverzicht", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop routecontrole");

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: "Bekijk alle tools" })).toBeVisible();
  await expect(page.locator('a[href^="/apps/"]').filter({ hasText: "Open tool" })).toHaveCount(0);

  await page.goto("/apps", { waitUntil: "networkidle" });
  const cards = page.locator('a[href^="/apps/"]').filter({ hasText: "Open tool" });
  await expect(cards.first()).toBeVisible();

  const cardClass = await cards.first().getAttribute("class");
  expect(cardClass).toContain("surface-panel");
  const uniqueToolRoutes = await cards.evaluateAll((links) => [
    ...new Set(links.map((link) => link.getAttribute("href")).filter(Boolean)),
  ] as string[]);
  await expect(cards).toHaveCount(10);
  expect(uniqueToolRoutes).toHaveLength(10);
  expect(uniqueToolRoutes).not.toContain("/apps/familiehulp-eerste-woning");
  expect(uniqueToolRoutes).toContain(allowanceScanRoute);
  expect(uniqueToolRoutes.every((route) => !route.startsWith("/v2"))).toBe(true);
  await expect(page.locator('a[href^="/v2"]')).toHaveCount(0);
  await expect(page.getByText("Familiehulp")).toHaveCount(0);
  await expect(page.getByText("Waarom dit rustig blijft")).toHaveCount(0);

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
  await expect(page.locator(`a[href="${allowanceScanRoute}"]`)).toBeVisible();

  await page.goto("/apps", { waitUntil: "networkidle" });
  await expect(page.locator('a[href^="/v2"]')).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Welke toeslagen passen mogelijk bij mij?" }),
  ).toBeVisible();
  await expect(page.locator(`a[href="${allowanceScanRoute}"]`)).toBeVisible();
});

test("publieke toeslagenscan route, formulier en bedragindicatie werken", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  const response = await page.goto(allowanceScanRoute, { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await page.reload({ waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Welke toeslagen passen mogelijk bij mij?", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Toeslagenindicatie 2026")).toBeVisible();
  await expect(
    page.getByText(/geen officiële beschikking/i),
  ).toBeVisible();
  await expect(page.getByText("Je krijgt een bedrag waar je gegevens dat toelaten.")).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await expect(page.getByText("Volgende stap: vul leeftijd in.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Download uitgebreid PDF-overzicht" })).toHaveCount(0);

  const bodyText = (await page.locator("body").innerText()).toLowerCase();
  expect(bodyText).not.toContain("je hebt recht op");
  expect(bodyText).not.toContain("je ontvangt");
  expect(bodyText).not.toContain("gegarandeerd recht");

  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await expect(page.getByText("Niet van toepassing")).toHaveCount(0);
  await page.getByLabel("Leeftijden kinderen").fill("6");
  await page.getByLabel("Heb je kinderen?", { exact: true }).selectOption("unknown");
  await expect(page.getByLabel("Kale huur per maand")).toBeVisible();
  await expect(page.getByText("Afgeleid uit eerdere antwoorden")).toBeVisible();
  await page.getByRole("button", { name: "Bekijk mijn toeslagenindicatie" }).click();
  await expect(page.locator("[data-allowance-result]")).toHaveCount(4);
  await expect(page.getByText("Totaal per maand")).toBeVisible();
  await expect(page.getByText("Totaal per jaar")).toBeVisible();
  await expect(page.getByText(/Meegeteld: .*Zorgtoeslag/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Zorgtoeslag" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Huurtoeslag" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kindgebonden budget" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kinderopvangtoeslag" })).toBeVisible();
  await page.locator("[data-allowance-result]").first().locator("summary").click();
  await expect(page.getByText("Geschatte toeslag").first()).toBeVisible();
  await expect(page.getByText("eligible-estimate")).toHaveCount(0);
  await expect(page.getByText("Per maand").first()).toBeVisible();
  await expect(page.getByText("Betrouwbaarheid:")).toHaveCount(0);

  await page.getByText("Gebruikte bronnen").click();
  const officialLinks = page.locator("#tool-result-summary a[href^='https://www.belastingdienst.nl/']");
  await expect(officialLinks.first()).toBeVisible();
  expect(await officialLinks.count()).toBeGreaterThanOrEqual(1);

  await page.getByRole("textbox", { name: "Leeftijd", exact: true }).fill("35");
  await expect(
    page.getByText("Je hebt de invoer gewijzigd na de laatste scan."),
  ).toBeVisible();

  await page.getByLabel("Woonsituatie", { exact: true }).selectOption("owner");
  await expect(page.getByLabel("Kale huur per maand")).toHaveCount(0);
  await expect(page.getByText("Niet gevraagd in deze route")).toHaveCount(0);
  await page.getByLabel("Heb je kinderen?", { exact: true }).selectOption("no");
  await expect(page.getByLabel("Opvanguren per maand")).toHaveCount(0);

  await page.getByRole("button", { name: "Wis invoer" }).click();
  await expect(page.getByText("Nog geen scan uitgevoerd")).toBeVisible();
});

test("toeslagenscan toont geen bedragen zonder toetsingsinkomen", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto(allowanceScanRoute, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page.getByLabel("Geschat toetsingsinkomen").fill("");
  await page.getByRole("button", { name: "Bekijk mijn toeslagenindicatie" }).click();

  await expect(
    page.getByText("Meegeteld: geen concreet berekende toeslagen."),
  ).toBeVisible();
  await expect(
    page.locator("#tool-result-summary").getByText("Niet berekend"),
  ).toHaveCount(2);
  await expect(
    page.locator("#tool-result-summary").getByText(/€\s*490/),
  ).toHaveCount(0);
});

test("aanvullende beurs vraagt bij bijzondere oudersituaties geen regulier inkomen", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto("/apps/duo-aanvullende-beurs", {
    waitUntil: "networkidle",
  });
  await page
    .getByLabel("Bijzondere oudersituatie?")
    .selectOption("parent-deceased");

  await expect(page.getByLabel("Hoeveel ouders tellen mee?")).toHaveCount(0);
  await expect(page.getByLabel("Ouderinkomen 2024 ouder 1")).toHaveCount(0);
  await expect(
    page.getByText("Een overleden ouder telt niet altijd meer mee"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Bereken", exact: true }).click();
  await expect(page.getByText("Bijzondere DUO-situatie")).toBeVisible();
  await expect(page.getByText("Niet berekend").first()).toBeVisible();
});

test("hypotheek-impact toont woningdoel alleen na een expliciete keuze", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto("/apps/hypotheek-impact-studieschuld", {
    waitUntil: "networkidle",
  });

  const choice = page.getByRole("checkbox", {
    name: /Vergelijk ook met mijn woningdoel/,
  });
  await expect(choice).not.toBeChecked();
  await expect(page.getByLabel("Gewenste woningprijs")).toHaveCount(0);

  await choice.check();
  await expect(page.getByLabel("Gewenste woningprijs")).toBeVisible();
  await page.getByLabel("Gewenste woningprijs").fill("375000");
  await choice.uncheck();
  await expect(page.getByLabel("Gewenste woningprijs")).toHaveCount(0);

  await choice.check();
  await expect(page.getByLabel("Gewenste woningprijs")).toHaveValue("");
});

test("toeslagenscan kernregressies voor partner, vermogen, special-case en inferred bevestiging", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto(allowanceScanRoute, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();

  await page.getByLabel("Heb je een toeslagpartner?", { exact: true }).selectOption("yes");
  await expect(page.getByLabel("Gezamenlijk toetsingsinkomen")).toBeVisible();
  await page.getByLabel("Gezamenlijk toetsingsinkomen").fill("42000");
  await page.getByLabel("Gezamenlijk vermogen op 1 januari").fill("20000");
  await page.getByRole("button", { name: "Bekijk mijn toeslagenindicatie" }).click();
  await page.locator("[data-allowance-result]").first().locator("summary").click();
  await expect(page.getByText("Geschatte toeslag").first()).toBeVisible();

  await page.getByLabel("Gezamenlijk vermogen op 1 januari").fill("999999");
  await page.getByRole("button", { name: "Bekijk mijn toeslagenindicatie" }).click();
  await page.locator("[data-allowance-result]").first().locator("summary").click();
  await expect(page.getByText("Waarschijnlijk geen recht").first()).toBeVisible();

  await page.getByText("Bijzondere situatie toevoegen").click();
  await page.getByLabel("Complexe of uitzonderlijke situatie?", { exact: true }).selectOption("yes");
  await page.getByRole("button", { name: "Bekijk mijn toeslagenindicatie" }).click();
  await page.locator("[data-allowance-result]").first().locator("summary").click();
  await expect(page.getByText(/officiële controle/i).first()).toBeVisible();

  await page.getByLabel("Gezamenlijk vermogen op 1 januari").fill("20000");
  await page.getByLabel("Leeftijden kinderen").fill("5");
  await page.getByLabel("Heb je kinderen?", { exact: true }).selectOption("unknown");
  await expect(page.getByText("Afgeleid uit eerdere antwoorden")).toBeVisible();
  await page.getByRole("button", { name: "Bekijk mijn toeslagenindicatie" }).click();
  for (const summary of await page.locator("[data-allowance-result] summary").all()) {
    await summary.click();
  }
  await expect(
    page.locator("[data-allowance-result][open]").getByText("Nog te bevestigen").first(),
  ).toBeVisible();
});

test("verborgen, uitgeschakelde en v2-routes blijven buiten publieke routes", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop routecontrole");

  const hiddenResponse = await page.goto("/apps/volgende-euro", { waitUntil: "networkidle" });
  expect(hiddenResponse?.status()).toBe(404);
  const disabledResponse = await page.goto("/apps/familiehulp-eerste-woning", {
    waitUntil: "networkidle",
  });
  expect(disabledResponse?.status()).toBe(404);
  const response404 = await page.goto("/apps/bestaat-niet", {
    waitUntil: "networkidle",
  });
  expect(response404?.status()).toBe(404);

  const v2Response = await page.goto("/v2/apps/toeslagen-scan", {
    waitUntil: "networkidle",
  });
  expect(v2Response?.status()).toBe(404);
  expect(page.url()).toContain("/v2/apps/toeslagen-scan");
});

test("sitemap publiceert geen v2 routes", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  if (response.status() === 404) {
    expect(response.status()).toBe(404);
    return;
  }

  expect(response.status()).toBe(200);
  const sitemap = await response.text();
  expect(sitemap).not.toContain("/v2");
});

test("mobiele toeslagenscan houdt 390px zonder horizontale overflow en focusbasis", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobiele controle");

  await page.goto(allowanceScanRoute, { waitUntil: "networkidle" });
  await expect(page.getByRole("progressbar")).toHaveCount(0);
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
  await page.getByRole("button", { name: "Bereken", exact: true }).first().click();

  await expect(page.getByRole("heading", { name: "Ik studeer al: impact nieuw leenbedrag per maand" })).toBeVisible();
  await page.getByText("Bekijk de volledige berekening").click();
  await expect(page.getByText("Schuldenvrij rond")).toBeVisible();
  await expect(page.getByText("Totaal betalen inclusief rente")).toBeVisible();
});

test("alle tien tools doorlopen invoer, uitkomst, details en vervolgactie", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop productiesmoke");

  const scenarios: ReadonlyArray<{
    route: string;
    calculate?: string;
    pdf: boolean;
  }> = [
    {
      route: "/apps/artifact-hypotheek-wonen-maximale-hypotheek",
      calculate: "Bereken",
      pdf: true,
    },
    { route: "/apps/duo-aanvullende-beurs", calculate: "Bereken", pdf: false },
    { route: "/apps/duo-extra-aflossen", pdf: true },
    { route: "/apps/duo-leenbedrag-impact", calculate: "Bereken", pdf: true },
    { route: "/apps/duo-maandbedrag", pdf: true },
    { route: "/apps/duo-schuld-bij-starten-lenen", calculate: "Bereken", pdf: true },
    {
      route: "/apps/duo-stoppen-kosten-prestatiebeurs",
      calculate: "Bereken",
      pdf: true,
    },
    { route: "/apps/hypotheek-impact-studieschuld", calculate: "Bereken", pdf: true },
    { route: "/apps/schulden-volgorde", calculate: "Bereken volgorde", pdf: false },
    {
      route: "/apps/toeslagen-scan",
      calculate: "Bekijk mijn toeslagenindicatie",
      pdf: false,
    },
  ];

  for (const scenario of scenarios) {
    const response = await page.goto(scenario.route, { waitUntil: "networkidle" });
    expect(response?.status(), scenario.route).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    const clearButton = page.getByRole("button", { name: "Wis invoer" }).first();
    if (await clearButton.isVisible().catch(() => false)) {
      await clearButton.click();
      await expect(
        page.getByRole("complementary", { name: "Volgende stappen" }),
      ).toHaveCount(0);
    }

    await page.getByRole("button", { name: "Voorbeeld invullen" }).first().click();
    if (scenario.calculate) {
      await page
        .getByRole("button", { name: scenario.calculate, exact: true })
        .first()
        .click();
    }

    await expect(page.locator("#tool-result-summary")).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Volgende stappen" })).toBeVisible();

    const resultDetails = page.locator("section.order-2 details").first();
    await expect(resultDetails, `${scenario.route} heeft verdiepende details`).toBeVisible();
    await resultDetails.locator("summary").click();
    await expect(resultDetails).toHaveAttribute("open", "");

    const pdfButton = page.getByRole("button", { name: "Download overzicht" });
    if (scenario.pdf) {
      await expect(pdfButton).toBeVisible();
    } else {
      await expect(pdfButton).toHaveCount(0);
    }
  }
});
