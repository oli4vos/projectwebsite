type ToolDisclosureProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function ToolDisclosure({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: ToolDisclosureProps) {
  return (
    <details
      open={defaultOpen}
      className="rounded-[1.5rem] border hair bg-white shadow-paper"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 marker:content-none">
        <div className="min-w-0">
          <h3 className="font-serif text-[clamp(1.1rem,1rem+0.5vw,1.35rem)] tracking-[-0.02em] text-[var(--ink)]">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-[13px] leading-[1.55] text-[var(--muted)]">
              {subtitle}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-[12px] text-[var(--soft)]">
          Open / sluit
        </span>
      </summary>
      <div className="hair-t px-5 pb-5 pt-4">{children}</div>
    </details>
  );
}
