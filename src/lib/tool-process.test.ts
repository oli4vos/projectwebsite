import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { appRegistry } from "./app-registry";
import {
  parsePublishedToolProcess,
  parseToolProcessFlowchart,
} from "./tool-process";

describe("public tool process parser", () => {
  it("parses labelled Mermaid branches in both supported notations", () => {
    const graph = parseToolProcessFlowchart(
      `flowchart TD
        A[Start] --> B{Gegevens bekend?}
        B -->|Ja| C[Bereken]
        B -- Nee --> D[Herstel invoer]`,
      { id: "user", title: "Route", description: "Test" },
    );

    expect(graph.startNodeId).toBe("A");
    expect(graph.nodes.find((node) => node.id === "B")?.kind).toBe("decision");
    expect(graph.edges.map((edge) => edge.label)).toEqual([undefined, "Ja", "Nee"]);
  });

  it("rejects nodes without a user-facing label", () => {
    expect(() =>
      parseToolProcessFlowchart("flowchart TD\nA --> B\nB --> C[Einde]", {
        id: "user",
        title: "Route",
        description: "Test",
      }),
    ).toThrow("node A heeft geen begrijpelijk label");
  });

  it("builds all three published graphs for every public tool", () => {
    for (const app of appRegistry) {
      const content = readFileSync(`apps/${app.slug}/PROCESS.md`, "utf8");
      const process = parsePublishedToolProcess(content);

      expect(process.graphs.map((graph) => graph.id), app.slug).toEqual([
        "user",
        "decision",
        "calculation",
      ]);
      expect(process.graphs.every((graph) => graph.nodes.length >= 2), app.slug).toBe(true);
    }
  });
});
