import {
  findGlossaryMatches,
  getGlossaryEntry,
} from "@/lib/copy-glossary";
import type { ReactNode } from "react";

type GlossaryTextProps = {
  text: string;
  className?: string;
};

function GlossaryInlineTerm({
  text,
  explanation,
}: {
  text: string;
  explanation: string;
}) {
  return (
    <span className="group relative inline-flex align-baseline">
      <button
        type="button"
        className="rounded-sm border-b border-dotted border-[var(--accent)] text-inherit decoration-[var(--accent)] underline-offset-2 transition hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
        aria-label={`${text}: ${explanation}`}
      >
        {text}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-[min(18rem,80vw)] -translate-x-1/2 rounded-xl border border-[var(--hair)] bg-white px-3 py-2 text-left text-[12px] leading-[1.5] text-[var(--ink-2)] shadow-paper group-hover:block group-focus-within:block"
      >
        {explanation}
      </span>
    </span>
  );
}

export function GlossaryText({ text, className }: GlossaryTextProps) {
  const matches = findGlossaryMatches(text);

  if (matches.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.start > cursor) {
      nodes.push(text.slice(cursor, match.start));
    }

    const entry = getGlossaryEntry(match.term);
    nodes.push(
      <GlossaryInlineTerm
        key={`${match.term}-${match.start}`}
        text={match.text}
        explanation={entry.explanation}
      />,
    );
    cursor = match.end;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return <span className={className}>{nodes}</span>;
}
