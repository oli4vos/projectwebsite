import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  extractMarkdownSection,
  extractMermaidBlocks,
} from "../src/lib/tool-process";

export const projectRoot = resolve(import.meta.dirname, "..");
export const processIndexPath = "docs/processes/README.md";

export type ActivePublicTool = {
  slug: string;
  title: string;
  route: string;
  status: string;
  entry: string;
  manifestPath: string;
  processPath: string;
};

export type ProcessMetadata = {
  tool: string;
  title: string;
  route: string;
  status: string;
  lastReviewed: string;
  sourceHash: string;
  sources: string[];
};

export function repoPath(absolutePath: string) {
  return relative(projectRoot, absolutePath).replaceAll("\\", "/");
}

export function readActivePublicTools(): ActivePublicTool[] {
  const appsDirectory = join(projectRoot, "apps");
  return readdirSync(appsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const manifestPath = join(appsDirectory, entry.name, "app.json");
      if (!existsSync(manifestPath)) return null;
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
      if (manifest.enabled !== true || manifest.visibility !== "public") return null;
      const slug = String(manifest.slug ?? "");
      const entryFile = String(manifest.entry ?? "");
      return {
        slug,
        title: String(manifest.title ?? ""),
        route: `/apps/${slug}`,
        status: String(manifest.status ?? ""),
        entry: `apps/${entry.name}/${entryFile}`,
        manifestPath: `apps/${entry.name}/app.json`,
        processPath: `apps/${entry.name}/PROCESS.md`,
      } satisfies ActivePublicTool;
    })
    .filter((tool): tool is ActivePublicTool => tool !== null)
    .sort((left, right) => left.slug.localeCompare(right.slug));
}

export function parseProcessDocument(content: string, processPath: string): ProcessMetadata {
  const lines = content.split(/\r?\n/);
  if (lines[0] !== "---") throw new Error(`${processPath}: frontmatter moet met --- beginnen.`);
  const end = lines.indexOf("---", 1);
  if (end < 0) throw new Error(`${processPath}: afsluitende --- van frontmatter ontbreekt.`);

  const values = new Map<string, string>();
  const sources: string[] = [];
  let readingSources = false;
  for (const line of lines.slice(1, end)) {
    if (line === "sources:") {
      readingSources = true;
      continue;
    }
    const sourceMatch = /^\s{2}-\s+(.+)$/.exec(line);
    if (readingSources && sourceMatch) {
      sources.push(sourceMatch[1].trim());
      continue;
    }
    readingSources = false;
    const scalarMatch = /^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/.exec(line);
    if (scalarMatch) values.set(scalarMatch[1], scalarMatch[2].trim());
  }

  const required = ["tool", "title", "route", "status", "lastReviewed", "sourceHash"] as const;
  for (const field of required) {
    if (!values.get(field)) throw new Error(`${processPath}: frontmatterveld ${field} ontbreekt.`);
  }
  if (sources.length === 0) throw new Error(`${processPath}: sources bevat geen functionele bronbestanden.`);

  return {
    tool: values.get("tool")!,
    title: values.get("title")!,
    route: values.get("route")!,
    status: values.get("status")!,
    lastReviewed: values.get("lastReviewed")!,
    sourceHash: values.get("sourceHash")!,
    sources,
  };
}

export function readProcessDocument(processPath: string) {
  const absolutePath = join(projectRoot, processPath);
  const content = readFileSync(absolutePath, "utf8");
  return { content, metadata: parseProcessDocument(content, processPath) };
}

export function calculateSourceHash(sources: readonly string[]) {
  const hash = createHash("sha256");
  for (const source of [...new Set(sources)].sort()) {
    const absolutePath = join(projectRoot, source);
    if (!existsSync(absolutePath)) throw new Error(`Functioneel bronbestand bestaat niet: ${source}`);
    hash.update(source);
    hash.update("\0");
    hash.update(readFileSync(absolutePath));
    hash.update("\0");
  }
  return `sha256:${hash.digest("hex")}`;
}

export function sectionContent(content: string, heading: string) {
  return extractMarkdownSection(content, heading);
}

export { extractMermaidBlocks };

export function validateMermaidBlock(block: string, label: string) {
  const errors: string[] = [];
  const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const header = lines[0];
  if (header !== "flowchart TD" && header !== "sequenceDiagram") {
    errors.push(`${label}: Mermaid-blok moet beginnen met flowchart TD of sequenceDiagram.`);
  }
  if (lines.length < 3) errors.push(`${label}: Mermaid-blok is te leeg om een proces te beschrijven.`);
  if (header === "flowchart TD" && !block.includes("-->")) {
    errors.push(`${label}: flowchart bevat geen procesverbindingen.`);
  }
  if (header === "sequenceDiagram" && !/--?>?>/.test(block)) {
    errors.push(`${label}: sequenceDiagram bevat geen berichten.`);
  }
  if (/\b(click|classDef|style|linkStyle)\b/.test(block) || /<\/?[A-Za-z]/.test(block)) {
    errors.push(`${label}: styling, click-directives en HTML zijn niet toegestaan.`);
  }
  for (const [open, close] of [["[", "]"], ["{", "}"], ["(", ")"]] as const) {
    const opening = [...block].filter((character) => character === open).length;
    const closing = [...block].filter((character) => character === close).length;
    if (opening !== closing) errors.push(`${label}: ongebalanceerde ${open}${close} in Mermaid-code.`);
  }
  return errors;
}

