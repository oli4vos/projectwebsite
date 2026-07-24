import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const generatorPath = path.join(process.cwd(), "scripts", "generate-app-registry.mjs");
const tempRoots: string[] = [];

type TestManifest = {
  slug: string;
  enabled?: unknown;
  visibility?: "public" | "hidden";
};

function createTempProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "project-site-apps-"));
  tempRoots.push(root);
  fs.mkdirSync(path.join(root, "apps"), { recursive: true });
  fs.mkdirSync(path.join(root, "src", "lib"), { recursive: true });
  return root;
}

function writeApp(root: string, input: TestManifest) {
  const appDir = path.join(root, "apps", input.slug);
  fs.mkdirSync(appDir, { recursive: true });
  fs.writeFileSync(
    path.join(appDir, "app.json"),
    `${JSON.stringify({
      slug: input.slug,
      enabled: input.enabled,
      title: input.slug,
      description: `Beschrijving voor ${input.slug}`,
      type: "frontend",
      category: "Test",
      tags: ["test"],
      status: "beta",
      visibility: input.visibility ?? "public",
      reasonHint: "Compacte hint voor testgebruik.",
      assumptionsUsed: ["duo"],
      calculationDomains: ["studentDebt"],
      riskLevel: "low",
      disclaimerType: "duoIndicative",
      outputType: "singleResult",
      version: "1.0.0",
      entry: "Calculator.tsx",
    }, null, 2)}\n`,
  );
  fs.writeFileSync(path.join(appDir, "Calculator.tsx"), "export default function Calculator() { return null; }\n");
  fs.writeFileSync(path.join(appDir, "logic.ts"), "export const value = 1;\n");
  fs.writeFileSync(path.join(appDir, "logic.test.ts"), "export const testValue = 1;\n");
}

function runGenerator(root: string) {
  return execFileSync("node", [generatorPath], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function runGeneratorExpectingError(root: string) {
  try {
    runGenerator(root);
    throw new Error("Expected generator to fail.");
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "stderr" in error &&
      typeof (error as { stderr: unknown }).stderr === "string"
    ) {
      return (error as { stderr: string }).stderr;
    }
    throw error;
  }
}

function registryOutput(root: string) {
  return fs.readFileSync(path.join(root, "src", "lib", "app-registry.ts"), "utf8");
}

function componentsOutput(root: string) {
  return fs.readFileSync(path.join(root, "src", "lib", "app-components.tsx"), "utf8");
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe("app registry generator enabled flag", () => {
  it("includes enabled public apps and excludes enabled hidden apps", () => {
    const root = createTempProject();
    writeApp(root, { slug: "enabled-public", enabled: true, visibility: "public" });
    writeApp(root, { slug: "enabled-hidden", enabled: true, visibility: "hidden" });

    expect(runGenerator(root)).toContain("1 public app(s) (2 total)");
    expect(registryOutput(root)).toContain('"slug": "enabled-public"');
    expect(registryOutput(root)).toContain('"enabled": true');
    expect(registryOutput(root)).not.toContain('"slug": "enabled-hidden"');
    expect(componentsOutput(root)).toContain("../../apps/enabled-public/Calculator");
    expect(componentsOutput(root)).not.toContain("enabled-hidden");
  });

  it("fully excludes disabled public and disabled hidden apps", () => {
    const root = createTempProject();
    writeApp(root, { slug: "disabled-public", enabled: false, visibility: "public" });
    writeApp(root, { slug: "disabled-hidden", enabled: false, visibility: "hidden" });

    expect(runGenerator(root)).toContain("0 public app(s) (2 total)");
    expect(registryOutput(root)).not.toContain("disabled-public");
    expect(registryOutput(root)).not.toContain("disabled-hidden");
    expect(componentsOutput(root)).not.toContain("disabled-public");
    expect(componentsOutput(root)).not.toContain("disabled-hidden");
  });

  it("rejects missing and invalid enabled values with manifest path context", () => {
    const missingRoot = createTempProject();
    writeApp(missingRoot, { slug: "missing-enabled", visibility: "public" });
    const missingError = runGeneratorExpectingError(missingRoot);
    expect(missingError).toContain('App "missing-enabled"');
    expect(missingError).toContain("apps/missing-enabled/app.json");
    expect(missingError).toContain('veld "enabled" ontbreekt');

    const invalidRoot = createTempProject();
    writeApp(invalidRoot, { slug: "invalid-enabled", enabled: "true", visibility: "public" });
    const invalidError = runGeneratorExpectingError(invalidRoot);
    expect(invalidError).toContain('App "invalid-enabled"');
    expect(invalidError).toContain("apps/invalid-enabled/app.json");
    expect(invalidError).toContain('veld "enabled" moet een boolean zijn');
  });

  it("rediscovers a tool after enabled is set back to true", () => {
    const root = createTempProject();
    writeApp(root, { slug: "toggle-tool", enabled: false, visibility: "public" });
    runGenerator(root);
    expect(registryOutput(root)).not.toContain("toggle-tool");

    writeApp(root, { slug: "toggle-tool", enabled: true, visibility: "public" });
    runGenerator(root);
    expect(registryOutput(root)).toContain('"slug": "toggle-tool"');
  });
});
