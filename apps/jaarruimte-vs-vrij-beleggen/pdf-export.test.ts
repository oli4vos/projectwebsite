import { describe, expect, it } from "vitest";
import { escapeHtml } from "./pdf-export";

describe("PDF export helpers", () => {
  it("escapes HTML-sensitive characters before interpolation", () => {
    expect(escapeHtml(`<script data-x="&">'</script>`)).toBe(
      "&lt;script data-x=&quot;&amp;&quot;&gt;&#39;&lt;/script&gt;",
    );
  });

  it("escapes numeric values through the same path as strings", () => {
    expect(escapeHtml(2026)).toBe("2026");
  });
});
