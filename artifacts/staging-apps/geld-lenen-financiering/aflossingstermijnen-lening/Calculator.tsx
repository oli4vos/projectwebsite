"use client";

import { useState } from "react";
import { calculateAflossingstermijnenLening } from "./logic";

const DEFAULT_INPUT = '{\n  "principal": 100000,\n  "annualRate": 5,\n  "years": 30\n}';
const TOOL_TITLE = "Aflossingstermijnen lening";

export default function Calculator() {
  const [rawInput, setRawInput] = useState(DEFAULT_INPUT);
  const [output, setOutput] = useState<ReturnType<typeof calculateAflossingstermijnenLening> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "24px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>{TOOL_TITLE}</h1>
      <p style={{ color: "#555", marginBottom: "16px" }}>
        Artifact staging calculator. Nog niet live, wel direct uitvoerbaar.
      </p>
      <label htmlFor="json-input" style={{ display: "block", marginBottom: "8px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        JSON input
      </label>
      <textarea
        id="json-input"
        value={rawInput}
        onChange={(event) => setRawInput(event.target.value)}
        rows={14}
        style={{ width: "100%", border: "1px solid #ddd", borderRadius: "8px", padding: "12px", marginBottom: "12px" }}
      />
      <button
        type="button"
        onClick={() => {
          setParseError(null);
          try {
            const parsed = JSON.parse(rawInput) as Record<string, unknown>;
            setOutput(calculateAflossingstermijnenLening(parsed));
          } catch {
            setOutput(null);
            setParseError("De JSON-invoer is ongeldig.");
          }
        }}
        style={{ border: "1px solid #111", borderRadius: "999px", padding: "10px 18px", background: "#111", color: "#fff", cursor: "pointer" }}
      >
        Bereken
      </button>
      {parseError ? <p style={{ color: "#b00020", marginTop: "12px" }}>{parseError}</p> : null}
      <section style={{ marginTop: "20px" }}>
        <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>Resultaat</h2>
        <pre style={{ whiteSpace: "pre-wrap", border: "1px solid #ddd", borderRadius: "8px", padding: "12px", background: "#fafafa" }}>
          {JSON.stringify(output, null, 2)}
        </pre>
      </section>
    </main>
  );
}
