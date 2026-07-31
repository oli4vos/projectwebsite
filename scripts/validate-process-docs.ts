import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parsePublishedToolProcess } from "../src/lib/tool-process";
import {
  buildProcessIndex,
  calculateSourceHash,
  extractMermaidBlocks,
  findReferencedRepoFiles,
  parseProcessDocument,
  processIndexPath,
  projectRoot,
  readActivePublicTools,
  readProcessDocument,
  sectionContent,
  validateMermaidBlock,
} from "./process-docs-lib";

const errors: string[] = [];
const tools = readActivePublicTools();
const activeIds = new Set(tools.map((tool) => tool.slug));
const documentedIds = new Map<string, string>();

for (const entry of readdirSync(join(projectRoot, "apps"), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const processPath = `apps/${entry.name}/PROCESS.md`;
  const absolutePath = join(projectRoot, processPath);
  if (!existsSync(absolutePath)) continue;
  try {
    const metadata = parseProcessDocument(readFileSync(absolutePath, "utf8"), processPath);
    const duplicate = documentedIds.get(metadata.tool);
    if (duplicate) errors.push(`Dubbele tool-ID ${metadata.tool} in ${duplicate} en ${processPath}.`);
    documentedIds.set(metadata.tool, processPath);
    if (!activeIds.has(metadata.tool) && metadata.status === "active-public") {
      errors.push(`${processPath}: uitgeschakelde of verborgen tool staat als active-public gedocumenteerd.`);
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
}

for (const tool of tools) {
  if (!existsSync(join(projectRoot, tool.processPath))) {
    errors.push(`Actieve publieke tool ${tool.slug} mist ${tool.processPath}.`);
    continue;
  }
  try {
    const { content, metadata } = readProcessDocument(tool.processPath);
    if (metadata.tool !== tool.slug) errors.push(`${tool.processPath}: tool-ID moet ${tool.slug} zijn.`);
    if (metadata.title !== tool.title) errors.push(`${tool.processPath}: titel wijkt af van app.json (${tool.title}).`);
    if (metadata.route !== tool.route) errors.push(`${tool.processPath}: route moet ${tool.route} zijn.`);
    if (metadata.status !== "active-public") errors.push(`${tool.processPath}: status moet active-public zijn.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.lastReviewed)) {
      errors.push(`${tool.processPath}: lastReviewed moet een ISO-datum zijn.`);
    }
    if (!metadata.sources.includes(tool.manifestPath)) errors.push(`${tool.processPath}: manifest ontbreekt in sources.`);
    if (!metadata.sources.includes(tool.entry)) errors.push(`${tool.processPath}: hoofdcomponent ontbreekt in sources.`);
    if (new Set(metadata.sources).size !== metadata.sources.length) errors.push(`${tool.processPath}: dubbele sources gevonden.`);

    for (const source of metadata.sources) {
      if (!existsSync(join(projectRoot, source))) errors.push(`${tool.processPath}: bronbestand bestaat niet: ${source}.`);
    }
    const actualHash = calculateSourceHash(metadata.sources);
    if (metadata.sourceHash !== actualHash) {
      errors.push(
        `Procesdocumentatie mogelijk verouderd: functionele bronnen van ${tool.slug} zijn gewijzigd.\n` +
        `Controleer: ${tool.processPath}\n` +
        `Werk daarna bij met: npm run process:update -- --tool ${tool.slug} --reviewed`,
      );
    }

    const requiredSections = [
      "1. Identificatie",
      "2. Gebruikersproces",
      "3. Beslisproces",
      "4. Rekenproces",
      "5. Gegevensstroom en koppelingen",
      "6. Resultaten en uitzonderingen",
      "7. Functionele bronverwijzingen",
    ];
    for (const heading of requiredSections) {
      if (!content.includes(`## ${heading}`)) errors.push(`${tool.processPath}: sectie ${heading} ontbreekt.`);
    }
    for (const heading of ["2. Gebruikersproces", "3. Beslisproces", "4. Rekenproces"]) {
      const blocks = extractMermaidBlocks(sectionContent(content, heading));
      if (blocks.length === 0) errors.push(`${tool.processPath}: ${heading} mist een Mermaid-procesplaat.`);
      blocks.forEach((block, index) => errors.push(...validateMermaidBlock(block, `${tool.processPath} ${heading} blok ${index + 1}`)));
    }
    try {
      parsePublishedToolProcess(content);
    } catch (error) {
      errors.push(
        `${tool.processPath}: publieke procesgids kan niet worden opgebouwd: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
    const dataFlowSection = sectionContent(content, "5. Gegevensstroom en koppelingen");
    if (dataFlowSection.trim().length < 80) errors.push(`${tool.processPath}: gegevensstroom is onvoldoende beschreven.`);
    extractMermaidBlocks(dataFlowSection).forEach((block, index) =>
      errors.push(...validateMermaidBlock(block, `${tool.processPath} gegevensstroom blok ${index + 1}`)),
    );

    for (const referencedFile of findReferencedRepoFiles(content)) {
      if (!existsSync(join(projectRoot, referencedFile))) {
        errors.push(`${tool.processPath}: genoemd lokaal bestand bestaat niet: ${referencedFile}.`);
      }
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
}

const indexAbsolutePath = join(projectRoot, processIndexPath);
if (!existsSync(indexAbsolutePath)) {
  errors.push(`Centrale procesindex ontbreekt: ${processIndexPath}.`);
} else {
  const actualIndex = readFileSync(indexAbsolutePath, "utf8");
  const expectedIndex = buildProcessIndex(tools);
  if (actualIndex !== expectedIndex) {
    errors.push(`Centrale procesindex is verouderd. Draai: npm run process:index`);
  }
  for (const tool of tools) {
    if (!actualIndex.includes(`../../${tool.processPath}`)) errors.push(`${processIndexPath}: ${tool.slug} ontbreekt.`);
  }
}

if (errors.length > 0) {
  console.error(`Process documentation validation failed (${errors.length}):\n`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Process documentation validation passed for ${tools.length} active public tools.`);
