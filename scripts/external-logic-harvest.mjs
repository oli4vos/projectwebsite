#!/usr/bin/env node

/**
 * Backward-compatible wrapper.
 * This keeps the old script path available and delegates to the current
 * generic scraper.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const scriptPath = path.resolve(process.cwd(), "scripts/scrape-reusable-logic.mjs");
const args = process.argv.slice(2);

const child = spawn(process.execPath, [scriptPath, ...args], {
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
