import { ToolActionLinkButton } from "@/components/tool/ToolActionButton";

type ToolNextStep = {
  href: string;
  label: string;
};

type ToolNextStepsProps = {
  title: string;
  description: string;
  primary: ToolNextStep;
  secondary?: ToolNextStep[];
};

export function ToolNextSteps({
  title,
  description,
  primary,
  secondary = [],
}: ToolNextStepsProps) {
  return (
    <aside
      aria-label="Volgende stappen"
      className="rounded-[1.25rem] border border-[var(--hair)] bg-[var(--paper-soft)] p-5"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--soft)]">
        Volgende stap
      </p>
      <h2 className="mt-2 font-serif text-[22px] tracking-[-0.02em] text-[var(--ink)]">
        {title}
      </h2>
      <p className="mt-2 max-w-[58ch] text-[13.5px] leading-[1.65] text-[var(--muted)]">
        {description}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <ToolActionLinkButton href={primary.href} variant="accent" size="md">
          {primary.label}
        </ToolActionLinkButton>
        {secondary.map((action) => (
          <ToolActionLinkButton
            key={action.href}
            href={action.href}
            variant="secondary"
            size="md"
          >
            {action.label}
          </ToolActionLinkButton>
        ))}
      </div>
    </aside>
  );
}
