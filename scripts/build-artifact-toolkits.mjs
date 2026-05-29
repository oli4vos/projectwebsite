#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_ROOT =
  process.argv[2] ??
  "artifacts/externe-bron-logic-2026-05-28T16-50-04-860Z";
const OUTPUT_ROOT = process.argv[3] ?? "artifacts/toolkits";

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

function toCategoryTitle(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeLine(line) {
  return line.replace(/\s+$/g, "");
}

function normalizeInvulValue(value) {
  return value
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTitle(value) {
  return value.replace(/^#+\s*/, "").trim();
}

function parseInvulblad(content, fileName) {
  const lines = content.split("\n").map(normalizeLine);
  const categorySlugMatch = content.match(/Categorie-slug:\s*([^\n]+)/i);
  const categorySlug =
    categorySlugMatch?.[1]?.trim() ?? fileName.replace(/-logic-invulblad\.md$/i, "");

  const urlEntries = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].startsWith("Bron-URL:")) continue;
    const url = lines[i].replace("Bron-URL:", "").trim();
    let titleIndex = i - 1;
    while (titleIndex >= 0 && lines[titleIndex].trim() === "") {
      titleIndex -= 1;
    }
    const title = cleanTitle(lines[titleIndex]?.trim() ?? `tool-${urlEntries.length + 1}`);
    urlEntries.push({
      index: i,
      titleIndex,
      title,
      sourceUrl: url,
    });
  }

  const tools = [];
  const slugUseCount = new Map();
  for (let i = 0; i < urlEntries.length; i += 1) {
    const current = urlEntries[i];
    const next = urlEntries[i + 1];
    const start = current.titleIndex;
    const end = next ? next.titleIndex - 1 : lines.length - 1;
    const blockLines = lines.slice(start, end + 1);
    const block = blockLines.join("\n").trim();

    const invulMatches = [...block.matchAll(/^\s*INVUL:[ \t]*(.*)$/gm)];
    const totalInvul = invulMatches.length;
    const filledInvul = invulMatches.filter((m) => normalizeInvulValue(m[1]).length > 0).length;
    const status =
      totalInvul > 0 && filledInvul === totalInvul
        ? "ready"
        : filledInvul > 0
          ? "partial"
          : "needs-spec";

    const baseSlug = slugify(current.title) || `tool-${i + 1}`;
    const seenCount = slugUseCount.get(baseSlug) ?? 0;
    slugUseCount.set(baseSlug, seenCount + 1);
    const uniqueSlug = seenCount === 0 ? baseSlug : `${baseSlug}-${seenCount + 1}`;

    tools.push({
      title: current.title,
      slug: uniqueSlug,
      sourceUrl: current.sourceUrl,
      status,
      totalInvul,
      filledInvul,
      completion: totalInvul === 0 ? 0 : Math.round((filledInvul / totalInvul) * 100),
      block,
    });
  }

  const totalInvul = tools.reduce((sum, tool) => sum + tool.totalInvul, 0);
  const filledInvul = tools.reduce((sum, tool) => sum + tool.filledInvul, 0);

  return {
    categorySlug,
    categoryTitle: toCategoryTitle(categorySlug),
    fileName,
    tools,
    totalInvul,
    filledInvul,
    completion: totalInvul === 0 ? 0 : Math.round((filledInvul / totalInvul) * 100),
  };
}

