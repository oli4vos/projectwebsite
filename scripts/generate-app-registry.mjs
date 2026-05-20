import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const appsDir = path.join(rootDir, "apps");
const libDir = path.join(rootDir, "src", "lib");
const registryOutputPath = path.join(libDir, "app-registry.ts");
const componentsOutputPath = path.join(libDir, "app-components.tsx");

const slugPattern = /^[a-z0-9-]+$/;
const validTypes = new Set(["frontend", "api"]);
const validStatuses = new Set(["active", "beta", "draft"]);
const validVisibilities = new Set(["public", "hidden"]);
const validAssumptionsUsed = new Set([
  "duo",
  "tax",
  "box1",
  "box3",
  "mortgage",
  "investment",
  "inflation",
  "charts",
]);
const validCalculationDomains = new Set([
  "studentDebt",
  "mortgage",
  "housing",
  "tax",
  "investing",
  "saving",
  "cashflow",
  "employment",
  "pension",
]);
const validRiskLevels = new Set(["low", "medium", "high"]);
const validDisclaimerTypes = new Set([
  "indicative",
  "financialEducation",
  "taxIndicative",
  "mortgageIndicative",
  "duoIndicative",
]);
const validOutputTypes = new Set([
  "singleResult",
  "scenarioComparison",
  "timeline",
  "checklist",
  "mixed",
]);
const publicRequiredManifestFields = [
  "title",
  "description",
  "category",
  "tags",
  "reasonHint",
  "assumptionsUsed",
  "calculationDomains",
  "riskLevel",
  "disclaimerType",
  "outputType",
];

function fail(message) {
  throw new Error(message);
}

function ensureString(value, fieldName, slug) {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`App "${slug}": veld "${fieldName}" is verplicht.`);
  }

  return value.trim();
}

function allowedValuesMessage(validValues) {
  return [...validValues].map((value) => `"${value}"`).join(", ");
}

function validateOptionalStringArray(value, fieldName, slug) {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    fail(`App "${slug}": veld "${fieldName}" moet een array van strings zijn.`);
  }

  return value.map((item, index) => {
    if (typeof item !== "string" || item.trim().length === 0) {
      fail(
        `App "${slug}": veld "${fieldName}[${index}]" moet een niet-lege string zijn.`,
      );
    }

    return item.trim();
  });
}

function validateOptionalReasonHint(value, slug) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    fail(`App "${slug}": veld "reasonHint" moet een string zijn.`);
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    return undefined;
  }

  if (trimmedValue.length > 180) {
    fail(
      `App "${slug}": veld "reasonHint" mag maximaal 180 tekens bevatten.`,
    );
  }

  if (trimmedValue.includes("<") || trimmedValue.includes(">")) {
    fail(
      `App "${slug}": veld "reasonHint" mag geen HTML of angle brackets bevatten.`,
    );
  }

  return trimmedValue;
}

function validateOptionalEnum(value, fieldName, slug, validValues) {
  if (value === undefined) {
    return undefined;
  }

  const normalizedValue = ensureString(value, fieldName, slug);
  if (!validValues.has(normalizedValue)) {
    fail(
      `App "${slug}": veld "${fieldName}" moet één van ${allowedValuesMessage(validValues)} zijn.`,
    );
  }

  return normalizedValue;
}

function validateOptionalEnumArray(value, fieldName, slug, validValues) {
  const values = validateOptionalStringArray(value, fieldName, slug);
  if (values === undefined) {
    return undefined;
  }

  return values.map((item, index) => {
    if (!validValues.has(item)) {
      fail(
        `App "${slug}": veld "${fieldName}[${index}]" moet één van ${allowedValuesMessage(validValues)} zijn.`,
      );
    }

    return item;
  });
}

