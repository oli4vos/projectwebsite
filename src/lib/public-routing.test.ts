import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("public routing scope", () => {
  it("keeps v2 outside the public Next app routes", () => {
    const appDirectory = path.join(process.cwd(), "src/app");

    expect(fs.existsSync(path.join(appDirectory, "v2"))).toBe(false);
    expect(fs.existsSync(path.join(appDirectory, "_v2-paused", "v2"))).toBe(true);
  });

  it("keeps the legal information available as public routes", () => {
    const appDirectory = path.join(process.cwd(), "src/app");
    const footer = fs.readFileSync(
      path.join(process.cwd(), "src/components/SiteFooter.tsx"),
      "utf8",
    );

    expect(fs.existsSync(path.join(appDirectory, "privacy", "page.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(appDirectory, "voorwaarden", "page.tsx"))).toBe(true);
    expect(footer).toContain('href="/privacy"');
    expect(footer).toContain('href="/voorwaarden"');
    expect(footer).toContain('href="https://github.com/oli4vos/projectwebsite"');
  });
});