function buildAppTemplate(toolkit) {
  return {
    slug: toolkit.slug,
    title: toolkit.title,
    description: `Draft op basis van artifacts-contract: ${toolkit.title}.`,
    type: "frontend",
    category: toolkit.categoryTitle,
    tags: ["artifact-generated", "draft"],
    status: "draft",
    visibility: "hidden",
    reasonHint: "Deze tool is gegenereerd uit artifacts en nog niet gevalideerd voor publicatie.",
    assumptionsUsed: ["mortgage"],
    calculationDomains: ["cashflow"],
    riskLevel: "medium",
    disclaimerType: "financialEducation",
    outputType: "singleResult",
    requiredProfileFields: [],
    version: "1.0.0",
    entry: "Calculator.tsx",
  };
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function main() {
  const sourceAbsolute = path.join(ROOT, SOURCE_ROOT);
  const outputAbsolute = path.join(ROOT, OUTPUT_ROOT);
  await ensureDir(outputAbsolute);

  const allSourceFiles = await fs.readdir(sourceAbsolute);
  const invulFiles = allSourceFiles
    .filter((name) => name.endsWith("-logic-invulblad.md"))
    .filter((name) => name !== "basisberekeningen-logic-invulblad.md")
    .filter((name) => name !== "lenen-financiering-logic-invulblad.md")
    .sort();

  const categoryResults = [];

  for (const fileName of invulFiles) {
    const sourcePath = path.join(sourceAbsolute, fileName);
    const content = await fs.readFile(sourcePath, "utf8");
    const parsed = parseInvulblad(content, fileName);
    categoryResults.push(parsed);
  }

  const categoriesRoot = path.join(outputAbsolute, "categories");
  await ensureDir(categoriesRoot);

  for (const category of categoryResults) {
    const categoryDir = path.join(categoriesRoot, category.categorySlug);
    await ensureDir(categoryDir);

    const categoryMeta = {
      categorySlug: category.categorySlug,
      categoryTitle: category.categoryTitle,
      sourceInvulblad: `${SOURCE_ROOT}/${category.fileName}`,
      tools: category.tools.length,
      invul: {
        filled: category.filledInvul,
        total: category.totalInvul,
        completionPercent: category.completion,
      },
      statuses: {
        ready: category.tools.filter((tool) => tool.status === "ready").length,
        partial: category.tools.filter((tool) => tool.status === "partial").length,
        needsSpec: category.tools.filter((tool) => tool.status === "needs-spec").length,
      },
    };
    await fs.writeFile(
      path.join(categoryDir, "category.meta.json"),
      `${JSON.stringify(categoryMeta, null, 2)}\n`,
      "utf8",
    );

    const toolsDir = path.join(categoryDir, "tools");
    await ensureDir(toolsDir);

    for (const tool of category.tools) {
      const toolDir = path.join(toolsDir, tool.slug);
      await ensureDir(toolDir);

      const toolkitMeta = {
        title: tool.title,
        slug: tool.slug,
        categorySlug: category.categorySlug,
        categoryTitle: category.categoryTitle,
        sourceUrl: tool.sourceUrl,
        sourceInvulblad: `${SOURCE_ROOT}/${category.fileName}`,
        status: tool.status,
        invul: {
          filled: tool.filledInvul,
          total: tool.totalInvul,
          completionPercent: tool.completion,
        },
        migrationTarget: {
          appDir: `apps/${tool.slug}`,
          requiredFiles: ["app.json", "logic.ts", "logic.test.ts", "Calculator.tsx"],
        },
      };

      await fs.writeFile(
        path.join(toolDir, "tool.meta.json"),
        `${JSON.stringify(toolkitMeta, null, 2)}\n`,
        "utf8",
      );

      await fs.writeFile(
        path.join(toolDir, "app.json.template"),
        `${JSON.stringify(buildAppTemplate({ ...tool, categoryTitle: category.categoryTitle }), null, 2)}\n`,
        "utf8",
      );

      await fs.writeFile(
        path.join(toolDir, "logic.contract.md"),
        `# ${tool.title} — Logic Contract\n\n- Status: \`${tool.status}\`\n- Ingevuld: \`${tool.filledInvul}/${tool.totalInvul}\` (${tool.completion}%)\n- Bron: ${tool.sourceUrl}\n\n## Uit invulblad\n\n${tool.block}\n`,
        "utf8",
      );

      await fs.writeFile(
        path.join(toolDir, "migration.notes.md"),
        `# Migratie naar apps/${tool.slug}\n\n1. Kopieer deze mapinhoud als input voor implementatie.\n2. Maak of update \`apps/${tool.slug}/app.json\` met \`app.json.template\`.\n3. Zet logica uit \`logic.contract.md\` om naar pure functies in \`logic.ts\`.\n4. Bouw minimaal basiscase, edge-case en regressietest in \`logic.test.ts\`.\n5. Maak submit-driven \`Calculator.tsx\` met centrale shell/componenten.\n6. Draai checks: \`npm run generate:apps && npm run test && npm run lint && npm run typecheck && npm run build\`.\n`,
        "utf8",
      );
    }
  }

  const indexLines = [];
  indexLines.push("# Artifacts Toolkit Index");
  indexLines.push("");
  indexLines.push(`Bronmap: \`${SOURCE_ROOT}\``);
  indexLines.push(`Gegenereerd naar: \`${OUTPUT_ROOT}\``);
  indexLines.push("");
  indexLines.push("## Categorie-overzicht");
  indexLines.push("");
  for (const category of categoryResults) {
    const ready = category.tools.filter((tool) => tool.status === "ready").length;
    const partial = category.tools.filter((tool) => tool.status === "partial").length;
    const needsSpec = category.tools.filter((tool) => tool.status === "needs-spec").length;
    indexLines.push(
      `- \`${category.categorySlug}\`: tools=${category.tools.length}, invul=${category.filledInvul}/${category.totalInvul} (${category.completion}%), ready=${ready}, partial=${partial}, needs-spec=${needsSpec}`,
    );
  }
  indexLines.push("");
  indexLines.push("## Overige artifact-sets (niet-app)");
  indexLines.push("");
  indexLines.push("- `artifacts/tool-audit-2026-05-28/`");
  indexLines.push("- `artifacts/usability-audit-2026-05-20/`");
  indexLines.push("- `artifacts/logic-scrape-smoke/`");

  await fs.writeFile(path.join(outputAbsolute, "INDEX.md"), `${indexLines.join("\n")}\n`, "utf8");

  const catalog = {
    generatedAt: new Date().toISOString(),
    sourceRoot: SOURCE_ROOT,
    outputRoot: OUTPUT_ROOT,
    categories: categoryResults.map((category) => ({
      categorySlug: category.categorySlug,
      categoryTitle: category.categoryTitle,
      sourceInvulblad: `${SOURCE_ROOT}/${category.fileName}`,
      tools: category.tools.length,
      invul: {
        filled: category.filledInvul,
        total: category.totalInvul,
        completionPercent: category.completion,
      },
      statuses: {
        ready: category.tools.filter((tool) => tool.status === "ready").length,
        partial: category.tools.filter((tool) => tool.status === "partial").length,
        needsSpec: category.tools.filter((tool) => tool.status === "needs-spec").length,
      },
    })),
  };
  await fs.writeFile(path.join(outputAbsolute, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  console.log(`Generated toolkit catalog in ${OUTPUT_ROOT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