function validateManifest(manifest, directoryName) {
  const slug = ensureString(manifest.slug, "slug", directoryName);
  if (slug !== directoryName) {
    fail(`App "${directoryName}": slug moet gelijk zijn aan de mapnaam.`);
  }
  if (!slugPattern.test(slug)) {
    fail(
      `App "${slug}": slug mag alleen kleine letters, cijfers en koppeltekens bevatten.`,
    );
  }

  const title = ensureString(manifest.title, "title", slug);
  const description = ensureString(manifest.description, "description", slug);
  const type = ensureString(manifest.type, "type", slug);
  const category = ensureString(manifest.category, "category", slug);
  const entry = ensureString(manifest.entry, "entry", slug);

  if (!validTypes.has(type)) {
    fail(`App "${slug}": type moet "frontend" of "api" zijn.`);
  }

  if (!Array.isArray(manifest.tags)) {
    fail(`App "${slug}": tags moet een array zijn.`);
  }

  const tags = manifest.tags.map((tag, index) => {
    if (typeof tag !== "string" || tag.trim().length === 0) {
      fail(`App "${slug}": tags[${index}] moet een niet-lege string zijn.`);
    }

    return tag.trim();
  });

  const status = ensureString(manifest.status, "status", slug);
  if (!validStatuses.has(status)) {
    fail(`App "${slug}": status moet "active", "beta" of "draft" zijn.`);
  }

  const visibility =
    manifest.visibility === undefined
      ? "public"
      : ensureString(manifest.visibility, "visibility", slug);

  if (!validVisibilities.has(visibility)) {
    fail(`App "${slug}": visibility moet "public" of "hidden" zijn.`);
  }

  if (entry.includes("..")) {
    fail(`App "${slug}": entry mag geen ".." bevatten.`);
  }

  const version =
    manifest.version === undefined
      ? undefined
      : ensureString(manifest.version, "version", slug);
  const requiredProfileFields = validateOptionalStringArray(
    manifest.requiredProfileFields,
    "requiredProfileFields",
    slug,
  );
  const reasonHint = validateOptionalReasonHint(manifest.reasonHint, slug);
  const assumptionsUsed = validateOptionalEnumArray(
    manifest.assumptionsUsed,
    "assumptionsUsed",
    slug,
    validAssumptionsUsed,
  );
  const calculationDomains = validateOptionalEnumArray(
    manifest.calculationDomains,
    "calculationDomains",
    slug,
    validCalculationDomains,
  );
  const riskLevel = validateOptionalEnum(
    manifest.riskLevel,
    "riskLevel",
    slug,
    validRiskLevels,
  );
  const disclaimerType = validateOptionalEnum(
    manifest.disclaimerType,
    "disclaimerType",
    slug,
    validDisclaimerTypes,
  );
  const outputType = validateOptionalEnum(
    manifest.outputType,
    "outputType",
    slug,
    validOutputTypes,
  );

  if (visibility === "public") {
    for (const field of publicRequiredManifestFields) {
      const value = manifest[field];
      if (Array.isArray(value)) {
        if (value.length === 0) {
          fail(
            `App "${slug}": publiek app.json mist verplicht veld "${field}" of bevat een lege waarde.`,
          );
        }
      } else if (value === undefined || value === null || `${value}`.trim?.() === "") {
        fail(
          `App "${slug}": publiek app.json mist verplicht veld "${field}".`,
        );
      }
    }
  }

  return {
    slug,
    title,
    description,
    type,
    category,
    tags,
    status,
    visibility,
    requiredProfileFields,
    reasonHint,
    assumptionsUsed,
    calculationDomains,
    riskLevel,
    disclaimerType,
    outputType,
    version,
    entry,
  };
}

function toImportPath(slug, entry) {
  const normalizedEntry = entry.replace(/\\/g, "/").replace(/\.(tsx|ts|jsx|js)$/u, "");
  return `../../apps/${slug}/${normalizedEntry}`;
}

function buildRegistryFile(manifests) {
  const manifestJson = JSON.stringify(manifests, null, 2);

  return `import type { AppManifest } from "@/lib/app-types";

// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Run: npm run generate:apps

export const appRegistry = ${manifestJson} satisfies AppManifest[];

export const appRegistryBySlug = Object.fromEntries(
  appRegistry.map((app) => [app.slug, app]),
) as Record<string, AppManifest>;
`;
}

function buildComponentsFile(manifests) {
  const componentEntries = manifests
    .map((manifest) => {
      const importPath = toImportPath(manifest.slug, manifest.entry);

      return `  "${manifest.slug}": dynamic(() => import("${importPath}"), {
    loading: () => (
      <div className="rounded-[2rem] border border-line bg-white/80 p-6 text-sm text-muted">
        Rekentool laden...
      </div>
    ),
  }),`;
    })
    .join("\n");

  return `import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Run: npm run generate:apps

export type AppCalculatorComponent = ComponentType<Record<string, never>>;

export const appComponents: Record<string, AppCalculatorComponent> = {
${componentEntries}
};
`;
}

async function main() {
  const appDirectoryEntries = await fs.readdir(appsDir, { withFileTypes: true });
  const appDirectories = appDirectoryEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const manifests = [];

  for (const directoryName of appDirectories) {
    const manifestPath = path.join(appsDir, directoryName, "app.json");

    try {
      await fs.access(manifestPath);
    } catch {
      fail(`Map "apps/${directoryName}" mist een verplicht app.json-bestand.`);
    }

    const manifestContent = await fs.readFile(manifestPath, "utf8");
    const manifest = JSON.parse(manifestContent);
    const validatedManifest = validateManifest(manifest, directoryName);
    const entryPath = path.join(appsDir, directoryName, validatedManifest.entry);

    try {
      await fs.access(entryPath);
    } catch {
      fail(
        `App "${validatedManifest.slug}": entry "${validatedManifest.entry}" bestaat niet.`,
      );
    }

    if (validatedManifest.visibility === "public") {
      const requiredFiles = [
        "logic.ts",
        "Calculator.tsx",
        "logic.test.ts",
      ];

      for (const requiredFile of requiredFiles) {
        const requiredFilePath = path.join(appsDir, directoryName, requiredFile);
        try {
          await fs.access(requiredFilePath);
        } catch {
          fail(
            `App "${validatedManifest.slug}": publiek app mist verplicht bestand "${requiredFile}".`,
          );
        }
      }
    }

    manifests.push(validatedManifest);
  }

  const publicManifests = manifests.filter(
    (manifest) => manifest.visibility !== "hidden",
  );

  await fs.mkdir(libDir, { recursive: true });
  await fs.writeFile(
    registryOutputPath,
    buildRegistryFile(publicManifests),
    "utf8",
  );
  await fs.writeFile(
    componentsOutputPath,
    buildComponentsFile(publicManifests),
    "utf8",
  );

  process.stdout.write(
    `Generated app registry for ${publicManifests.length} public app(s) (${manifests.length} total).\n`,
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
