import { MORTGAGE_RATE_EXTERNAL_REFERENCE_LINK } from "@/lib/mortgage/external-rate-links";

type MortgageRateReferenceLinkProps = {
  compact?: boolean;
};

export function MortgageRateReferenceLink({
  compact = false,
}: MortgageRateReferenceLinkProps) {
  const link = MORTGAGE_RATE_EXTERNAL_REFERENCE_LINK;

  return (
    <div
      className={
        compact
          ? "rounded-lg border border-[var(--hair)] bg-[var(--paper-soft)] px-3 py-2 text-[12px] leading-5 text-[var(--muted)]"
          : "rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4 text-[13px] leading-6 text-[var(--muted)]"
      }
    >
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="ring-focus inline-flex min-h-11 items-center font-medium text-[var(--accent)] underline-offset-4 hover:underline"
        aria-label={`${link.label} via ${link.sourceName}, opent in een nieuw tabblad`}
      >
        {link.label}
        <span className="ml-1 text-[11px] text-[var(--muted)]">(extern)</span>
      </a>
      <p className={compact ? "mt-1" : "mt-2"}>{link.explanation}</p>
    </div>
  );
}
