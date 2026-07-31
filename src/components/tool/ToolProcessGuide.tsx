"use client";

import { useState } from "react";
import type {
  PublishedToolProcess,
  ToolProcessEdge,
  ToolProcessGraph,
} from "@/lib/tool-process";

type ToolProcessGuideProps = {
  process: PublishedToolProcess;
};

function FullProcessOverview({ graph }: { graph: ToolProcessGraph }) {
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));

  return (
    <details className="mt-6 border-t border-[var(--hair)] pt-5">
      <summary className="ring-focus cursor-pointer text-[14px] font-semibold text-[var(--ink)]">
        Bekijk het volledige stroomschema
      </summary>
      <ol className="mt-5 grid gap-0" aria-label={graph.title}>
        {graph.nodes.map((node, index) => {
          const outgoing = graph.edges.filter((edge) => edge.from === node.id);
          return (
            <li key={node.id} className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 pb-5">
              {index < graph.nodes.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-[0.94rem] top-8 w-px bg-[var(--accent-line)]"
                />
              ) : null}
              <span
                className={`relative z-10 flex size-8 items-center justify-center border text-[12px] font-semibold ${
                  node.kind === "decision"
                    ? "rotate-45 border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "rounded-full border-[var(--hair-2)] bg-white"
                }`}
                aria-hidden="true"
              >
                <span className={node.kind === "decision" ? "-rotate-45" : undefined}>
                  {index + 1}
                </span>
              </span>
              <div className="min-w-0 pt-1">
                <p className="text-[14px] font-medium leading-6 text-[var(--ink)]">{node.label}</p>
                {outgoing.length > 1 || outgoing.some((edge) => edge.label) ? (
                  <ul className="mt-2 flex flex-wrap gap-2 text-[12px] text-[var(--muted)]">
                    {outgoing.map((edge) => (
                      <li
                        key={`${edge.from}-${edge.label ?? "volgende"}-${edge.to}`}
                        className="rounded-md border border-[var(--hair)] bg-[var(--paper-soft)] px-2.5 py-1"
                      >
                        {edge.label ? `${edge.label}: ` : "Daarna: "}
                        {nodesById.get(edge.to)?.label ?? edge.to}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </details>
  );
}

function GuidedGraph({ graph }: { graph: ToolProcessGraph }) {
  const [currentNodeId, setCurrentNodeId] = useState(graph.startNodeId);
  const [history, setHistory] = useState<string[]>([]);
  const currentNode = graph.nodes.find((node) => node.id === currentNodeId) ?? graph.nodes[0];
  const outgoing = graph.edges.filter((edge) => edge.from === currentNode.id);

  function advance(edge: ToolProcessEdge) {
    setHistory((current) => [...current, currentNode.id]);
    setCurrentNodeId(edge.to);
  }

  function goBack() {
    setHistory((current) => {
      const previous = current.at(-1);
      if (!previous) return current;
      setCurrentNodeId(previous);
      return current.slice(0, -1);
    });
  }

  function restart() {
    setCurrentNodeId(graph.startNodeId);
    setHistory([]);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4 text-[12px] text-[var(--muted)]">
        <span>Stap {history.length + 1}</span>
        <span>{currentNode.kind === "decision" ? "Keuzemoment" : "Processtap"}</span>
      </div>

      <div className="min-h-48 rounded-lg border border-[var(--hair)] bg-white p-5 sm:p-6" aria-live="polite">
        <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--muted)]">
          {currentNode.kind === "decision" ? "Wat geldt voor jou?" : "Dit gebeurt er"}
        </p>
        <p className="mt-3 max-w-3xl text-[18px] font-semibold leading-7 text-[var(--ink)]">
          {currentNode.label}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {outgoing.length === 0 ? (
            <button
              type="button"
              onClick={restart}
              className="ring-focus min-h-11 rounded-md bg-[var(--deep)] px-4 py-2 text-[13px] font-semibold text-[var(--button-text-on-dark)]"
            >
              Opnieuw doorlopen
            </button>
          ) : outgoing.length === 1 && !outgoing[0].label ? (
            <button
              type="button"
              onClick={() => advance(outgoing[0])}
              className="ring-focus min-h-11 rounded-md bg-[var(--deep)] px-4 py-2 text-[13px] font-semibold text-[var(--button-text-on-dark)]"
            >
              Volgende →
            </button>
          ) : (
            outgoing.map((edge) => (
              <button
                key={`${edge.label ?? "volgende"}-${edge.to}`}
                type="button"
                onClick={() => advance(edge)}
                className="ring-focus min-h-11 rounded-md border border-[var(--hair-2)] bg-white px-4 py-2 text-left text-[13px] font-semibold text-[var(--ink)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
              >
                {edge.label ?? graph.nodes.find((node) => node.id === edge.to)?.label ?? "Volgende"} →
              </button>
            ))
          )}
          {history.length > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="ring-focus min-h-11 rounded-md px-3 py-2 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--ink)]"
            >
              ← Vorige
            </button>
          ) : null}
        </div>
      </div>

      <FullProcessOverview graph={graph} />
    </div>
  );
}

export function ToolProcessGuide({ process }: ToolProcessGuideProps) {
  const [activeGraphId, setActiveGraphId] = useState(process.graphs[0].id);
  const activeGraph =
    process.graphs.find((graph) => graph.id === activeGraphId) ?? process.graphs[0];

  return (
    <details className="group border-y border-[var(--hair)] bg-white/45">
      <summary className="ring-focus flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-[18px] font-semibold text-[var(--ink)]">
            Wil je weten hoe deze tool werkt?
          </span>
          <span className="mt-1 block text-[13px] leading-5 text-[var(--muted)]">
            Doorloop de gebruikersroute, beslissingen en berekening stap voor stap.
          </span>
        </span>
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--hair-2)] bg-white text-xl transition group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="border-t border-[var(--hair)] py-6 sm:py-8">
        <div className="grid gap-3 sm:grid-cols-3" role="tablist" aria-label="Procesweergave">
          {process.graphs.map((graph) => {
            const selected = graph.id === activeGraph.id;
            return (
              <button
                key={graph.id}
                type="button"
                role="tab"
                id={`tool-process-tab-${graph.id}`}
                aria-controls={`tool-process-panel-${graph.id}`}
                aria-selected={selected}
                onClick={() => setActiveGraphId(graph.id)}
                className={`ring-focus min-h-12 rounded-md border px-4 py-3 text-left text-[13px] font-semibold transition ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]"
                    : "border-[var(--hair)] bg-white text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {graph.title}
              </button>
            );
          })}
        </div>

        <div
          className="mt-6"
          role="tabpanel"
          id={`tool-process-panel-${activeGraph.id}`}
          aria-labelledby={`tool-process-tab-${activeGraph.id}`}
        >
          <h2 className="text-[20px] font-semibold text-[var(--ink)]">{activeGraph.title}</h2>
          <p className="mt-1 max-w-3xl text-[14px] leading-6 text-[var(--muted)]">
            {activeGraph.description}
          </p>
          <div className="mt-5" key={activeGraph.id}>
            <GuidedGraph graph={activeGraph} />
          </div>
        </div>
      </div>
    </details>
  );
}
