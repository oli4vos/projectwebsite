"use client";

import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import {
  formatDuoRateYearLabel,
  getAvailableDuoRateYears,
} from "@/lib/financial-constants";
import type {
  DuoDebtPartFieldErrors,
  DuoDebtPartFormValue,
} from "@/lib/duo/debt-parts-form";
import type { RepaymentRuleKey } from "@/lib/financial-constants";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

type DuoDebtPartsEditorProps = {
  enabled: boolean;
  parts: DuoDebtPartFormValue[];
  totalDebt: number;
  errorsById: Record<string, DuoDebtPartFieldErrors>;
  repaymentRule?: RepaymentRuleKey;
  onToggle: (enabled: boolean) => void;
  onPartChange: (
    id: string,
    field: keyof Pick<DuoDebtPartFormValue, "amount" | "rateYear">,
    value: string,
  ) => void;
  onAddPart: () => void;
  onRemovePart: (id: string) => void;
};

export function DuoDebtPartsEditor({
  enabled,
  parts,
  totalDebt,
  errorsById,
  repaymentRule = "UNKNOWN",
  onToggle,
  onPartChange,
  onAddPart,
  onRemovePart,
}: DuoDebtPartsEditorProps) {
  const availableRateYears = getAvailableDuoRateYears();

  return (
    <DisclosureSection
      title="Verdieping: rentejaar en leningdelen"
      subtitle="Gebruik dit alleen als je schuld uit delen met verschillende DUO-rentejaren bestaat."
    >
      <div className="space-y-4">
        <label className="flex items-start gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => onToggle(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[var(--hair)] text-[var(--deep)]"
          />
          <span className="space-y-1">
            <span className="block text-[14px] font-medium text-[var(--ink)]">
              Mijn schuld bestaat uit meerdere leningdelen
            </span>
            <span className="block text-[12px] leading-[1.55] text-[var(--muted)]">
              Per leningdeel kies je een rentejaar uit de laatste 5 jaar. De tool
              telt de annuïtaire DUO-bedragen per deel op. Extra aflossen gaat dan
              eerst naar het deel met de hoogste rente.
            </span>
          </span>
        </label>

        {enabled ? (
          <div className="space-y-3">
            {parts.map((part, index) => {
              const errors = errorsById[part.id] ?? {};

              return (
                <div
                  key={part.id}
                  className="rounded-xl border border-[var(--hair)] bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
                      Leningdeel {index + 1}
                    </div>
                    {parts.length > 1 ? (
                      <ToolActionButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onRemovePart(part.id)}
                      >
                        Verwijder
                      </ToolActionButton>
                    ) : null}
                  </div>

                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2" htmlFor={`${part.id}-amount`}>
                      <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                        Openstaande schuld
                      </span>
                      <span className="hair flex min-h-12 items-center rounded-md border bg-white px-3">
                        <span className="mr-2 text-[var(--muted)]">€</span>
                        <input
                          id={`${part.id}-amount`}
                          inputMode="decimal"
                          value={part.amount}
                          onChange={(event) =>
                            onPartChange(part.id, "amount", event.target.value)
                          }
                          className="ring-focus min-w-0 flex-1 bg-transparent font-mono text-[15px] tabular outline-none"
                          aria-invalid={errors.amount ? "true" : "false"}
                          aria-describedby={
                            errors.amount ? `${part.id}-amount-error` : undefined
                          }
                        />
                      </span>
                      <FieldError id={`${part.id}-amount-error`} message={errors.amount} />
                    </label>

                    <label className="grid gap-2" htmlFor={`${part.id}-rateYear`}>
                      <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                        DUO-rentejaar
                      </span>
                      <select
                        id={`${part.id}-rateYear`}
                        value={part.rateYear}
                        onChange={(event) =>
                          onPartChange(part.id, "rateYear", event.target.value)
                        }
                        className="ring-focus hair h-12 rounded-md border bg-white px-3 text-[15px] text-[var(--ink)] outline-none"
                        aria-invalid={errors.rateYear ? "true" : "false"}
                        aria-describedby={
                          errors.rateYear ? `${part.id}-rateYear-error` : undefined
                        }
                      >
                        {availableRateYears.map((year) => (
                          <option key={year} value={year}>
                            {formatDuoRateYearLabel(year, repaymentRule)}
                          </option>
                        ))}
                      </select>
                      <FieldError id={`${part.id}-rateYear-error`} message={errors.rateYear} />
                    </label>
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap items-center gap-3">
              <ToolActionButton type="button" onClick={onAddPart} variant="secondary">
                Voeg leningdeel toe
              </ToolActionButton>
              <span className="text-[12px] leading-[1.55] text-[var(--muted)]">
                Totale schuld uit leningdelen: <strong className="text-[var(--ink)]">{formatCurrency(totalDebt)}</strong>
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </DisclosureSection>
  );
}
