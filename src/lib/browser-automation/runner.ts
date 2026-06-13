import { chromium, type Locator, type Page } from "@playwright/test";

import { findCurrencyValues, formatEuro, normalizeComparisonText } from "@/lib/browser-automation/heuristics";
import { mortgageProviderSpecs } from "@/lib/browser-automation/providers";
import { buildMortgageComparisonScenarios } from "@/lib/browser-automation/scenarios";
import type {
  MortgageAutomationProviderId,
  MortgageAutomationProviderRun,
  MortgageAutomationProviderRunStatus,
  MortgageAutomationProviderSpec,
  MortgageAutomationScenario,
} from "@/lib/browser-automation/types";

export type MortgageBrowserComparisonOptions = {
  limit?: number;
  providers?: MortgageAutomationProviderId[];
  headless?: boolean;
  navigationTimeoutMs?: number;
  actionTimeoutMs?: number;
  scenarioTimeoutMs?: number;
  onProgress?: (message: string) => void;
};

export type MortgageBrowserComparisonReport = {
  generatedAt: string;
  scenarios: MortgageAutomationScenario[];
  runs: MortgageAutomationProviderRun[];
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function inferFieldValue(value: unknown) {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(".", ",");
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function inferFieldKind(
  fallback: NonNullable<MortgageAutomationProviderSpec["fieldHints"][number]["kind"]>,
) {
  return fallback;
}

async function dismissCommonConsentDialogs(page: Page) {
  const buttonPatterns = [
    /accep/i,
    /akkoord/i,
    /alles accepteren/i,
    /agree/i,
    /accept/i,
    /ok/i,
  ];

  for (const pattern of buttonPatterns) {
    const button = page.getByRole("button", { name: pattern }).first();
    if ((await button.count()) === 0) {
      continue;
    }

    if (await button.isVisible().catch(() => false)) {
      await button.click({ timeout: 2_000 }).catch(() => undefined);
      break;
    }
  }
}

async function expandSectionForKeywords(page: Page, keywords: string[]) {
  const regex = new RegExp(keywords.map(escapeRegExp).join("|"), "i");
  const toggles = [
    page.getByRole("button", { name: regex }).first(),
    page.locator("summary").filter({ hasText: regex }).first(),
  ];

  for (const toggle of toggles) {
    if ((await toggle.count()) === 0) {
      continue;
    }

    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click({ timeout: 3_000 }).catch(() => undefined);
      await page.waitForTimeout(400);
      return true;
    }
  }

  return false;
}

async function findControlLocator(page: Page, keywords: string[]) {
  const regex = new RegExp(keywords.map(escapeRegExp).join("|"), "i");
  const strategies = [
    page.getByPlaceholder(regex).first(),
    page.getByRole("textbox", { name: regex }).first(),
    page.getByRole("spinbutton", { name: regex }).first(),
    page.getByRole("checkbox", { name: regex }).first(),
    page.getByRole("combobox", { name: regex }).first(),
  ];

  for (const locator of strategies) {
    if ((await locator.count()) > 0 && (await locator.isVisible().catch(() => false))) {
      return locator;
    }
  }

  const controls = page.locator("input, textarea, select, [role='checkbox'], [role='combobox']");
  const controlCount = await controls.count();

  for (let index = 0; index < controlCount; index += 1) {
    const locator = controls.nth(index);
    if (!(await locator.isVisible().catch(() => false))) {
      continue;
    }

    const textFragments = await Promise.all([
      locator.getAttribute("aria-label"),
      locator.getAttribute("placeholder"),
      locator.getAttribute("name"),
      locator.getAttribute("id"),
    ]);

    const haystack = textFragments.filter(Boolean).join(" ").toLowerCase();
    if (keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))) {
      return locator;
    }
  }

  if (await expandSectionForKeywords(page, keywords)) {
    for (const locator of strategies) {
      if ((await locator.count()) > 0 && (await locator.isVisible().catch(() => false))) {
        return locator;
      }
    }

    const expandedControls = page.locator("input, textarea, select, [role='checkbox'], [role='combobox']");
    const expandedCount = await expandedControls.count();
    for (let index = 0; index < expandedCount; index += 1) {
      const locator = expandedControls.nth(index);
      if (!(await locator.isVisible().catch(() => false))) {
        continue;
      }

      const textFragments = await Promise.all([
        locator.getAttribute("aria-label"),
        locator.getAttribute("placeholder"),
        locator.getAttribute("name"),
        locator.getAttribute("id"),
      ]);

      const haystack = textFragments.filter(Boolean).join(" ").toLowerCase();
      if (keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))) {
        return locator;
      }
    }
  }

  return null;
}

