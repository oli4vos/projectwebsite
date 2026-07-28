"use client";

import type { MouseEvent } from "react";
import { ToolActionLinkButton } from "@/components/tool/ToolActionButton";
import {
  createToolHandoff,
  getToolHandoffUrl,
} from "@/lib/tool-handoff";
import type { UserProfile } from "@/lib/user-profile";

type ToolNextStep = {
  href: string;
  label: string;
};

type ToolNextStepsProps = {
  title: string;
  description: string;
  primary: ToolNextStep;
  secondary?: ToolNextStep[];
  handoff?: {
    sourceTool: string;
    profilePatch: Partial<UserProfile>;
    fieldLabels: string[];
  };
};

export function ToolNextSteps({
  title,
  description,
  primary,
  secondary = [],
  handoff,
}: ToolNextStepsProps) {
  function handleNavigation(
    event: MouseEvent<HTMLAnchorElement>,
    action: ToolNextStep,
  ) {
    if (
      !handoff ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const targetTool = /^\/apps\/([^/?#]+)/.exec(action.href)?.[1];
    if (!targetTool) {
      return;
    }

    const transfer = createToolHandoff({
      ...handoff,
      targetTool,
    });
    if (!transfer.ok) {
      return;
    }

    event.preventDefault();
    window.location.assign(
      getToolHandoffUrl(action.href, transfer.data.transferId),
    );
  }

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
        <ToolActionLinkButton
          href={primary.href}
          variant="accent"
          size="md"
          onClick={(event) => handleNavigation(event, primary)}
        >
          {primary.label}
        </ToolActionLinkButton>
      </div>
      {secondary.length > 0 ? (
        <details className="mt-4 border-t border-[var(--hair)] pt-3">
          <summary className="cursor-pointer text-[13px] font-medium text-[var(--ink)]">
            Meer mogelijkheden
          </summary>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {secondary.map((action) => (
              <ToolActionLinkButton
                key={action.href}
                href={action.href}
                variant="secondary"
                size="md"
                onClick={(event) => handleNavigation(event, action)}
              >
                {action.label}
              </ToolActionLinkButton>
            ))}
          </div>
        </details>
      ) : null}
    </aside>
  );
}
