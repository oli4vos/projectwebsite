import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { buildSourceDataOverviewMarkdown } from "./source-data-overview";

const outputPath = path.join(process.cwd(), "docs", "source-data-overview.md");

async function main() {
  await fs.writeFile(outputPath, buildSourceDataOverviewMarkdown(), "utf8");
  console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