async function fillControl(locator: Locator, value: unknown, kind: "text" | "checkbox" | "select") {
  if (kind === "checkbox") {
    if (value === true) {
      await locator.check({ timeout: 5_000 });
    } else {
      await locator.uncheck({ timeout: 5_000 }).catch(() => undefined);
    }
    return;
  }

  if (kind === "select") {
    const label = inferFieldValue(value);
    await locator.selectOption({ label }).catch(async () => {
      await locator.selectOption({ value: label }).catch(() => undefined);
    });
    return;
  }

  await locator.fill(inferFieldValue(value), { timeout: 5_000 });
}

async function collectVisibleText(page: Page, selectors: string[]) {
  const chunks: string[] = [];

  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if ((await locator.count()) === 0) {
      continue;
    }

    const visible = await locator.isVisible().catch(() => false);
    if (!visible) {
      continue;
    }

    const text = await locator.innerText({ timeout: 5_000 }).catch(() => "");
    if (text.trim()) {
      chunks.push(text.trim());
    }
  }

  if (chunks.length === 0) {
    const bodyText = await page.locator("body").innerText({ timeout: 10_000 }).catch(() => "");
    if (bodyText.trim()) {
      chunks.push(bodyText.trim());
    }
  }

  return chunks.join("\n\n");
}

function determineStatus(options: {
  extractedAmounts: number[];
  foundFields: number;
  filledFields: number;
  notes: string[];
}) {
  if (options.notes.some((note) => /captcha|bot|robot|verifi|blocked|geblokkeerd/i.test(note))) {
    return "manual-check" as MortgageAutomationProviderRunStatus;
  }

  if (options.filledFields === 0) {
    return "manual-check" as MortgageAutomationProviderRunStatus;
  }

  if (options.extractedAmounts.length === 0) {
    return options.foundFields > 0 ? ("partial" as MortgageAutomationProviderRunStatus) : ("manual-check" as MortgageAutomationProviderRunStatus);
  }

  return options.filledFields < options.foundFields ? ("partial" as MortgageAutomationProviderRunStatus) : ("success" as MortgageAutomationProviderRunStatus);
}

