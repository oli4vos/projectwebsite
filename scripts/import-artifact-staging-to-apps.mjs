#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const STAGING_MANIFEST_PATH = path.join(
  ROOT,
  "artifacts/staging-apps/manifest.json",
);
const STAGING_SHARED_RUNTIME_PATH = path.join(
  ROOT,
  "artifacts/staging-apps/_shared/runtime.ts",
);
const STAGING_SHARED_RUNTIME_TEST_PATH = path.join(
  ROOT,
  "artifacts/staging-apps/_shared/runtime.test.ts",
);
const APPS_DIR = path.join(ROOT, "apps");
const APPS_SHARED_DIR = path.join(APPS_DIR, "_artifact_shared");

function mapAssumptions(categorySlug) {
  switch (categorySlug) {
    case "hypotheek-wonen":
      return ["mortgage", "tax"];
    case "basis-berekeningen":
      return ["investment"];
    case "geld-lenen-financiering":
      return ["tax"];
    case "gezin-relatie":
      return ["tax"];
    default:
      return ["investment"];
  }
}

function mapCalculationDomains(categorySlug) {
  switch (categorySlug) {
    case "hypotheek-wonen":
      return ["mortgage", "housing", "cashflow"];
    case "basis-berekeningen":
      return ["cashflow"];
    case "geld-lenen-financiering":
      return ["cashflow"];
    case "gezin-relatie":
      return ["cashflow"];
    default:
      return ["cashflow"];
  }
}

function buildAppJson({ targetSlug, title, categorySlug }) {
  return {
    slug: targetSlug,
    title: `${title} (Artifacts)`,
    description:
      "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    type: "frontend",
    category: "Artifacts (invulbladen)",
    tags: ["artifact-import", categorySlug, "invulblad"],
    status: "draft",
    visibility: "public",
    reasonHint:
      "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    assumptionsUsed: mapAssumptions(categorySlug),
    calculationDomains: mapCalculationDomains(categorySlug),
    riskLevel: "medium",
    disclaimerType: "financialEducation",
    outputType: "singleResult",
    version: "1.0.0",
    entry: "Calculator.tsx",
  };
}

async function copyFile(fromPath, toPath) {
  await fs.copyFile(fromPath, toPath);
}

function rewriteSharedImports(content) {
  return content
    .replaceAll(`from "../../_shared/runtime"`, `from "../_artifact_shared/runtime"`)
    .replaceAll(`from "../_shared/runtime"`, `from "../_artifact_shared/runtime"`);
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(STAGING_MANIFEST_PATH, "utf8"));
  await fs.mkdir(APPS_SHARED_DIR, { recursive: true });
  const sharedRuntimeSource = await fs.readFile(
    STAGING_SHARED_RUNTIME_PATH,
    "utf8",
  );
  const sharedRuntimeWithEslintDirective = sharedRuntimeSource.startsWith(
    "/* eslint-disable @typescript-eslint/ban-ts-comment */",
  )
    ? sharedRuntimeSource
    : `/* eslint-disable @typescript-eslint/ban-ts-comment */\n${sharedRuntimeSource}`;
  await fs.writeFile(
    path.join(APPS_SHARED_DIR, "runtime.ts"),
    sharedRuntimeWithEslintDirective,
    "utf8",
  );
  await copyFile(
    STAGING_SHARED_RUNTIME_TEST_PATH,
    path.join(APPS_SHARED_DIR, "runtime.test.ts"),
  );
  let imported = 0;

  for (const entry of manifest) {
    const sourceDir = path.join(ROOT, entry.path);
    const targetSlug = `artifact-${entry.categorySlug}-${entry.slug}`;
    const targetDir = path.join(APPS_DIR, targetSlug);

    await fs.rm(targetDir, { recursive: true, force: true });
    await fs.mkdir(targetDir, { recursive: true });

    const appJson = buildAppJson({
      targetSlug,
      title: entry.title,
      categorySlug: entry.categorySlug,
    });

    await fs.writeFile(
      path.join(targetDir, "app.json"),
      `${JSON.stringify(appJson, null, 2)}\n`,
      "utf8",
    );

    const logicSource = await fs.readFile(path.join(sourceDir, "logic.ts"), "utf8");
    await fs.writeFile(
      path.join(targetDir, "logic.ts"),
      rewriteSharedImports(logicSource),
      "utf8",
    );
    const logicTestSource = await fs.readFile(
      path.join(sourceDir, "logic.test.ts"),
      "utf8",
    );
    await fs.writeFile(
      path.join(targetDir, "logic.test.ts"),
      rewriteSharedImports(logicTestSource),
      "utf8",
    );
    await copyFile(
      path.join(sourceDir, "Calculator.tsx"),
      path.join(targetDir, "Calculator.tsx"),
    );

    imported += 1;
  }

  process.stdout.write(`Imported ${imported} artifact tool(s) into apps/.\n`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
