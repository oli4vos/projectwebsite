import { describe, expect, it } from "vitest";
import {
  calculateSourceHash,
  parseProcessDocument,
  readActivePublicTools,
  sectionContent,
  validateMermaidBlock,
} from "../../scripts/process-docs-lib";
import { appRegistry } from "./app-registry";

describe("process documentation contract", () => {
  it("uses the same active public tools as the generated registry", () => {
    const documentedToolIds = readActivePublicTools().map((tool) => tool.slug);
    const registryToolIds = appRegistry.map((tool) => tool.slug).sort();

    expect(documentedToolIds).toEqual(registryToolIds);
    expect(new Set(documentedToolIds).size).toBe(documentedToolIds.length);
  });

  it("parses frontmatter and isolates a requested section", () => {
    const content = `---
tool: voorbeeld
title: Voorbeeld
route: /apps/voorbeeld
status: active-public
lastReviewed: 2026-07-31
sourceHash: sha256:test
sources:
  - apps/voorbeeld/app.json
---

## 2. Gebruikersproces

\`\`\`mermaid
flowchart TD
  A[Start] --> B[Einde]
\`\`\`

## 3. Beslisproces

Andere inhoud.
`;

    expect(parseProcessDocument(content, "PROCESS.md").sources).toEqual([
      "apps/voorbeeld/app.json",
    ]);
    expect(sectionContent(content, "2. Gebruikersproces")).toContain("flowchart TD");
    expect(sectionContent(content, "2. Gebruikersproces")).not.toContain("Andere inhoud");
  });

  it("produces a stable hash independent of source order", () => {
    const sources = ["package.json", "src/lib/app-registry.ts"];

    expect(calculateSourceHash(sources)).toBe(calculateSourceHash([...sources].reverse()));
    expect(calculateSourceHash(sources)).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("accepts the supported Mermaid subset and rejects forbidden directives", () => {
    expect(
      validateMermaidBlock("flowchart TD\nA[Start] --> B[Controle]\nB --> C[Einde]", "goed"),
    ).toEqual([]);
    expect(
      validateMermaidBlock(
        "flowchart TD\nA[Start] --> B[Einde]\nclick A https://example.com",
        "fout",
      ),
    ).toContain("fout: styling, click-directives en HTML zijn niet toegestaan.");
  });
});
