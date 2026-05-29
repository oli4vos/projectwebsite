#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CATALOG_PATH = process.argv[2] ?? "artifacts/toolkits/catalog.json";
const TOOLKITS_ROOT = process.argv[3] ?? "artifacts/toolkits/categories";
const OUTPUT_ROOT = process.argv[4] ?? "artifacts/staging-apps";

function toPascalCase(value) {
  return value
    .split(/[^a-zA-Z0-9]+/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

function normalize(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function detectProfile(categorySlug, title) {
  const text = normalize(`${categorySlug} ${title}`);

  if (text.includes("annuiteit") && (text.includes("geleend") || text.includes("hoogte lening"))) {
    return "annuity_principal";
  }
  if (text.includes("annuiteit") && text.includes("looptijd")) {
    return "annuity_term";
  }
  if (text.includes("maandbedrag voor aflossing lening")) {
    return "annuity_payment";
  }
  if (text.includes("annuiteit")) {
    return "annuity_payment";
  }
  if (text.includes("lineaire lening") || text.includes("lineaire hypotheek")) {
    return "linear_loan";
  }
  if (text.includes("contante waarde voor een reeks")) {
    return "present_value_annuity";
  }
  if (text.includes("contante waarde")) {
    return "present_value";
  }
  if (text.includes("toekomstige waarde") || text.includes("banksparen")) {
    return "future_value";
  }
  if (text.includes("samengestelde rente")) {
    return "compound_interest";
  }
  if (text.includes("enkelvoudige rente")) {
    return "simple_interest";
  }
  if (text.includes("effectieve rente") || text.includes("effectieve hypotheekrente")) {
    return "effective_rate";
  }
  if (text.includes("nominale rente")) {
    return "nominal_rate";
  }
  if (text.includes("gewogen gemiddelde rente")) {
    return "weighted_average_rate";
  }
  if (text.includes("bedrag/getal")) {
    return "value_from_percentage";
  }
  if (text.includes("percentage berekenen")) {
    return "percentage_of_total";
  }
  if (text.includes("indexering alimentatie")) {
    return "indexed_amount";
  }
  if (categorySlug === "geld-lenen-financiering" && text.includes("looptijd")) {
    return "annuity_term";
  }
  if (categorySlug === "geld-lenen-financiering" && text.includes("rente")) {
    return "simple_interest";
  }
  return "generic_contract";
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function buildAppJson({ slug, title, categoryTitle, sourceUrl, profile, sourceInvulblad }) {
  return {
    slug,
    title,
    description: `Staging-tool op basis van artifacts-contract: ${title}.`,
    type: "frontend",
    category: categoryTitle,
    tags: ["artifact-staging", "draft", profile],
    status: "draft",
    visibility: "hidden",
    reasonHint: "Deze tool staat in artifacts-staging en is nog niet live gekoppeld.",
    assumptionsUsed: ["financialEducation"],
    calculationDomains: ["cashflow"],
    riskLevel: "medium",
    disclaimerType: "financialEducation",
    outputType: "singleResult",
    requiredProfileFields: [],
    version: "1.0.0",
    entry: "Calculator.tsx",
    staging: {
      profile,
      sourceUrl,
      sourceInvulblad,
      generatedAt: new Date().toISOString(),
    },
  };
}

function buildLogicTs({ functionName, profile }) {
  return `import {\n  executeProfile,\n  type GenericCalculationInput,\n  type GenericCalculationResult,\n} from "../../_shared/runtime";\n\nexport type ToolInput = GenericCalculationInput;\nexport type ToolResult = GenericCalculationResult;\n\nexport const TOOL_PROFILE = "${profile}" as const;\n\nexport function ${functionName}(input: ToolInput): ToolResult {\n  return executeProfile(TOOL_PROFILE, input);\n}\n`;
}

function buildLogicTestTs({ functionName }) {
  return `import { describe, expect, it } from "vitest";\nimport { getProfileFixture } from "../../_shared/runtime";\nimport { ${functionName}, TOOL_PROFILE } from "./logic";\n\ndescribe("${functionName}", () => {\n  it("runs fixture for profile", () => {\n    const fixture = getProfileFixture(TOOL_PROFILE);\n    const result = ${functionName}(fixture.input);\n    expect(result.profile).toBe(TOOL_PROFILE);\n    expect(result.isValid).toBe(fixture.expectValid);\n  });\n\n  it("rejects empty input safely", () => {\n    const result = ${functionName}({});\n    expect(result.isValid).toBe(false);\n    expect(result.errors.length).toBeGreaterThan(0);\n  });\n\n  it("handles non-finite values without crashing", () => {\n    const result = ${functionName}({ valueA: Number.NaN, valueB: Number.POSITIVE_INFINITY });\n    expect(result.isValid).toBe(false);\n  });\n});\n`;
}

function buildCalculatorTsx({ title, functionName }) {
  return `"use client";\n\nimport { useState } from "react";\nimport { ${functionName} } from "./logic";\n\nconst DEFAULT_INPUT = '{\\n  "principal": 100000,\\n  "annualRate": 5,\\n  "years": 30\\n}';\nconst TOOL_TITLE = ${JSON.stringify(title)};\n\nexport default function Calculator() {\n  const [rawInput, setRawInput] = useState(DEFAULT_INPUT);\n  const [output, setOutput] = useState<ReturnType<typeof ${functionName}> | null>(null);\n  const [parseError, setParseError] = useState<string | null>(null);\n\n  return (\n    <main style={{ maxWidth: 980, margin: "0 auto", padding: "24px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>\n      <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>{TOOL_TITLE}</h1>\n      <p style={{ color: "#555", marginBottom: "16px" }}>\n        Artifact staging calculator. Nog niet live, wel direct uitvoerbaar.\n      </p>\n      <label htmlFor="json-input" style={{ display: "block", marginBottom: "8px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>\n        JSON input\n      </label>\n      <textarea\n        id="json-input"\n        value={rawInput}\n        onChange={(event) => setRawInput(event.target.value)}\n        rows={14}\n        style={{ width: "100%", border: "1px solid #ddd", borderRadius: "8px", padding: "12px", marginBottom: "12px" }}\n      />\n      <button\n        type="button"\n        onClick={() => {\n          setParseError(null);\n          try {\n            const parsed = JSON.parse(rawInput) as Record<string, unknown>;\n            setOutput(${functionName}(parsed));\n          } catch {\n            setOutput(null);\n            setParseError("De JSON-invoer is ongeldig.");\n          }\n        }}\n        style={{ border: "1px solid #111", borderRadius: "999px", padding: "10px 18px", background: "#111", color: "#fff", cursor: "pointer" }}\n      >\n        Bereken\n      </button>\n      {parseError ? <p style={{ color: "#b00020", marginTop: "12px" }}>{parseError}</p> : null}\n      <section style={{ marginTop: "20px" }}>\n        <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>Resultaat</h2>\n        <pre style={{ whiteSpace: "pre-wrap", border: "1px solid #ddd", borderRadius: "8px", padding: "12px", background: "#fafafa" }}>\n          {JSON.stringify(output, null, 2)}\n        </pre>\n      </section>\n    </main>\n  );\n}\n`;
}

function buildReadme({ title, categorySlug, profile, sourceUrl, sourceInvulblad, toolMetaPath }) {
  return `# ${title}\n\n- Categorie: \`${categorySlug}\`\n- Profiel: \`${profile}\`\n- Bron URL: ${sourceUrl}\n- Bron invulblad: \`${sourceInvulblad}\`\n- Tool metadata: \`${toolMetaPath}\`\n\n## Doel\n\nDeze staging-app is automatisch gegenereerd uit ingevulde artifacts en blijft buiten \`apps/\`.\n\n## Bestanden\n\n- \`app.json\`\n- \`logic.ts\`\n- \`logic.test.ts\`\n- \`Calculator.tsx\`\n\n## Notitie\n\nBij profiel \`generic_contract\` is handmatige domeinverfijning nodig voordat de tool naar \`apps/\` verplaatst wordt.\n`;
}

function buildCategoryIndex({ categorySlug, categoryTitle, tools }) {
  const lines = [];
  lines.push(`# ${categoryTitle} — Staging apps`);
  lines.push("");
  lines.push(`Categorie: \`${categorySlug}\``);
  lines.push(`Aantal tools: ${tools.length}`);
  lines.push("");
  for (const tool of tools) {
    lines.push(`- \`${tool.slug}\` — ${tool.title} (profile: \`${tool.profile}\`)`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

async function main() {
  const catalogAbsolute = path.join(ROOT, CATALOG_PATH);
  const toolkitsAbsolute = path.join(ROOT, TOOLKITS_ROOT);
  const outputAbsolute = path.join(ROOT, OUTPUT_ROOT);
  await ensureDir(outputAbsolute);
  await ensureDir(path.join(outputAbsolute, "_shared"));

  const catalog = JSON.parse(await fs.readFile(catalogAbsolute, "utf8"));
  const readyCategories = catalog.categories.filter((category) => category.statuses.ready > 0);

  const manifest = [];

  for (const category of readyCategories) {
    const categoryOutputDir = path.join(outputAbsolute, category.categorySlug);
    await ensureDir(categoryOutputDir);

    const toolsRoot = path.join(toolkitsAbsolute, category.categorySlug, "tools");
    const toolDirNames = (await fs.readdir(toolsRoot)).sort();
    const categoryTools = [];

    for (const toolDirName of toolDirNames) {
      const toolMetaPath = path.join(toolsRoot, toolDirName, "tool.meta.json");
      const toolMeta = JSON.parse(await fs.readFile(toolMetaPath, "utf8"));
      if (toolMeta.status !== "ready") continue;

      const profile = detectProfile(category.categorySlug, toolMeta.title);
      const stagingSlug = toolMeta.slug;
      const functionName = `calculate${toPascalCase(stagingSlug)}`;

      const toolOutputDir = path.join(categoryOutputDir, stagingSlug);
      await ensureDir(toolOutputDir);

      const appJson = buildAppJson({
        slug: `${category.categorySlug}-${stagingSlug}`,
        title: toolMeta.title,
        categoryTitle: category.categoryTitle,
        sourceUrl: toolMeta.sourceUrl,
        profile,
        sourceInvulblad: toolMeta.sourceInvulblad,
      });

      await fs.writeFile(path.join(toolOutputDir, "app.json"), `${JSON.stringify(appJson, null, 2)}\n`, "utf8");
      await fs.writeFile(path.join(toolOutputDir, "profile.json"), `${JSON.stringify({
        profile,
        title: toolMeta.title,
        slug: stagingSlug,
        categorySlug: category.categorySlug,
        sourceUrl: toolMeta.sourceUrl,
        sourceInvulblad: toolMeta.sourceInvulblad,
        generatedAt: new Date().toISOString(),
      }, null, 2)}\n`, "utf8");
      await fs.writeFile(path.join(toolOutputDir, "logic.ts"), buildLogicTs({ functionName, profile }), "utf8");
      await fs.writeFile(path.join(toolOutputDir, "logic.test.ts"), buildLogicTestTs({ functionName }), "utf8");
      await fs.writeFile(path.join(toolOutputDir, "Calculator.tsx"), buildCalculatorTsx({ title: toolMeta.title, functionName }), "utf8");
      await fs.writeFile(
        path.join(toolOutputDir, "README.md"),
        buildReadme({
          title: toolMeta.title,
          categorySlug: category.categorySlug,
          profile,
          sourceUrl: toolMeta.sourceUrl,
          sourceInvulblad: toolMeta.sourceInvulblad,
          toolMetaPath: path.relative(ROOT, toolMetaPath),
        }),
        "utf8",
      );

      manifest.push({
        categorySlug: category.categorySlug,
        title: toolMeta.title,
        slug: stagingSlug,
        profile,
        path: path.relative(ROOT, toolOutputDir),
      });
      categoryTools.push({
        title: toolMeta.title,
        slug: stagingSlug,
        profile,
      });
    }

    await fs.writeFile(
      path.join(categoryOutputDir, "INDEX.md"),
      buildCategoryIndex({
        categorySlug: category.categorySlug,
        categoryTitle: category.categoryTitle,
        tools: categoryTools,
      }),
      "utf8",
    );
  }

  const globalLines = [];
  globalLines.push("# Artifacts Staging Apps");
  globalLines.push("");
  globalLines.push("Deze map bevat automatisch gegenereerde staging-apps uit ingevulde invulbladen.");
  globalLines.push("Verplaats niets naar `apps/` totdat dat expliciet gevraagd wordt.");
  globalLines.push("");
  globalLines.push(`Gegenereerd op: ${new Date().toISOString()}`);
  globalLines.push(`Aantal tools: ${manifest.length}`);
  globalLines.push("");
  for (const row of manifest) {
    globalLines.push(`- [${row.title}](${row.path}) — \`${row.categorySlug}\` / \`${row.profile}\``);
  }
  globalLines.push("");

  await fs.writeFile(path.join(outputAbsolute, "INDEX.md"), `${globalLines.join("\n")}\n`, "utf8");
  await fs.writeFile(path.join(outputAbsolute, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`Generated ${manifest.length} staging tools in ${OUTPUT_ROOT}`);
}

await main();
