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

function fail(message) {
  throw new Error(message);
}

function ensureString(value, fieldName, slug) {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`App "${slug}": veld "${fieldName}" is verplicht.`);
  }

  return value.trim();
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

  if (entry.includes("..")) {
    fail(`App "${slug}": entry mag geen ".." bevatten.`);
  }

  const version =
    manifest.version === undefined
      ? undefined
      : ensureString(manifest.version, "version", slug);

  return {
    slug,
    title,
    description,
    type,
    category,
    tags,
    status,
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

    manifests.push(validatedManifest);
  }

  await fs.mkdir(libDir, { recursive: true });
  await fs.writeFile(registryOutputPath, buildRegistryFile(manifests), "utf8");
  await fs.writeFile(componentsOutputPath, buildComponentsFile(manifests), "utf8");

  process.stdout.write(
    `Generated app registry for ${manifests.length} app(s).\n`,
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