export function findReferencedRepoFiles(content: string) {
  const candidates = new Set<string>();
  for (const match of content.matchAll(/`((?:apps|src|scripts|docs|tests)\/[^`\n]+)`/g)) {
    const candidate = match[1].replace(/:[0-9]+$/, "");
    if (!candidate.includes("<") && !candidate.includes("*")) candidates.add(candidate);
  }
  return [...candidates].sort();
}

export function buildProcessIndex(tools = readActivePublicTools()) {
  const rows = tools.map((tool) => {
    const { metadata, content } = readProcessDocument(tool.processPath);
    const diagrams = [
      ["Gebruiker", extractMermaidBlocks(sectionContent(content, "2. Gebruikersproces")).length],
      ["Beslissingen", extractMermaidBlocks(sectionContent(content, "3. Beslisproces")).length],
      ["Berekening", extractMermaidBlocks(sectionContent(content, "4. Rekenproces")).length],
      ["Gegevensstroom", extractMermaidBlocks(sectionContent(content, "5. Gegevensstroom en koppelingen")).length],
    ].filter(([, count]) => Number(count) > 0).map(([name]) => name).join(", ");
    return `| ${metadata.title} | \`${tool.route}\` | [PROCESS.md](../../${tool.processPath}) | ${metadata.lastReviewed} | ${diagrams} |`;
  });

  return `# Procesdocumentatie publieke rekentools

Deze index beschrijft de actuele gebruikers-, beslis-, reken- en gegevensprocessen van alle publieke rekentools. De inhoud wordt tegen functionele bronbestanden gecontroleerd met een bronvingerafdruk; de tabel hieronder wordt gegenereerd uit dezelfde appmanifests die de publieke registry voeden.

## Definitie actief en publiek

Een tool valt in deze index wanneer het manifest onder \`apps/<slug>/app.json\` zowel \`enabled: true\` als \`visibility: "public"\` bevat. De registrygenerator gebruikt dezelfde selectie voor registry, lazy component-map en statische routes. Productstatus \`active\` of \`beta\` verandert deze technische publicatieregel niet.

## Actuele inventaris

| Tool | Publieke route | Procesdocument | Laatst gecontroleerd | Procesplaten |
| --- | --- | --- | --- | --- |
${rows.join("\n")}

Aantal actieve publieke tools: **${tools.length}**. Aantal vereiste procesdocumenten: **${tools.length}**.

## Publicatie op toolpagina's

De eerste \`flowchart TD\` uit het gebruikersproces, beslisproces en rekenproces wordt tijdens de statische websitebuild gepubliceerd onder **Wil je weten hoe deze tool werkt?**. De gedeelde procesgids leest rechtstreeks uit \`PROCESS.md\`; \`npm run process:check\` valideert daarom ook dat deze drie platen door de publieke stap-voor-stapweergave kunnen worden verwerkt.

## Actualiseren en valideren

1. Controleer bij een functionele wijziging de volledige bronketen en pas de bijbehorende \`PROCESS.md\` aan als gedrag, invoer, beslissingen, berekening, resultaten of overdracht wijzigt.
2. Vernieuw pas daarna de gecontroleerde vingerafdruk met \`npm run process:update -- --tool <tool-id> --reviewed\`.
3. Genereer deze index zo nodig met \`npm run process:index\`.
4. Draai \`npm run process:check\`. De controle faalt bij ontbrekende documenten, route- of ID-afwijkingen, ontbrekende secties, ongeldige Mermaid-basisstructuur, ontbrekende bronbestanden, een verouderde hash of een niet-actuele index.

De updateopdracht bevestigt alleen administratief dat een mens of agent de inhoud heeft herbeoordeeld; de vlag \`--reviewed\` mag niet worden gebruikt om uitsluitend een rode hashcontrole te omzeilen.

De vingerafdruk gebruikt de exacte inhoud van uitsluitend de expliciete functionele bronbestanden in de frontmatter. Dat is bewust conservatief: een formattingwijziging in zo'n bestand kan extra review vragen, maar een gedragswijziging kan niet worden gemist door een onbetrouwbare poging om semantische en cosmetische TypeScript-wijzigingen automatisch te onderscheiden.

## Afwijkingen

- \`FUNCTIONALITY_STATUS.md\` en de gegenereerde registry noemen beide tien publieke tools; de manifest- en routegeneratie is doorslaggevend.
- \`familiehulp-eerste-woning\` heeft publieke manifestmetadata maar \`enabled: false\` en is daarom terecht niet opgenomen.
- De Mermaid-validatie gebruikt bewust de projectsubset \`flowchart TD\` en \`sequenceDiagram\`. Zonder een zware browser-/Mermaid-CLI-dependency controleert zij structuur, verbindingen, verboden syntax en gebalanceerde delimiters; rendering blijft aanvullend onderdeel van review.
`;
}
