import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

type AppManifest = {
  slug: string;
  enabled?: boolean;
  visibility?: "public" | "hidden";
};

const allowanceScanRoute = "/apps/toeslagen-scan";

function getAppManifests() {
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

      return [manifest];
    });
}

function getPublicToolRoutes() {
  return getAppManifests()
    .filter(
      (manifest) =>
        manifest.enabled !== false &&
        (manifest.visibility ?? "public") === "public",
    )
    .map((manifest) => `/apps/${manifest.slug}`)
    .sort();
}

function getNonPublicToolRoutes() {
  return new Set(
    getAppManifests()
      .filter(
        (manifest) =>
          manifest.enabled === false || manifest.visibility === "hidden",
      )
      .map((manifest) => `/apps/${manifest.slug}`),
  );
}

const routes = [
  "/",
  "/apps",
  "/profiel",
  "/kennisbank",
  "/variabelen",
  ...getPublicToolRoutes(),
];

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
  await expect(
    page.getByLabel("Terugbetalingsregel", { exact: true }),
  ).toBeVisible();
});

test("publieke links verwijzen alleen naar bestaande publieke routes", async ({
  page,
  request,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Een volledige linkcrawl volstaat");

  const nonPublicToolRoutes = getNonPublicToolRoutes();
  const links = new Map<string, string>();

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status(), route).toBe(200);

    const visibleLinks = await page.locator("a[href]").evaluateAll((anchors) =>
      anchors
        .filter((anchor) => {
          const element = anchor as HTMLElement;
          const style = window.getComputedStyle(element);
          return Boolean(element.getClientRects().length) && style.visibility !== "hidden";
        })
        .map((anchor) => anchor.getAttribute("href") ?? "")
        .filter(Boolean),
    );

    for (const href of visibleLinks) {
      if (href.startsWith("/") && !links.has(href)) {
        links.set(href, route);
      }
    }
  }

  for (const [href, sourceRoute] of links) {
    const pathname = href.split(/[?#]/, 1)[0] || "/";
    expect(
      nonPublicToolRoutes.has(pathname),
      `${sourceRoute} verwijst publiek naar ${pathname}`,
    ).toBe(false);

    const response = await request.get(href);
    expect(
      response.status(),
      `${sourceRoute} verwijst naar niet-bestaande route ${href}`,
    ).toBeLessThan(400);
  }

  expect(links.has("/apps/volgende-euro")).toBe(false);
});

test("publieke oppervlakken blijven binnen dezelfde horizontale randen", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Eén volledige resizematrix volstaat");

  const sizes = [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1180, height: 820 },
    { width: 1440, height: 900 },
  ] as const;

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status(), route).toBe(200);

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

      const audit = await page.evaluate(() => {
        const visibleInteractiveElements = [
          ...document.querySelectorAll("main input, main select, main textarea, main button, main a[href]"),
        ].filter((element) => {
          const htmlElement = element as HTMLElement;
          const style = window.getComputedStyle(htmlElement);
          return Boolean(htmlElement.getClientRects().length) && style.visibility !== "hidden";
        });
        const outsideViewport = visibleInteractiveElements
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left < -1 || rect.right > window.innerWidth + 1;
          })
          .map((element) =>
            element.getAttribute("aria-label") ||
            element.getAttribute("id") ||
            element.textContent?.trim().slice(0, 80) ||
            element.tagName,
          );

        return {
          htmlWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          outsideViewport,
        };
      });

      const label = `${route} bij ${size.width}x${size.height}`;
      expect(audit.htmlWidth, `${label}: html-overflow`).toBeLessThanOrEqual(audit.clientWidth + 1);
      expect(audit.bodyWidth, `${label}: body-overflow`).toBeLessThanOrEqual(audit.clientWidth + 1);
      expect(audit.outsideViewport, `${label}: interactie buiten viewport`).toEqual([]);
    }
  }
});

