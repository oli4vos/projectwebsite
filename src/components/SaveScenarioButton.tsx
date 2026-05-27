"use client";

import { useMemo, useState } from "react";
import { useSavedCalculations } from "@/hooks/useSavedCalculations";
import { ENABLE_SAVED_CALCULATIONS } from "@/lib/feature-flags";
import { ToolActionButton } from "@/components/tool/ToolActionButton";

export type SaveScenarioButtonProps = {
  toolSlug: string;
  defaultTitle?: string;
  input: unknown;
  result?: unknown;
  disabled?: boolean;
  disabledReason?: string;
};

function getScenarioTitle(defaultTitle?: string) {
  const trimmed = defaultTitle?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "Opgeslagen scenario";
}

export function SaveScenarioButton({
  toolSlug,
  defaultTitle,
  input,
  result,
  disabled = false,
  disabledReason = "Bereken eerst een scenario.",
}: SaveScenarioButtonProps) {
  const { saveCalculation } = useSavedCalculations();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const title = useMemo(() => getScenarioTitle(defaultTitle), [defaultTitle]);

  if (!ENABLE_SAVED_CALCULATIONS) {
    return null;
  }

  function handleSaveScenario() {
    const saveResult = saveCalculation({
      toolSlug,
      title,
      input,
      result,
    });

    if (saveResult.error) {
      setStatusMessage("Opslaan is niet gelukt.");
      return;
    }

    setStatusMessage("Scenario opgeslagen.");
  }

  return (
    <div className="space-y-2">
      <ToolActionButton
        type="button"
        onClick={handleSaveScenario}
        disabled={disabled}
        variant="secondary"
        size="sm"
      >
        Scenario opslaan
      </ToolActionButton>
      {disabled ? (
        <p className="text-[12.5px] text-[var(--muted)]">{disabledReason}</p>
      ) : null}
      {statusMessage ? (
        <p className="text-[12.5px] text-[var(--muted)]">{statusMessage}</p>
      ) : null}
    </div>
  );
}

