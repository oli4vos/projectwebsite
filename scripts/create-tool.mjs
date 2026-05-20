#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const slug = process.argv[2]?.trim();

if (!slug) {
  console.error('Gebruik: npm run create:tool <slug>');
  process.exit(1);
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error(
    `Ongeldige slug "${slug}". Gebruik alleen kleine letters, cijfers en koppeltekens.`,
  );
  process.exit(1);
}

const root = process.cwd();
const toolDir = path.join(root, "apps", slug);

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

if (await exists(toolDir)) {
  console.error(`Map bestaat al: apps/${slug}`);
  process.exit(1);
}

await fs.mkdir(toolDir, { recursive: true });

const title = slug
  .split("-")
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");

const appJson = {
  slug,
  title: `${title} (concept)`,
  description: `Concepttool voor ${title.toLowerCase()}.`,
  type: "frontend",
  category: "Persoonlijke financiën",
  tags: ["concept"],
  status: "draft",
  visibility: "hidden",
  reasonHint: `Handig als je ${title.toLowerCase()} wilt verkennen.`,
  assumptionsUsed: ["investment"],
  calculationDomains: ["cashflow"],
  riskLevel: "medium",
  disclaimerType: "financialEducation",
  outputType: "singleResult",
  requiredProfileFields: [],
  version: "1.0.0",
  entry: "Calculator.tsx",
};

const logicTs = `export type ${title.replace(/[^a-zA-Z0-9]/g, "")}Input = {
  amount?: number;
};

export type ${title.replace(/[^a-zA-Z0-9]/g, "")}Result = {
  amount: number;
  doubledAmount: number;
  warnings: string[];
};

export function calculate${title.replace(/[^a-zA-Z0-9]/g, "")}(input: ${
  title.replace(/[^a-zA-Z0-9]/g, "")
}Input): ${title.replace(/[^a-zA-Z0-9]/g, "")}Result {
  const amount = Number.isFinite(input.amount) ? Math.max(input.amount ?? 0, 0) : 0;
  return {
    amount,
    doubledAmount: amount * 2,
    warnings: [
      "Concepttool: vervang deze voorbeeldlogica voordat je de tool publiek maakt.",
    ],
  };
}
`;

const logicTestTs = `import { describe, expect, it } from "vitest";
import { calculate${title.replace(/[^a-zA-Z0-9]/g, "")} } from "./logic";

describe("calculate${title.replace(/[^a-zA-Z0-9]/g, "")}", () => {
  it("handles empty input safely", () => {
    const result = calculate${title.replace(/[^a-zA-Z0-9]/g, "")}({});
    expect(result.amount).toBe(0);
    expect(result.doubledAmount).toBe(0);
  });

  it("clamps negative input", () => {
    const result = calculate${title.replace(/[^a-zA-Z0-9]/g, "")}({ amount: -10 });
    expect(result.amount).toBe(0);
  });
});
`;

const calculatorTsx = `"use client";

import { useMemo, useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { calculate${title.replace(/[^a-zA-Z0-9]/g, "")} } from "./logic";

type FormState = {
  amount: string;
};

const defaultValues: FormState = {
  amount: "",
};

export default function Calculator() {
  const [values, setValues] = useState<FormState>(defaultValues);
  const [submitted, setSubmitted] = useState<FormState | null>(null);

  const result = useMemo(() => {
    if (!submitted) return null;
    const amount = Number.isFinite(Number(submitted.amount.replace(",", ".")))
      ? Number(submitted.amount.replace(",", "."))
      : undefined;
    return calculate${title.replace(/[^a-zA-Z0-9]/g, "")}({ amount });
  }, [submitted]);

  return (
    <CalculatorShell
      intro={
        <>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Concepttool</div>
          <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">${title}</h2>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Startpunt-template: vul in, klik op Bereken, en werk daarna de logica en copy uit.
          </p>
        </>
      }
      inputs={
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(values);
          }}
        >
          <label className="grid gap-2">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Voorbeeldbedrag</span>
            <input
              inputMode="decimal"
              value={values.amount}
              onChange={(event) => setValues({ amount: event.target.value })}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
          </label>
          <button
            type="submit"
            className="ring-focus hair inline-flex h-12 w-full items-center justify-center rounded-full border bg-[var(--deep)] px-4 text-[14px] text-white"
          >
            Bereken
          </button>
        </form>
      }
      result={
        <div className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          {!result ? (
            <p className="text-[14px] leading-[1.7] text-white/75">
              Vul in wat je weet en klik op Bereken.
            </p>
          ) : (
            <>
              <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">Samenvatting</div>
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                Invoer: €{result.amount.toLocaleString("nl-NL")} · Verdubbeld: €{result.doubledAmount.toLocaleString("nl-NL")}
              </p>
            </>
          )}
        </div>
      }
      details={
        <DisclosureSection title="Hoe rekenen we dit?" subtitle="Template voor nieuwe tools.">
          <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
            Deze template gebruikt opzettelijk simpele voorbeeldlogica.
          </p>
        </DisclosureSection>
      }
    />
  );
}
`;

await fs.writeFile(path.join(toolDir, "app.json"), `${JSON.stringify(appJson, null, 2)}\n`, "utf8");
await fs.writeFile(path.join(toolDir, "logic.ts"), logicTs, "utf8");
await fs.writeFile(path.join(toolDir, "logic.test.ts"), logicTestTs, "utf8");
await fs.writeFile(path.join(toolDir, "Calculator.tsx"), calculatorTsx, "utf8");

console.log(`Aangemaakt: apps/${slug}`);
console.log("Volgende stappen:");
console.log("1. Werk app.json metadata en copy uit.");
console.log("2. Vervang voorbeeldlogica in logic.ts.");
console.log("3. Breid tests uit in logic.test.ts.");
console.log("4. Draai npm run generate:apps en npm run check.");
