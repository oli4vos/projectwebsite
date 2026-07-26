import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("public routing scope", () => {
  it("keeps v2 outside the public Next app routes", () => {
    const appDirectory = path.join(process.cwd(), "src/app");

    expect(fs.existsSync(path.join(appDirectory, "v2"))).toBe(false);
    expect(fs.existsSync(path.join(appDirectory, "_v2-paused", "v2"))).toBe(true);
  });
});
