"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { ResultCard } from "@/components/ResultCard";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { ToolNextSteps } from "@/components/tool/ToolNextSteps";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { getToolNextSteps } from "@/lib/tool-journeys";
import {
  createAdditionalGrantView,
  defaultValues,
  emptyValues,
  validateAdditionalGrantForm,
  type AdditionalGrantFormValues,
} from "./logic";

type FieldProps = {
  id: keyof AdditionalGrantFormValues;
  label: string;
  value: string;
  error?: string;
  prefix?: string;
  hint?: string;
  inputMode?: "decimal" | "numeric" | "text";
  onChange: (value: string) => void;
};

function FieldShell({ children }: { children: ReactNode }) {
  return <div className="grid gap-2">{children}</div>;
}

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]"
    >
      {children}
    </label>
  );
}

function MoneyField({
  id,
  label,
  value,
  error,
  prefix = "€",
  hint,
  inputMode = "decimal",
  onChange,
}: FieldProps) {
  const errorId = `${String(id)}-error`;
  const hintId = `${String(id)}-hint`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <FieldShell>
      <Label htmlFor={String(id)}>{label}</Label>
      <span className="field-shell flex min-h-12 items-center px-3">
        {prefix ? <span className="mr-2 text-[var(--muted)]">{prefix}</span> : null}
        <input
          id={String(id)}
          value={value}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className="ring-focus min-w-0 flex-1 bg-transparent font-mono text-[15px] tabular outline-none"
        />
      </span>
      {hint ? (
        <p id={hintId} className="text-[12px] leading-[1.5] text-[var(--soft)]">
          {hint}
        </p>
      ) : null}
      <div id={errorId}>
        <FieldError message={error} />
      </div>
    </FieldShell>
  );
}

function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  error,
  hint,
  onChange,
}: {
  id: keyof AdditionalGrantFormValues;
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  error?: string;
  hint?: string;
  onChange: (value: T) => void;
}) {
  const errorId = `${String(id)}-error`;
  const hintId = `${String(id)}-hint`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <FieldShell>
      <Label htmlFor={String(id)}>{label}</Label>
      <select
        id={String(id)}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        className="field-shell ring-focus h-12 px-3 text-[15px] text-[var(--ink)] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p id={hintId} className="text-[12px] leading-[1.5] text-[var(--soft)]">
          {hint}
        </p>
      ) : null}
      <div id={errorId}>
        <FieldError message={error} />
      </div>
    </FieldShell>
  );
}

