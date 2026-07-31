export type ToolProcessNode = {
  id: string;
  label: string;
  kind: "step" | "decision";
};

export type ToolProcessEdge = {
  from: string;
  to: string;
  label?: string;
};

export type ToolProcessGraph = {
  id: "user" | "decision" | "calculation";
  title: string;
  description: string;
  startNodeId: string;
  nodes: ToolProcessNode[];
  edges: ToolProcessEdge[];
};

export type PublishedToolProcess = {
  graphs: ToolProcessGraph[];
};

type ParsedNodeReference = {
  id: string;
  label?: string;
  kind?: ToolProcessNode["kind"];
};

function parseNodeReference(value: string): ParsedNodeReference {
  const reference = value.trim();
  const match = /^([A-Za-z][A-Za-z0-9_-]*)(?:\[(.*)\]|\{(.*)\}|\((.*)\))?$/.exec(
    reference,
  );

  if (!match) {
    throw new Error(`Niet-ondersteunde Mermaid-node: ${reference}`);
  }

  const [, id, stepLabel, decisionLabel, roundedLabel] = match;
  const label = stepLabel ?? decisionLabel ?? roundedLabel;

  return {
    id,
    label: label?.trim(),
    kind: decisionLabel !== undefined ? "decision" : label !== undefined ? "step" : undefined,
  };
}

function parseEdge(line: string) {
  const pipeLabel = /^(.+?)\s+-->\|(.+?)\|\s+(.+)$/.exec(line);
  if (pipeLabel) {
    return {
      from: parseNodeReference(pipeLabel[1]),
      to: parseNodeReference(pipeLabel[3]),
      label: pipeLabel[2].trim(),
    };
  }

  const spacedLabel = /^(.+?)\s+--\s+(.+?)\s+-->\s+(.+)$/.exec(line);
  if (spacedLabel) {
    return {
      from: parseNodeReference(spacedLabel[1]),
      to: parseNodeReference(spacedLabel[3]),
      label: spacedLabel[2].trim(),
    };
  }

  const unlabelled = /^(.+?)\s+-->\s+(.+)$/.exec(line);
  if (unlabelled) {
    return {
      from: parseNodeReference(unlabelled[1]),
      to: parseNodeReference(unlabelled[2]),
      label: undefined,
    };
  }

  throw new Error(`Niet-ondersteunde Mermaid-verbinding: ${line}`);
}

export function parseToolProcessFlowchart(
  source: string,
  metadata: Pick<ToolProcessGraph, "id" | "title" | "description">,
): ToolProcessGraph {
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines[0] !== "flowchart TD") {
    throw new Error(`${metadata.title}: alleen flowchart TD kan publiek worden weergegeven.`);
  }

  const nodesById = new Map<string, ToolProcessNode>();
  const edges: ToolProcessEdge[] = [];

  function registerNode(reference: ParsedNodeReference) {
    const existing = nodesById.get(reference.id);
    const label = reference.label ?? existing?.label;
    const kind = reference.kind ?? existing?.kind;

    if (!label || !kind) {
      if (!existing) {
        nodesById.set(reference.id, {
          id: reference.id,
          label: reference.id,
          kind: "step",
        });
      }
      return;
    }

    nodesById.set(reference.id, { id: reference.id, label, kind });
  }

  for (const line of lines.slice(1)) {
    const edge = parseEdge(line.replace(/;$/, ""));
    registerNode(edge.from);
    registerNode(edge.to);
    edges.push({ from: edge.from.id, to: edge.to.id, label: edge.label });
  }

  if (edges.length === 0 || nodesById.size < 2) {
    throw new Error(`${metadata.title}: het publieke proces bevat te weinig stappen.`);
  }

  for (const node of nodesById.values()) {
    if (node.label === node.id) {
      throw new Error(`${metadata.title}: node ${node.id} heeft geen begrijpelijk label.`);
    }
  }

  return {
    ...metadata,
    startNodeId: edges[0].from,
    nodes: [...nodesById.values()],
    edges,
  };
}

export function extractMarkdownSection(content: string, heading: string) {
  const lines = content.split(/\r?\n/);
  const headingLine = `## ${heading}`;
  const start = lines.findIndex((line) => line.trimEnd() === headingLine);
  if (start < 0) return "";

  const endOffset = lines.slice(start + 1).findIndex((line) => line.startsWith("## "));
  const end = endOffset < 0 ? lines.length : start + 1 + endOffset;
  return lines.slice(start + 1, end).join("\n");
}

export function extractMermaidBlocks(section: string) {
  return [...section.matchAll(/```mermaid\s*\n([\s\S]*?)```/g)].map((match) =>
    match[1].trim(),
  );
}

const publishedGraphDefinitions = [
  {
    id: "user",
    title: "Jouw route door de tool",
    description: "Volg de invoer, controle en uitkomst zoals je die zelf doorloopt.",
    heading: "2. Gebruikersproces",
  },
  {
    id: "decision",
    title: "Keuzes en uitzonderingen",
    description: "Bekijk welke antwoorden bepalen welk pad de tool kiest.",
    heading: "3. Beslisproces",
  },
  {
    id: "calculation",
    title: "Zo ontstaat de berekening",
    description: "Volg hoe de gevalideerde invoer wordt omgezet in de uitkomst.",
    heading: "4. Rekenproces",
  },
] as const;

export function parsePublishedToolProcess(content: string): PublishedToolProcess {
  return {
    graphs: publishedGraphDefinitions.map(({ heading, ...metadata }) => {
      const block = extractMermaidBlocks(extractMarkdownSection(content, heading))[0];
      if (!block) {
        throw new Error(`${heading}: Mermaid-flowchart ontbreekt.`);
      }
      return parseToolProcessFlowchart(block, metadata);
    }),
  };
}