test("gekoppelde velden en kaarten delen horizontale rijen", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop geometriecontrole");

  async function expectAlignedFieldRows(containerSelector: string, label: string) {
    const rows = await page.locator(containerSelector).evaluateAll((containers) =>
      containers.flatMap((container) => {
        const groups = new Map<number, Array<{ label: string; controlTop: number }>>();

        for (const child of [...container.children]) {
          const control = child.querySelector("input, select, textarea") as HTMLElement | null;
          if (!control || !control.getClientRects().length) continue;
          const visualControl =
            (control.closest(".field-shell") as HTMLElement | null) ?? control;
          const childTop = Math.round((child as HTMLElement).getBoundingClientRect().top);
          const fieldLabel = child.querySelector("label")?.textContent?.trim() || control.id;
          const row = groups.get(childTop) ?? [];
          row.push({
            label: fieldLabel,
            controlTop: Math.round(visualControl.getBoundingClientRect().top),
          });
          groups.set(childTop, row);
        }

        return [...groups.values()]
          .filter((row) => row.length > 1)
          .map((row) => ({
            labels: row.map((field) => field.label),
            difference:
              Math.max(...row.map((field) => field.controlTop)) -
              Math.min(...row.map((field) => field.controlTop)),
          }));
      }),
    );

    for (const row of rows) {
      expect(row.difference, `${label}: ${row.labels.join(" / ")}`).toBeLessThanOrEqual(1);
    }
  }

  for (const width of [768, 1024, 1180, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/profiel", { waitUntil: "networkidle" });
    for (const step of ["Inkomen", "Studieschuld", "Wonen"]) {
      await page.getByRole("button", { name: step, exact: true }).first().click();
      await expectAlignedFieldRows(
        "section.surface-panel:has(> h3) > div.mt-5",
        `Profiel ${step} bij ${width}px`,
      );
    }
  }

  await page.goto("/apps/duo-aanvullende-beurs", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  const deductions = page.locator("details").filter({ hasText: "Aftrekposten en broers of zussen" });
  await deductions.locator("summary").click();
  for (const width of [768, 1024, 1180, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expectAlignedFieldRows(
      ".additional-grant-responsive-grid",
      `Aanvullende beurs bij ${width}px`,
    );
  }

  for (const width of [768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/apps", { waitUntil: "networkidle" });
    const cardRows = await page.locator("#apps a.surface-panel").evaluateAll((cards) => {
      const groups = new Map<number, HTMLElement[]>();
      for (const card of cards as HTMLElement[]) {
        const top = Math.round(card.getBoundingClientRect().top);
        const row = groups.get(top) ?? [];
        row.push(card);
        groups.set(top, row);
      }

      return [...groups.values()]
        .filter((row) => row.length > 1)
        .map((row) => {
          const descriptionTops = row.map((card) =>
            Math.round(card.querySelector("p")!.getBoundingClientRect().top),
          );
          const actionTops = row.map((card) =>
            Math.round(card.querySelector("div.mt-auto")!.getBoundingClientRect().top),
          );
          return {
            titles: row.map((card) => card.querySelector("h3")?.textContent?.trim() || "kaart"),
            descriptionDifference: Math.max(...descriptionTops) - Math.min(...descriptionTops),
            actionDifference: Math.max(...actionTops) - Math.min(...actionTops),
          };
        });
    });

    for (const row of cardRows) {
      const label = `Toolkaarten bij ${width}px: ${row.titles.join(" / ")}`;
      expect(row.descriptionDifference, label).toBeLessThanOrEqual(1);
      expect(row.actionDifference, label).toBeLessThanOrEqual(1);
    }
  }

  await page.goto("/apps/duo-schuld-bij-starten-lenen", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page.getByRole("button", { name: "Bereken", exact: true }).click();
  for (const width of [768, 1024, 1180, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const resultRows = await page.locator(".grid").evaluateAll((grids) =>
      grids.flatMap((grid) => {
        const cards = [...grid.children].filter((child) =>
          child.matches("article.result-panel"),
        ) as HTMLElement[];
        if (cards.length < 2) return [];
        const groups = new Map<number, HTMLElement[]>();
        for (const card of cards) {
          const top = Math.round(card.getBoundingClientRect().top);
          const row = groups.get(top) ?? [];
          row.push(card);
          groups.set(top, row);
        }
        return [...groups.values()]
          .filter((row) => row.length > 1)
          .map((row) => {
            const valueTops = row.map((card) =>
              Math.round(card.querySelectorAll(":scope > p")[1].getBoundingClientRect().top),
            );
            return Math.max(...valueTops) - Math.min(...valueTops);
          });
      }),
    );
    expect(resultRows, `Resultaatkaarten bij ${width}px`).toEqual(
      resultRows.map(() => 0),
    );
  }
});

test("aanvullende beurs houdt oudervelden solide tijdens resizen", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Eén volledige resizematrix volstaat");

  const sizes = [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 640, height: 720 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1180, height: 820 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ] as const;

  async function expectSolidFormLayout(label: string) {
    const audit = await page.evaluate(() => {
      const scope = document.querySelector(".additional-grant-form");
      if (!scope) throw new Error("Aanvullende-beursformulier ontbreekt");

      const controls = [...scope.querySelectorAll("input, select, textarea")]
        .filter((control) => Boolean((control as HTMLElement).getClientRects().length))
        .map((control) => {
          const rect = control.getBoundingClientRect();
          return {
            id: control.id,
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          };
        });
      const overlaps: string[] = [];

      for (let leftIndex = 0; leftIndex < controls.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < controls.length; rightIndex += 1) {
          const left = controls[leftIndex];
          const right = controls[rightIndex];
          const horizontalOverlap = Math.min(left.right, right.right) - Math.max(left.left, right.left);
          const verticalOverlap = Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top);
          if (horizontalOverlap > 1 && verticalOverlap > 1) {
            overlaps.push(`${left.id} / ${right.id}`);
          }
        }
      }

      const boundedElements = [
        ...scope.querySelectorAll("label, legend, input, select, textarea"),
      ].filter((element) => Boolean((element as HTMLElement).getClientRects().length));
      const outsideViewport = boundedElements
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.left < -1 || rect.right > window.innerWidth + 1;
        })
        .map((element) =>
          element.getAttribute("for") || element.getAttribute("id") || element.textContent?.trim() || element.tagName,
        );

      return {
        htmlWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        overlaps,
        outsideViewport,
      };
    });

    expect(audit.htmlWidth, `${label}: html overflow`).toBeLessThanOrEqual(audit.clientWidth + 1);
    expect(audit.bodyWidth, `${label}: body overflow`).toBeLessThanOrEqual(audit.clientWidth + 1);
    expect(audit.overlaps, `${label}: overlappende velden`).toEqual([]);
    expect(audit.outsideViewport, `${label}: onderdelen buiten viewport`).toEqual([]);
  }

  await page.goto("/apps/duo-aanvullende-beurs", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();

  const deductions = page
    .locator("details")
    .filter({ hasText: "Aftrekposten en broers of zussen" });
  await deductions.locator("summary").click();
  await expect(deductions).toHaveAttribute("open", "");
  await deductions.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(deductions).not.toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(deductions).toHaveAttribute("open", "");
  await expect(page.locator('[data-parent-income-group="1"]')).toBeVisible();
  await expect(page.locator('[data-parent-income-group="2"]')).toBeVisible();
  await expect(page.locator('[data-parent-deductions-group="1"]')).toBeVisible();
  await expect(page.locator('[data-parent-deductions-group="2"]')).toBeVisible();

  for (const size of [...sizes, ...[...sizes].reverse()]) {
    await page.setViewportSize(size);
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    await expectSolidFormLayout(`${size.width}x${size.height}, twee ouders`);
  }

  await page.getByLabel("Hoeveel ouders tellen mee?").selectOption("single-parent");
  await expect(page.locator('[data-parent-income-group="2"]')).toHaveCount(0);
  await expect(page.locator('[data-parent-deductions-group="2"]')).toHaveCount(0);
  for (const size of sizes) {
    await page.setViewportSize(size);
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    await expectSolidFormLayout(`${size.width}x${size.height}, één ouder`);
  }

  await page.setViewportSize({ width: 320, height: 568 });
  await page
    .locator('[data-parent-deductions-group="1"]')
    .getByLabel("Andere kwalificerende kinderen")
    .fill("12345678901234567890,5");
  await expect(
    page.locator('[data-parent-deductions-group="1"]').getByText("Gebruik een heel aantal van 0 of hoger."),
  ).toBeVisible();
  await expectSolidFormLayout("320x568 met lange ongeldige invoer en foutmelding");
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

test("maximale hypotheek legt de uitkomst uit inclusief studieschuld", async ({
  page,
}) => {
  await page.goto("/apps/artifact-hypotheek-wonen-maximale-hypotheek", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();

  const desktopCalculate = page.getByRole("button", {
    name: "Bereken",
    exact: true,
  });
  if (await desktopCalculate.isVisible()) {
    await desktopCalculate.click();
  } else {
    const nextField = page.getByRole("button", { name: "Volgende veld" });
    while (await nextField.isVisible()) {
      await nextField.click();
    }
    await page.getByRole("button", { name: "Bekijk uitkomst" }).click();
  }

  const breakdown = page.getByTestId("mortgage-calculation-breakdown");
  await expect(
    breakdown.getByText("Zo is dit bedrag opgebouwd"),
  ).toBeVisible();

  const disclosure = breakdown.locator("details");
  await expect(disclosure).not.toHaveAttribute("open", "");
  await breakdown
    .getByText("Zo is dit bedrag opgebouwd")
    .click();
  await expect(disclosure).toHaveAttribute("open", "");

  await expect(
    breakdown.getByText("Studieschuld en andere verplichtingen verwerken"),
  ).toBeVisible();
  await expect(
    breakdown.getByText(
      "Minder hypotheekruimte op basis van inkomen door studieschuld",
    ),
  ).toBeVisible();
  await expect(
    breakdown.getByText("Eindbedrag na alle grenzen"),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
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
    await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
    if (
      route === "/apps/duo-schuld-bij-starten-lenen" ||
      route === "/apps/duo-stoppen-kosten-prestatiebeurs" ||
      route === "/apps/duo-leenbedrag-impact"
    ) {
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
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();

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
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
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
  await expect(page.getByText("Totaal terug te betalen inclusief rente")).toBeVisible();
});

test("verwachte eindschuld toont direct het totaal bij regulier aflossen", async ({ page }) => {
  await page.goto("/apps/duo-schuld-bij-starten-lenen", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page.getByRole("button", { name: "Bereken", exact: true }).click();

  const summary = page.locator("#tool-result-summary");
  await expect(summary.getByText("Verwachte eindschuld", { exact: true })).toBeVisible();
  await expect(
    summary.getByText("Totaal terug te betalen inclusief rente", { exact: true }),
  ).toBeVisible();
  await expect(
    summary.getByText(/Bij regulier aflossen binnen 35 jaar, zonder extra aflossingen of aflosvrije maanden\./),
  ).toBeVisible();

  const width = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(width.body).toBeLessThanOrEqual(width.viewport + 1);
});

test("DUO-maandbedragen gebruiken centrale maxima met toelichting rechts", async ({ page }) => {
  const isMobile = (page.viewportSize()?.width ?? 0) < 768;

  async function expectLimitedField(inputId: string, maximum: string, hint: RegExp) {
    const input = page.locator(`#${inputId}`);
    await expect(input).toHaveAttribute("max", maximum);

    const label = page.locator(`label[for="${inputId}"]`);
    const heading = label.locator(":scope > span").first();
    const rightHint = heading.locator(":scope > span").last();
    await expect(rightHint).toHaveText(hint);
    const alignment = await Promise.all([
      heading.evaluate((element) => element.getBoundingClientRect().right),
      rightHint.evaluate((element) => element.getBoundingClientRect().right),
    ]);
    expect(
      Math.abs(alignment[0] - alignment[1]),
      `${inputId}: maximumtoelichting staat niet rechts`,
    ).toBeLessThanOrEqual(1);

    const columns = await Promise.all([
      heading.locator(":scope > span").first().boundingBox(),
      rightHint.boundingBox(),
    ]);
    expect(columns[0]).not.toBeNull();
    expect(columns[1]).not.toBeNull();
    expect(
      columns[0]!.x + columns[0]!.width,
      `${inputId}: veldlabel overlapt de maximumtoelichting`,
    ).toBeLessThanOrEqual(columns[1]!.x);
  }

  await page.goto("/apps/duo-schuld-bij-starten-lenen", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  if (isMobile) {
    await page.getByRole("button", { name: "Volgende veld" }).click();
    await page.getByRole("button", { name: "Volgende veld" }).click();
  }
  await expectLimitedField(
    "monthlyLoan",
    "1213.95",
    /Max\. €\s*1\.213,95 per maand/,
  );

  const advanced = page.locator("details").filter({
    hasText: "Andere studiebedragen toevoegen",
  });
  await advanced.locator("summary").click();
  await expectLimitedField(
    "monthlyCollegegeldkrediet",
    "1083.75",
    /Max\. €\s*1\.083,75; regulier €\s*216,75/,
  );
  await expectLimitedField(
    "monthlyBasisbeurs",
    "324.52",
    /Max\. €\s*324,52 uitwonend/,
  );
  await expectLimitedField(
    "monthlyAanvullendeBeurs",
    "491.08",
    /Max\. €\s*491,08/,
  );

  if (isMobile) {
    await page.getByRole("button", { name: "Vorige" }).click();
    await page.getByRole("button", { name: "Vorige" }).click();
  }
  await page.locator("#calculationMonth").fill("2026-09");
  if (isMobile) {
    await page.getByRole("button", { name: "Volgende veld" }).click();
    await page.getByRole("button", { name: "Volgende veld" }).click();
  }
  await expectLimitedField(
    "monthlyCollegegeldkrediet",
    "1122.5",
    /Max\. €\s*1\.122,50; regulier €\s*224,50/,
  );

  await page.locator("#monthlyLoan").fill("1213.96");
  await expect(
    page.getByText(/Gebruik maximaal €\s*1\.213,95 per maand\./),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Bereken", exact: true })).toBeDisabled();

  await page.goto("/apps/duo-leenbedrag-impact", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await expect(page.locator("#monthlyLoanSlider")).toHaveAttribute("max", "1213.95");
  await expect(page.getByText(/Max\. €\s*1\.213,95 per maand/)).toBeVisible();

  const width = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(width.body).toBeLessThanOrEqual(width.viewport + 1);
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
    await expect(
      page.getByText("Voorbeeldgegevens ingevuld", { exact: true }),
    ).toBeVisible();
    if (scenario.calculate) {
      await page
        .getByRole("button", { name: scenario.calculate, exact: true })
        .first()
        .click();
    }

    await expect(page.locator("#tool-result-summary")).toBeVisible();
    await expect(
      page.getByText("Voorbeeldberekening", { exact: true }),
    ).toBeVisible();
    const nextSteps = page.getByRole("complementary", { name: "Volgende stappen" });
    await expect(nextSteps).toBeVisible();
    await expect(nextSteps.locator("a").first()).toHaveCSS(
      "color",
      "rgb(255, 250, 240)",
    );

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