function BulletList({ title, items }: { title: string; items: readonly string[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h4 className="text-[12px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
        {title}
      </h4>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-[1.6] text-[var(--ink-2)]">
        {[...new Set(items)].map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function DuoAanvullendeBeursCalculator() {
  const resultRef = useRef<HTMLDivElement | null>(null);
  const {
    formValues,
    setFormValues,
    submittedValues,
    submit,
    hasDirtyChanges,
    setValues,
    reset,
  } = useSubmittedCalculation<AdditionalGrantFormValues>(defaultValues);
  const errors = validateAdditionalGrantForm(formValues);
  const submittedView = useMemo(
    () => (submittedValues ? createAdditionalGrantView(submittedValues) : null),
    [submittedValues],
  );
  const nextSteps = getToolNextSteps("duo-aanvullende-beurs");
  const hasErrors = Object.keys(errors).length > 0;
  const hasTwoParents = formValues.familySituation === "two-parents";
  const isMbo = formValues.educationType === "mbo-1-2" || formValues.educationType === "mbo-3-4";

  useEffect(() => {
    if (submittedView?.isValid) {
      resultRef.current?.focus();
    }
  }, [submittedView]);

  function updateField<K extends keyof AdditionalGrantFormValues>(
    field: K,
    value: AdditionalGrantFormValues[K],
  ) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit() {
    if (hasErrors) {
      document.getElementById("aanvullende-beurs-errors")?.focus();
      return;
    }
    submit();
  }

  const inputs = (
    <div className="space-y-6">
      {hasErrors ? (
        <div
          id="aanvullende-beurs-errors"
          tabIndex={-1}
          className="rounded-xl border border-[var(--neg-soft)] bg-[var(--neg-soft)]/55 px-4 py-3 text-sm text-[oklch(35%_0.13_28)]"
        >
          Vul de ontbrekende concrete gegevens aan. De berekening gebruikt geen “weet ik niet”
          als eindinvoer.
        </div>
      ) : null}

      <section className="space-y-4" aria-labelledby="duo-additional-study-heading">
        <h3 id="duo-additional-study-heading" className="font-serif text-[23px] text-[var(--ink)]">
          Studie en woonsituatie
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="educationType"
            label="Opleiding"
            value={formValues.educationType}
            error={errors.educationType}
            options={[
              { value: "", label: "Kies opleiding" },
              { value: "mbo-1-2", label: "Mbo niveau 1 of 2" },
              { value: "mbo-3-4", label: "Mbo niveau 3 of 4" },
              { value: "hbo", label: "Hbo" },
              { value: "university", label: "Universiteit" },
            ]}
            onChange={(value) => updateField("educationType", value)}
          />
          <SelectField
            id="residence"
            label="Woonsituatie volgens DUO"
            value={formValues.residence}
            error={errors.residence}
            options={[
              { value: "", label: "Kies woonsituatie" },
              { value: "living-at-home", label: "Thuiswonend" },
              { value: "living-away", label: "Uitwonend" },
            ]}
            onChange={(value) => updateField("residence", value)}
          />
          {isMbo ? (
            <>
              <MoneyField
                id="calculationMonth"
                label="Maandnummer in 2026"
                value={formValues.calculationMonth}
                error={errors.calculationMonth}
                prefix=""
                inputMode="numeric"
                hint="De centrale engine ondersteunt de gevalideerde mbo-periode."
                onChange={(value) => updateField("calculationMonth", value)}
              />
              <SelectField
                id="tuitionDue"
                label="Lesgeldplichtig?"
                value={formValues.tuitionDue}
                options={[
                  { value: "yes", label: "Ja" },
                  { value: "no", label: "Nee, bijzondere situatie" },
                ]}
                onChange={(value) => updateField("tuitionDue", value)}
              />
            </>
          ) : null}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="duo-additional-parents-heading">
        <h3 id="duo-additional-parents-heading" className="font-serif text-[23px] text-[var(--ink)]">
          Ouderinkomen
        </h3>
        <p className="text-[13px] leading-[1.6] text-[var(--muted)]">
          Voor aanvullende beurs in 2026 gebruikt DUO normaal ouderinkomen uit 2024:
          verzamelinkomen uit de definitieve aanslag, of belastbaar loon als er geen aangifte is.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="familySituation"
            label="Hoeveel ouders tellen mee?"
            value={formValues.familySituation}
            error={errors.familySituation}
            options={[
              { value: "", label: "Kies aantal ouders" },
              { value: "single-parent", label: "Eén ouder" },
              { value: "two-parents", label: "Twee ouders" },
            ]}
            onChange={(value) => updateField("familySituation", value)}
          />
          <SelectField
            id="specialCase"
            label="Bijzondere oudersituatie?"
            value={formValues.specialCase}
            options={[
              { value: "none", label: "Nee, reguliere berekening" },
              { value: "parent-deceased", label: "Ouder overleden" },
              { value: "parent-unknown", label: "Ouder onbekend" },
              { value: "parent-abroad", label: "Ouder in het buitenland" },
              { value: "parent-ignored", label: "Ouder buiten beschouwing" },
              { value: "no-contact-or-conflict", label: "Geen contact of conflict" },
            ]}
            onChange={(value) => updateField("specialCase", value)}
          />
          <MoneyField
            id="parent1Income"
            label="Ouderinkomen 2024 ouder 1"
            value={formValues.parent1Income}
            error={errors.parent1Income}
            onChange={(value) => updateField("parent1Income", value)}
          />
          <SelectField
            id="parent1IncomeReliability"
            label="Status inkomen ouder 1"
            value={formValues.parent1IncomeReliability}
            options={[
              { value: "final", label: "Definitief" },
              { value: "estimated", label: "Schatting" },
            ]}
            onChange={(value) => updateField("parent1IncomeReliability", value)}
          />
          {hasTwoParents ? (
            <>
              <MoneyField
                id="parent2Income"
                label="Ouderinkomen 2024 ouder 2"
                value={formValues.parent2Income}
                error={errors.parent2Income}
                onChange={(value) => updateField("parent2Income", value)}
              />
              <SelectField
                id="parent2IncomeReliability"
                label="Status inkomen ouder 2"
                value={formValues.parent2IncomeReliability}
                options={[
                  { value: "final", label: "Definitief" },
                  { value: "estimated", label: "Schatting" },
                ]}
                onChange={(value) => updateField("parent2IncomeReliability", value)}
              />
            </>
          ) : null}
        </div>
      </section>

      <DisclosureSection title="Aftrekposten en broers of zussen">
        <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
          Laat deze velden leeg als ze niet spelen. De centrale engine gebruikt ze alleen als je
          concrete waarden invult.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MoneyField
            id="parent1AnnualDuoRepaymentTerms"
            label="DUO-termijnen ouder 1 per jaar"
            value={formValues.parent1AnnualDuoRepaymentTerms}
            error={errors.parent1AnnualDuoRepaymentTerms}
            onChange={(value) => updateField("parent1AnnualDuoRepaymentTerms", value)}
          />
          <MoneyField
            id="parent1OtherQualifyingChildren"
            label="Andere kwalificerende kinderen ouder 1"
            value={formValues.parent1OtherQualifyingChildren}
            error={errors.parent1OtherQualifyingChildren}
            prefix=""
            inputMode="numeric"
            onChange={(value) => updateField("parent1OtherQualifyingChildren", value)}
          />
          <MoneyField
            id="parent1ChildrenWithAdditionalGrant"
            label="Kinderen met aanvullende beurs ouder 1"
            value={formValues.parent1ChildrenWithAdditionalGrant}
            error={errors.parent1ChildrenWithAdditionalGrant}
            prefix=""
            inputMode="numeric"
            onChange={(value) => updateField("parent1ChildrenWithAdditionalGrant", value)}
          />
          {hasTwoParents ? (
            <>
              <MoneyField
                id="parent2AnnualDuoRepaymentTerms"
                label="DUO-termijnen ouder 2 per jaar"
                value={formValues.parent2AnnualDuoRepaymentTerms}
                error={errors.parent2AnnualDuoRepaymentTerms}
                onChange={(value) => updateField("parent2AnnualDuoRepaymentTerms", value)}
              />
              <MoneyField
                id="parent2OtherQualifyingChildren"
                label="Andere kwalificerende kinderen ouder 2"
                value={formValues.parent2OtherQualifyingChildren}
                error={errors.parent2OtherQualifyingChildren}
                prefix=""
                inputMode="numeric"
                onChange={(value) => updateField("parent2OtherQualifyingChildren", value)}
              />
              <MoneyField
                id="parent2ChildrenWithAdditionalGrant"
                label="Kinderen met aanvullende beurs ouder 2"
                value={formValues.parent2ChildrenWithAdditionalGrant}
                error={errors.parent2ChildrenWithAdditionalGrant}
                prefix=""
                inputMode="numeric"
                onChange={(value) => updateField("parent2ChildrenWithAdditionalGrant", value)}
              />
            </>
          ) : null}
        </div>
      </DisclosureSection>
    </div>
  );

  const result = submittedView?.isValid ? (
    <div
      ref={resultRef}
      id="tool-result-summary"
      tabIndex={-1}
      className="space-y-5 outline-none"
      aria-live="polite"
    >
      <section className="surface-panel p-5">
        <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
          {submittedView.statusLabel}
        </p>
        <h3 className="mt-2 font-serif text-2xl text-[var(--ink)]">
          {submittedView.conclusion}
        </h3>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <ResultCard
          label="Aanvullende beurs per maand"
          value={submittedView.monthlyGrantLabel}
          className="sm:col-span-3"
          tone={submittedView.result.status === "calculated" ? "pos" : "warn"}
        />
        <ResultCard
          label="Aanvullende beurs per jaar"
          value={submittedView.annualGrantLabel}
        />
        <ResultCard
          label="Waarschijnlijk recht"
          value={submittedView.probablyEligibleLabel}
          tone={submittedView.probablyEligibleLabel === "Waarschijnlijk niet" ? "neg" : "default"}
        />
      </div>
      <ToolNextSteps {...nextSteps} />
      <section className="surface-panel p-5">
        <h3 className="font-serif text-xl text-[var(--ink)]">Berekeningsuitleg</h3>
        <div className="mt-3">
          {submittedView.explanationRows.map((row) => (
            <ResultRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      </section>
      <section className="surface-panel space-y-5 p-5">
        <BulletList title="Aannames" items={submittedView.assumptionMessages} />
        <BulletList title="Waarschuwingen" items={submittedView.warningMessages} />
        <BulletList title="Engine-meldingen vertaald" items={submittedView.reasonMessages} />
      </section>
      <section className="surface-panel p-5">
        <h3 className="font-serif text-xl text-[var(--ink)]">Bronnen</h3>
        <p className="mt-2 text-[13px] leading-[1.6] text-[var(--muted)]">
          De tool past de centrale DUO-brondata zelf toe. Deze links zijn er voor controle en verdieping.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {submittedView.sourceLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-link ring-focus inline-flex min-h-11 items-center rounded-lg border border-[var(--hair)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--ink)] underline-offset-4 hover:underline"
            >
              {link.label} <span className="sr-only">(opent extern)</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  ) : (
    <div className="surface-panel p-5">
      <h3 className="font-serif text-xl text-[var(--ink)]">Nog geen berekening</h3>
      <p className="mt-2 text-[14px] leading-[1.65] text-[var(--muted)]">
        Vul concrete opleiding-, woon- en ouderinkomensgegevens in. Daarna rekent de centrale
        aanvullende-beursengine het maand- en jaarbedrag uit.
      </p>
    </div>
  );

  return (
    <CalculatorShell
      intro={
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
            DUO · aanvullende beurs 2026
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[var(--ink)]">
            Schat je aanvullende beurs
          </h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-[var(--muted)]">
            Bereken met concrete ouderinkomens uit 2024 wat de aanvullende beurs in 2026
            indicatief per maand en per jaar kan zijn.
          </p>
        </div>
      }
      startActions={
        <div className="flex flex-wrap gap-2">
          <ToolActionButton type="button" variant="secondary" onClick={() => setValues(defaultValues)}>
            Voorbeeld invullen
          </ToolActionButton>
          <ToolActionButton type="button" variant="secondary" onClick={() => setValues(emptyValues)}>
            Wis invoer
          </ToolActionButton>
        </div>
      }
      inputs={inputs}
      submitAction={
        <div className="space-y-3">
          <ToolActionButton type="button" onClick={handleSubmit} disabled={hasErrors}>
            Bereken
          </ToolActionButton>
          <ToolActionButton type="button" variant="secondary" onClick={() => reset()}>
            Wis invoer
          </ToolActionButton>
          {hasDirtyChanges ? (
            <p className="text-[12px] leading-[1.5] text-[var(--muted)]">
              Je hebt de invoer gewijzigd na de laatste berekening.
            </p>
          ) : null}
        </div>
      }
      result={result}
      disclaimer={
        <p className="text-[12px] leading-[1.6] text-[var(--muted)]">
          Deze tool geeft een indicatieve Project Site-berekening en geen DUO-beschikking.
          Ouderinkomens blijven in de browser en worden niet in URL&apos;s of analytics verwerkt.
        </p>
      }
    />
  );
}
