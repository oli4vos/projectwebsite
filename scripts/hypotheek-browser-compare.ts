#!/usr/bin/env tsx

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";

import {
  renderMortgageBrowserComparisonMarkdown,
  runMortgageBrowserComparison,
} from "@/lib/browser-automation/runner";

type CliOptions = {
  limit: number;
  outputPath: string;
  headless: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    limit: 100,
    outputPath: resolve("docs/hypotheek-browser-automation-report.md"),
    headless: true,
  };

  for (const arg of argv) {
    if (arg.startsWith("--limit=")) {
      const value = Number.parseInt(arg.slice("--limit=".length), 10);
      if (Number.isFinite(value) && value > 0) {
        options.limit = value;
      }
      continue;
    }

    if (arg.startsWith("--output=")) {
      options.outputPath = resolve(arg.slice("--output=".length));
      continue;
    }

    if (arg === "--headed") {
      options.headless = false;
      continue;
    }

    if (arg === "--headless") {
      options.headless = true;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = await runMortgageBrowserComparison({
    limit: options.limit,
    headless: options.headless,
    onProgress: (message) => {
      process.stdout.write(`${message}\n`);
    },
  });

  const markdown = renderMortgageBrowserComparisonMarkdown(report);
  mkdirSync(dirname(options.outputPath), { recursive: true });
  writeFileSync(options.outputPath, markdown, "utf8");

  process.stdout.write(`${markdown}\n`);
  process.stdout.write(`\nSaved report to ${options.outputPath}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
