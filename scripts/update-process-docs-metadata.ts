import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  buildProcessIndex,
  calculateSourceHash,
  processIndexPath,
  projectRoot,
  readActivePublicTools,
  readProcessDocument,
} from "./process-docs-lib";

const args = process.argv.slice(2);
const toolIndex = args.indexOf("--tool");
const toolId = toolIndex >= 0 ? args[toolIndex + 1] : undefined;
if (!toolId || !args.includes("--reviewed")) {
  console.error("Gebruik: npm run process:update -- --tool <tool-id> --reviewed");
  console.error("--reviewed bevestigt dat PROCESS.md inhoudelijk tegen de functionele bronnen is gecontroleerd.");
  process.exit(1);
}

const tool = readActivePublicTools().find((candidate) => candidate.slug === toolId);
if (!tool) {
  console.error(`Geen actieve publieke tool gevonden met ID: ${toolId}`);
  process.exit(1);
}

const { content, metadata } = readProcessDocument(tool.processPath);
const sourceHash = calculateSourceHash(metadata.sources);
const lastReviewed = new Date().toISOString().slice(0, 10);
const updated = content
  .replace(/^lastReviewed:.*$/m, `lastReviewed: ${lastReviewed}`)
  .replace(/^sourceHash:.*$/m, `sourceHash: ${sourceHash}`);
writeFileSync(join(projectRoot, tool.processPath), updated, "utf8");
mkdirSync(dirname(join(projectRoot, processIndexPath)), { recursive: true });
writeFileSync(join(projectRoot, processIndexPath), buildProcessIndex(), "utf8");

console.log(`Updated reviewed metadata for ${toolId}.`);
console.log("Deze opdracht bevestigt geen review zonder de expliciete --reviewed-verklaring van de uitvoerder.");