async function trySubmitForm(page: Page, provider: MortgageAutomationProviderSpec) {
  for (const label of provider.submitButtonLabels) {
    const button = page.getByRole("button", { name: new RegExp(escapeRegExp(label), "i") }).first();
    if ((await button.count()) === 0) {
      continue;
    }

    if (await button.isVisible().catch(() => false)) {
      await button.click({ timeout: 5_000 }).catch(() => undefined);
      return true;
    }
  }

  const genericSubmit = page.locator('button[type="submit"], input[type="submit"]').first();
  if ((await genericSubmit.count()) > 0 && (await genericSubmit.isVisible().catch(() => false))) {
    await genericSubmit.click({ timeout: 5_000 }).catch(() => undefined);
    return true;
  }

  return false;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutLabel: string) {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${timeoutLabel} exceeded ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

async function runScenarioAgainstProvider(
  page: Page,
  provider: MortgageAutomationProviderSpec,
  scenario: MortgageAutomationScenario,
  actionTimeoutMs: number,
  navigationTimeoutMs: number,
): Promise<MortgageAutomationProviderRun> {
  const notes: string[] = [provider.notes];
  const filledFieldKeys: string[] = [];
  const foundFieldKeys: string[] = [];

  const inputEntries = Object.entries(scenario.input) as Array<
    [keyof typeof scenario.input, (typeof scenario.input)[keyof typeof scenario.input]]
  >;

  for (const [key, rawValue] of inputEntries) {
    if (rawValue === undefined || rawValue === null) {
      continue;
    }

    const hint = provider.fieldHints.find((entry) => entry.key === key);
    if (!hint) {
      continue;
    }

    const locator = await findControlLocator(page, hint.keywords);
    if (!locator) {
      notes.push(`Geen zichtbaar veld gevonden voor ${String(key)}.`);
      continue;
    }

    foundFieldKeys.push(String(key));
    const kind = inferFieldKind(hint.kind ?? "text");

    try {
      await locator.scrollIntoViewIfNeeded({ timeout: actionTimeoutMs }).catch(() => undefined);
      await fillControl(locator, rawValue, kind);
      filledFieldKeys.push(String(key));
    } catch (error) {
      notes.push(`Kon ${String(key)} niet vullen: ${(error as Error).message}`);
    }
  }

  const submitted = await trySubmitForm(page, provider);
  if (!submitted) {
    notes.push("Geen submitknop gevonden.");
  }

  await page.waitForLoadState("domcontentloaded", { timeout: navigationTimeoutMs }).catch(() => undefined);
  await page.waitForTimeout(2_000);

  const capturedText = await collectVisibleText(page, provider.resultSelectors);
  const extractedAmounts = findCurrencyValues(capturedText);

  if (!submitted) {
    notes.push("Formulier is niet automatisch verzonden.");
  }

  if (capturedText && normalizeComparisonText(capturedText).includes("captcha")) {
    notes.push("Captcha of botbescherming aangetroffen.");
  }

  const status = determineStatus({
    extractedAmounts,
    foundFields: foundFieldKeys.length,
    filledFields: filledFieldKeys.length,
    notes,
  });

  return {
    providerId: provider.id,
    providerName: provider.name,
    scenarioId: scenario.id,
    scenarioLabel: scenario.label,
    status,
    url: provider.url,
    capturedText,
    extractedAmounts,
    notes,
  };
}

export async function runMortgageBrowserComparison(
  options: MortgageBrowserComparisonOptions = {},
): Promise<MortgageBrowserComparisonReport> {
  const scenarios = buildMortgageComparisonScenarios(options.limit ?? 100);
  const providers = mortgageProviderSpecs.filter((provider) =>
    options.providers ? options.providers.includes(provider.id) : true,
  );
  const browser = await chromium.launch({ headless: options.headless ?? true });
  const runs: MortgageAutomationProviderRun[] = [];
  const onProgress = options.onProgress ?? (() => undefined);

  try {
    for (const provider of providers) {
      onProgress(`provider ${provider.id}`);
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1600 },
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      });
      const page = await context.newPage();

      page.setDefaultTimeout(options.actionTimeoutMs ?? 7_500);
      page.setDefaultNavigationTimeout(options.navigationTimeoutMs ?? 20_000);

      for (const scenario of scenarios) {
        onProgress(`scenario ${scenario.id}`);
        await page.goto(provider.url, { waitUntil: "domcontentloaded" }).catch((error) => {
          runs.push({
            providerId: provider.id,
            providerName: provider.name,
            scenarioId: scenario.id,
            scenarioLabel: scenario.label,
            status: "failed",
            url: provider.url,
            capturedText: "",
            extractedAmounts: [],
            notes: [`Kon pagina niet openen: ${(error as Error).message}`],
          });
        });

        const pageRunsForScenario = runs.filter(
          (entry) => entry.providerId === provider.id && entry.scenarioId === scenario.id,
        );
        if (pageRunsForScenario.length > 0) {
          continue;
        }

        await dismissCommonConsentDialogs(page);
        try {
          const run = await withTimeout(
            runScenarioAgainstProvider(
              page,
              provider,
              scenario,
              options.actionTimeoutMs ?? 7_500,
              options.navigationTimeoutMs ?? 20_000,
            ),
            options.scenarioTimeoutMs ?? 45_000,
            `Scenario ${scenario.id} for ${provider.name}`,
          );
          runs.push(run);
        } catch (error) {
          runs.push({
            providerId: provider.id,
            providerName: provider.name,
            scenarioId: scenario.id,
            scenarioLabel: scenario.label,
            status: "failed",
            url: provider.url,
            capturedText: "",
            extractedAmounts: [],
            notes: [`Scenario run failed: ${(error as Error).message}`],
          });
        }
      }

      await context.close().catch(() => undefined);
    }
  } finally {
    await browser.close().catch(() => undefined);
  }

  return {
    generatedAt: new Date().toISOString(),
    scenarios,
    runs,
  };
}

export function renderMortgageBrowserComparisonMarkdown(report: MortgageBrowserComparisonReport) {
  const lines: string[] = [];
  lines.push("# Hypotheek browser-automation report");
  lines.push("");
  lines.push(`Generated at: ${report.generatedAt}`);
  lines.push(`Scenarios: ${report.scenarios.length}`);
  lines.push(`Runs: ${report.runs.length}`);
  lines.push("");
  lines.push("## Method");
  lines.push("");
  lines.push("- Uses Playwright Chromium in a normal browser session.");
  lines.push("- Matches fields by visible labels, placeholders, names, aria-labels and checkbox/select semantics.");
  lines.push("- Never bypasses login, CAPTCHA, or bot protection.");
  lines.push("- Falls back to `manual-check` when the site flow is not safely automatable.");
  lines.push("");

  const providerGroups = new Map<MortgageAutomationProviderId, MortgageAutomationProviderRun[]>();
  for (const run of report.runs) {
    const group = providerGroups.get(run.providerId) ?? [];
    group.push(run);
    providerGroups.set(run.providerId, group);
  }

  for (const provider of mortgageProviderSpecs) {
    const group = providerGroups.get(provider.id) ?? [];
    lines.push(`## ${provider.name}`);
    lines.push("");
    lines.push(`URL: ${provider.url}`);
    lines.push("");
    lines.push("| Scenario | Status | Extracted amounts | Notes |");
    lines.push("| --- | --- | --- | --- |");

    for (const run of group) {
      const amounts = run.extractedAmounts.map((amount) => formatEuro(amount)).join(", ") || "none";
      const notes = run.notes.join(" ").replace(/\|/g, "\\|");
      lines.push(`| ${run.scenarioId} | ${run.status} | ${amounts} | ${notes} |`);
    }

    lines.push("");
  }

  return lines.join("\n");
}
