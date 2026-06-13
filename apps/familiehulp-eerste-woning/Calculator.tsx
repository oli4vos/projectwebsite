"use client";

import { useState } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { ResultCard } from "@/components/ResultCard";
import { ResultRow } from "@/components/ResultRow";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { useUserProfile } from "@/hooks/useUserProfile";
import { createProfilePrefillState, mergeProfilePatchIntoValues } from "@/lib/profile-prefill";
import { buildProfilePatchFromProfile, calculateFamilyHomeScenario, exampleValues, validateFamilyHomeForm, type FamilyHomeFormState } from "./logic";

type FieldProps = {
  id: keyof FamilyHomeFormState;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  suffix?: string;
  type?: "text" | "number" | "date";
  placeholder?: string;
};

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  suffix,
  type = "text",
  placeholder,
}: FieldProps) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium text-[var(--muted)]">
          {label}
        </span>
        {hint ? <span className="text-[11px] text-[var(--soft)]">{hint}</span> : null}
      </div>
      <div className="hair flex h-11 items-center rounded-xl border bg-white px-3">
        <input
          id={String(id)}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="ring-focus flex-1 bg-transparent font-mono text-[15px] tabular outline-none"
        />
        {suffix ? <span className="ml-2 text-[13px] text-[var(--muted)]">{suffix}</span> : null}
      </div>
      <FieldError message={error} />
    </label>
  );
}

type SelectProps = {
  id: keyof FamilyHomeFormState;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  options: Array<{ label: string; value: string }>;
};

function SelectField({ id, label, value, onChange, error, hint, options }: SelectProps) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium text-[var(--muted)]">
          {label}
        </span>
        {hint ? <span className="text-[11px] text-[var(--soft)]">{hint}</span> : null}
      </div>
      <div className="hair flex h-11 items-center rounded-xl border bg-white px-3">
        <select
          id={String(id)}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="ring-focus w-full bg-transparent text-[15px] outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <FieldError message={error} />
    </label>
  );
}

type CheckboxProps = {
  id: keyof FamilyHomeFormState;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
};

function CheckboxField({ id, label, checked, onChange, hint }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3">
      <input
        id={String(id)}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 rounded border-[var(--hair)] text-[var(--deep)]"
      />
      <span className="space-y-1">
        <span className="block text-[14px] font-medium text-[var(--ink)]">{label}</span>
        {hint ? <span className="block text-[12px] leading-6 text-[var(--muted)]">{hint}</span> : null}
      </span>
    </label>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSignedCurrency(value: number | undefined) {
  if (value === undefined) {
    return "n.v.t.";
  }

  const formatted = formatCurrency(Math.abs(value));
  if (value > 0) {
    return `Tekort ${formatted}`;
  }
  if (value < 0) {
    return `Overschot ${formatted}`;
  }
  return "Geen tekort of overschot";
}

function comparisonNote(resultValue: number | undefined, baseValue: number | undefined) {
  if (resultValue === undefined || baseValue === undefined) {
    return undefined;
  }

  const delta = resultValue - baseValue;
  if (delta === 0) {
    return "Geen verschil met het hoofdscenario";
  }
  return `Verschil t.o.v. hoofdscenario: ${formatSignedCurrency(delta)}`;
}

function formatConclusion(value: number) {
  if (value > 0) {
    return `Je komt ${formatCurrency(value)} tekort`;
  }

  if (value < 0) {
    return `Je financiering is rond met ${formatCurrency(Math.abs(value))} ruimte`;
  }

  return "Je financiering sluit precies";
}

export default function Calculator() {
  const { profile, hasProfile } = useUserProfile();
  const profilePatch = buildProfilePatchFromProfile(profile);
  const initialDefaults = mergeProfilePatchIntoValues(exampleValues, profilePatch);
  const { initialValues, profileKey, hasRelevantProfileValues } = createProfilePrefillState({
    defaultValues: initialDefaults,
    profilePatch,
    hasProfile,
    profileUpdatedAt: profile.updatedAt,
  });

  return (
    <CalculatorContent
      key={profileKey}
      initialValues={initialValues}
      hasRelevantProfileValues={hasRelevantProfileValues}
      profilePatch={profilePatch}
    />
  );
}

type CalculatorContentProps = {
  initialValues: FamilyHomeFormState;
  hasRelevantProfileValues: boolean;
  profilePatch: Partial<FamilyHomeFormState>;
};

function CalculatorContent({
  initialValues,
  hasRelevantProfileValues,
  profilePatch,
}: CalculatorContentProps) {
  const [formValues, setFormValues] = useState<FamilyHomeFormState>(initialValues);
  const [submittedValues, setSubmittedValues] = useState<FamilyHomeFormState>(initialValues);
  const [submitContextMessage, setSubmitContextMessage] = useState<string | null>(null);

  const validation = validateFamilyHomeForm(formValues);
  const submittedValidation = validateFamilyHomeForm(submittedValues);
  const result = submittedValidation.parsedValues
    ? calculateFamilyHomeScenario(submittedValidation.parsedValues)
    : null;

  const recurringGiftResult = result?.primaryScenario.giftCashflows?.find((gift) => gift.kind === "recurring");
  const noRecurringGiftResult = result?.withoutRecurringGiftScenario;
  const familyLoanMonthlyPayment = result?.familyLoanMonthlyPayment ?? 0;
  const familyLoanResult = result?.familyLoanResult;
  const mortgageMonthlyPayment = result?.primaryScenario.contractualMonthlyPayments?.bankMortgagePayment ?? 0;
  const duoMonthlyPayment = result?.primaryScenario.contractualMonthlyPayments?.duoPayment ?? 0;
  const totalContractualMonthlyPayment =
    result?.primaryScenario.contractualMonthlyPayments?.grossContractualOutflow ?? 0;
  const netHouseholdCashflow =
    result?.primaryScenario.contractualMonthlyPayments?.netCashOutflowAfterReceipts ?? 0;
  const totalFinancing = result?.primaryScenario.totalFinancing ?? 0;
  const financingGap = result?.primaryScenario.financingGap ?? 0;
  const ownFundsUsed = result?.primaryScenario.ownFundsUsed ?? 0;
  const remainingBuffer = result?.primaryScenario.remainingBuffer ?? 0;
  const duoDebtAfterExtraRepayment = result?.primaryScenario.debtsBySource?.duoDebt;

  function updateField<K extends keyof FamilyHomeFormState>(field: K, value: FamilyHomeFormState[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function submitCalculation() {
    if (!validation.parsedValues) {
      return;
    }

    setSubmittedValues(formValues);
    setSubmitContextMessage(null);
    document.getElementById("tool-result-summary")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function applyExampleValues() {
    setFormValues(exampleValues);
    setSubmittedValues(exampleValues);
    setSubmitContextMessage("Voorbeeldwaarden geladen. Klik opnieuw op Bereken als je iets wijzigt.");
  }

  function applyProfileValues() {
    const nextValues = mergeProfilePatchIntoValues(formValues, profilePatch);
    setFormValues(nextValues);
    setSubmittedValues(nextValues);
    setSubmitContextMessage("Profielwaarden geladen. Klik opnieuw op Bereken als je iets wijzigt.");
  }

  const recurringGiftWarnings = result?.primaryScenario.warnings.filter((warning) =>
    warning.toLowerCase().includes("schenk"),
  );
  const conclusionTone = financingGap > 0 ? "neg" : "pos";
  const conclusionNote =
    financingGap > 0
      ? "Hypotheek, eigen geld en hulp van familie dekken de aankoop met deze invoer niet helemaal."
      : "De gekozen bronnen dekken de aankoop met deze invoer.";

  return (
    <CalculatorShell
      intro={
        <div>
          <div className="text-[13px] font-medium text-[var(--muted)]">
            Verdieping: wonen
          </div>
          <h1 className="mt-2 font-serif text-[clamp(2rem,1.6rem+1.5vw,2.9rem)] leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
            Lenen of schenken naast je studieschuld
          </h1>
          <p className="mt-3 text-[14px] leading-[1.75] text-[var(--ink-2)]">
            Combineer woningprijs, eigen geld, DUO, een familielening en schenkingen
            in één scenario. Contractuele lasten en hulp van familie blijven apart.
          </p>
          <p className="mt-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            Toekomstige periodieke schenkingen zijn onzeker. Deze tool laat daarom
            ook een scenario zonder periodieke schenking zien.
          </p>
          <div className="mt-5 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.7] text-[var(--muted)]">
            Geen persoonlijk advies. Deze berekening is educatief en indicatief.
            Actuele acceptatie-eisen, fiscale regels en notariële voorwaarden kunnen
            afwijken.
          </div>
          {submitContextMessage ? (
            <p className="mt-3 text-[12.5px] text-[var(--muted)]">{submitContextMessage}</p>
          ) : null}
        </div>
      }
      inputs={
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            submitCalculation();
          }}
        >
          <DisclosureSection title="Woning en eigen geld" subtitle="Kern van de aankoopfinanciering." defaultOpen>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                id="purchasePrice"
                label="Woningprijs"
                value={formValues.purchasePrice}
                onChange={(value) => updateField("purchasePrice", value)}
                error={validation.errors.purchasePrice}
                suffix="€"
              />
              <TextField
                id="acquisitionCosts"
                label="Aankoopkosten"
                value={formValues.acquisitionCosts}
                onChange={(value) => updateField("acquisitionCosts", value)}
                error={validation.errors.acquisitionCosts}
                suffix="€"
              />
              <TextField
                id="ownFunds"
                label="Eigen geld"
                value={formValues.ownFunds}
                onChange={(value) => updateField("ownFunds", value)}
                error={validation.errors.ownFunds}
                suffix="€"
              />
              <TextField
                id="minimumBuffer"
                label="Minimale buffer"
                value={formValues.minimumBuffer}
                onChange={(value) => updateField("minimumBuffer", value)}
                error={validation.errors.minimumBuffer}
                suffix="€"
                hint="Na de aankoop beschikbaar houden"
              />
              <TextField
                id="bankMortgagePrincipal"
                label="Bancaire hypotheek"
                value={formValues.bankMortgagePrincipal}
                onChange={(value) => updateField("bankMortgagePrincipal", value)}
                error={validation.errors.bankMortgagePrincipal}
                suffix="€"
              />
              <TextField
                id="bankMortgageAnnualRate"
                label="Hypotheekrente"
                value={formValues.bankMortgageAnnualRate}
                onChange={(value) => updateField("bankMortgageAnnualRate", value)}
                error={validation.errors.bankMortgageAnnualRate}
                suffix="%"
              />
              <TextField
                id="bankMortgageTermYears"
                label="Hypotheeklooptijd"
                value={formValues.bankMortgageTermYears}
                onChange={(value) => updateField("bankMortgageTermYears", value)}
                error={validation.errors.bankMortgageTermYears}
                suffix="jaar"
              />
            </div>
          </DisclosureSection>

          <DisclosureSection title="DUO en extra aflossen" subtitle="Studieschuld, maandlast en effect van extra aflossen.">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                id="duoSituation"
                label="DUO-situatie"
                value={formValues.duoSituation}
                onChange={(value) => updateField("duoSituation", value as FamilyHomeFormState["duoSituation"])}
                error={validation.errors.duoSituation}
                options={[
                  { value: "repaying", label: "Ik betaal al af" },
                  { value: "gracePeriod", label: "Aanloopfase" },
                  { value: "incomeBasedReduction", label: "Verlaagd door draagkracht" },
                  { value: "paymentPause", label: "Aflossingsvrije periode" },
                  { value: "unknown", label: "Weet ik niet" },
                ]}
              />
              <SelectField
                id="duoRepaymentRule"
                label="Terugbetalingsregel"
                value={formValues.duoRepaymentRule}
                onChange={(value) => updateField("duoRepaymentRule", value as FamilyHomeFormState["duoRepaymentRule"])}
                error={validation.errors.duoRepaymentRule}
                options={[
                  { value: "SF35", label: "SF35" },
                  { value: "SF15", label: "SF15" },
                  { value: "SF15_OLD", label: "SF15-oud" },
                  { value: "SF15_LLLK", label: "Levenlanglerenkrediet" },
                  { value: "UNKNOWN", label: "Onbekend" },
                ]}
              />
              <TextField
                id="duoRemainingDebt"
                label="Resterende studieschuld"
                value={formValues.duoRemainingDebt}
                onChange={(value) => updateField("duoRemainingDebt", value)}
                error={validation.errors.duoRemainingDebt}
                suffix="€"
              />
              <TextField
                id="duoAnnualInterestRate"
                label="DUO-rente"
                value={formValues.duoAnnualInterestRate}
                onChange={(value) => updateField("duoAnnualInterestRate", value)}
                error={validation.errors.duoAnnualInterestRate}
                suffix="%"
              />
              <TextField
                id="duoRemainingTermYears"
                label="Resterende looptijd DUO"
                value={formValues.duoRemainingTermYears}
                onChange={(value) => updateField("duoRemainingTermYears", value)}
                error={validation.errors.duoRemainingTermYears}
                suffix="jaar"
              />
              <TextField
                id="duoCurrentMonthlyPayment"
                label="Huidige DUO-maandlast"
                value={formValues.duoCurrentMonthlyPayment}
                onChange={(value) => updateField("duoCurrentMonthlyPayment", value)}
                error={validation.errors.duoCurrentMonthlyPayment}
                suffix="€ p/m"
              />
              <TextField
                id="duoStatutoryMonthlyPayment"
                label="Wettelijk maandbedrag"
                value={formValues.duoStatutoryMonthlyPayment}
                onChange={(value) => updateField("duoStatutoryMonthlyPayment", value)}
                error={validation.errors.duoStatutoryMonthlyPayment}
                suffix="€ p/m"
              />
              <TextField
                id="duoGrossAnnualIncome"
                label="Jouw bruto jaarinkomen"
                value={formValues.duoGrossAnnualIncome}
                onChange={(value) => updateField("duoGrossAnnualIncome", value)}
                error={validation.errors.duoGrossAnnualIncome}
                suffix="€"
              />
              <TextField
                id="duoPartnerGrossAnnualIncome"
                label="Partnerinkomen"
                value={formValues.duoPartnerGrossAnnualIncome}
                onChange={(value) => updateField("duoPartnerGrossAnnualIncome", value)}
                error={validation.errors.duoPartnerGrossAnnualIncome}
                suffix="€"
              />
              <TextField
                id="extraDuoRepayment"
                label="Extra DUO-aflossing"
                value={formValues.extraDuoRepayment}
                onChange={(value) => updateField("extraDuoRepayment", value)}
                error={validation.errors.extraDuoRepayment}
                suffix="€"
              />
            </div>
          </DisclosureSection>

          <DisclosureSection
            title="Lenen of schenken via familie"
            subtitle="Familielening, eenmalige schenking en periodieke schenking blijven apart zichtbaar."
          >
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  id="familyLoanPrincipal"
                  label="Familielening"
                  value={formValues.familyLoanPrincipal}
                  onChange={(value) => updateField("familyLoanPrincipal", value)}
                  error={validation.errors.familyLoanPrincipal}
                  suffix="€"
                />
                <TextField
                  id="familyLoanAnnualRate"
                  label="Rente familielening"
                  value={formValues.familyLoanAnnualRate}
                  onChange={(value) => updateField("familyLoanAnnualRate", value)}
                  error={validation.errors.familyLoanAnnualRate}
                  suffix="%"
                />
                <TextField
                  id="familyLoanTermYears"
                  label="Looptijd familielening"
                  value={formValues.familyLoanTermYears}
                  onChange={(value) => updateField("familyLoanTermYears", value)}
                  error={validation.errors.familyLoanTermYears}
                  suffix="jaar"
                />
                <SelectField
                  id="familyLoanRepaymentType"
                  label="Aflossingsvorm"
                  value={formValues.familyLoanRepaymentType}
                  onChange={(value) =>
                    updateField(
                      "familyLoanRepaymentType",
                      value as FamilyHomeFormState["familyLoanRepaymentType"],
                    )
                  }
                  error={validation.errors.familyLoanRepaymentType}
                  options={[
                    { value: "annuity", label: "Annuïtair" },
                    { value: "linear", label: "Lineair" },
                  ]}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  id="oneTimeGiftAmount"
                  label="Eenmalige schenking"
                  value={formValues.oneTimeGiftAmount}
                  onChange={(value) => updateField("oneTimeGiftAmount", value)}
                  error={validation.errors.oneTimeGiftAmount}
                  suffix="€"
                />
                <CheckboxField
                  id="recurringGiftEnabled"
                  label="Periodieke schenking gebruiken"
                  checked={formValues.recurringGiftEnabled}
                  onChange={(checked) => updateField("recurringGiftEnabled", checked)}
                  hint="Toekomstige schenkingen zijn onzeker en worden apart geanalyseerd."
                />
              </div>

              {formValues.recurringGiftEnabled ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    id="recurringGiftAmountPerPeriod"
                    label="Bedrag per periode"
                    value={formValues.recurringGiftAmountPerPeriod}
                    onChange={(value) => updateField("recurringGiftAmountPerPeriod", value)}
                    error={validation.errors.recurringGiftAmountPerPeriod}
                    suffix="€"
                  />
                  <SelectField
                    id="recurringGiftFrequency"
                    label="Frequentie"
                    value={formValues.recurringGiftFrequency}
                    onChange={(value) =>
                      updateField(
                        "recurringGiftFrequency",
                        value as FamilyHomeFormState["recurringGiftFrequency"],
                      )
                    }
                    error={validation.errors.recurringGiftFrequency}
                    options={[
                      { value: "monthly", label: "Maandelijks" },
                      { value: "quarterly", label: "Per kwartaal" },
                      { value: "yearly", label: "Jaarlijks" },
                    ]}
                  />
                  <TextField
                    id="recurringGiftStartDate"
                    label="Startdatum"
                    value={formValues.recurringGiftStartDate}
                    onChange={(value) => updateField("recurringGiftStartDate", value)}
                    error={validation.errors.recurringGiftStartDate}
                    type="date"
                  />
                  <TextField
                    id="recurringGiftEndDate"
                    label="Einddatum"
                    value={formValues.recurringGiftEndDate}
                    onChange={(value) => updateField("recurringGiftEndDate", value)}
                    error={validation.errors.recurringGiftEndDate}
                    type="date"
                  />
                  <TextField
                    id="recurringGiftMaxPayments"
                    label="Max. betalingen"
                    value={formValues.recurringGiftMaxPayments}
                    onChange={(value) => updateField("recurringGiftMaxPayments", value)}
                    error={validation.errors.recurringGiftMaxPayments}
                    suffix="keer"
                  />
                </div>
              ) : null}
            </div>
          </DisclosureSection>

          <div className="flex flex-wrap gap-3">
            <ToolActionButton type="submit" variant="accent">
              Bereken scenario
            </ToolActionButton>
            <ToolActionButton
              type="button"
              variant="secondary"
              onClick={applyExampleValues}
            >
              Voorbeeldwaarden laden
            </ToolActionButton>
            {hasRelevantProfileValues ? (
              <ToolActionButton
                type="button"
                variant="secondary"
                onClick={applyProfileValues}
              >
                Profielwaarden laden
              </ToolActionButton>
            ) : null}
          </div>
          {submitContextMessage ? (
            <p className="text-[12.5px] text-[var(--muted)]">{submitContextMessage}</p>
          ) : null}
        </form>
      }
      result={
        <section
          id="tool-result-summary"
          className="space-y-5 rounded-xl border hair bg-white p-5 shadow-paper"
        >
          <div>
            <div className="text-[13px] font-medium text-[var(--muted)]">Resultaat</div>
            <h2 className="mt-2 font-serif text-[clamp(1.5rem,1.25rem+0.8vw,2rem)] tracking-[-0.02em] text-[var(--ink)]">
              Eerst de conclusie
            </h2>
            <p className="mt-2 text-[13px] leading-[1.7] text-[var(--muted)]">
              De vaste verplichtingen staan los van wat je netto kwijt bent na een schenking.
            </p>
          </div>

          <ResultCard
            label="Conclusie"
            value={formatConclusion(financingGap)}
            note={conclusionNote}
            tone={conclusionTone}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <article className="rounded-xl border hair bg-[var(--paper-soft)] p-4">
              <h3 className="font-serif text-[1.2rem] tracking-[-0.02em] text-[var(--ink)]">
                Vaste maandlasten (contracten)
              </h3>
              <p className="mt-1 text-[13px] leading-6 text-[var(--muted)]">
                Dit moet je elke maand betalen, ook als een schenking stopt.
              </p>
              <div className="mt-3">
                <ResultRow label="Bancaire maandlast" value={formatCurrency(mortgageMonthlyPayment)} />
                <ResultRow label="DUO-maandlast" value={formatCurrency(duoMonthlyPayment)} />
                <ResultRow label="Familielening-maandlast" value={formatCurrency(familyLoanMonthlyPayment)} />
                <ResultRow
                  label="Totaal vaste maandlasten"
                  value={formatCurrency(totalContractualMonthlyPayment)}
                  strong
                />
                {familyLoanResult ? (
                  <>
                    <ResultRow
                      label="Totale rente familielening"
                      value={formatCurrency(familyLoanResult.totalInterest)}
                    />
                    <ResultRow
                      label="Resterende vordering familielening"
                      value={formatCurrency(familyLoanResult.remainingDebt)}
                    />
                  </>
                ) : null}
              </div>
            </article>

            <article className="rounded-xl border hair bg-white p-4">
              <h3 className="font-serif text-[1.2rem] tracking-[-0.02em] text-[var(--ink)]">
                Wat je netto kwijt bent
              </h3>
              <p className="mt-1 text-[13px] leading-6 text-[var(--muted)]">
                Een schenking verlaagt niet je verplichtingen, maar kan wel je netto kasstroom veranderen.
              </p>
              <div className="mt-3">
                <ResultRow label="Totale financiering" value={formatCurrency(totalFinancing)} />
                <ResultRow label="Eigen geld gebruikt" value={formatCurrency(ownFundsUsed)} />
                <ResultRow label="Resterende buffer" value={formatCurrency(remainingBuffer)} />
                <ResultRow
                  label="Netto kasuitstroom na schenking"
                  value={formatCurrency(netHouseholdCashflow)}
                  strong
                />
                <ResultRow
                  label="DUO-schuld na extra aflossing"
                  value={formatCurrency(duoDebtAfterExtraRepayment ?? 0)}
                  sub="Alleen extra DUO-aflossing verlaagt deze schuld; de schenking zelf niet automatisch."
                />
              </div>
            </article>
          </div>

          <div className="rounded-xl border border-transparent bg-[var(--warn-soft)] p-5">
            <h3 className="font-serif text-[1.2rem] tracking-[-0.02em] text-[var(--ink)]">
              Toekomstige schenkingen zijn niet zeker
            </h3>
            <p className="mt-2 text-[13px] leading-6 text-[var(--muted)]">
              Daarom rekenen we ook uit hoe je ervoor staat als de periodieke schenking
              stopt of nooit komt.
            </p>
            <div className="mt-3">
              <ResultRow
                label="Periodieke schenking"
                value={recurringGiftResult ? "Meegenomen als onzeker scenario" : "Niet gebruikt"}
                sub="Niet behandeld als gegarandeerd inkomen of vaste lastverlaging."
              />
              <ResultRow
                label="Scenario zonder periodieke schenking"
                value={noRecurringGiftResult ? formatSignedCurrency(noRecurringGiftResult.financingGap) : "n.v.t."}
                strong
              />
              <ResultRow
                label="Netto kasuitstroom zonder periodieke schenking"
                value={formatCurrency(
                  noRecurringGiftResult?.contractualMonthlyPayments?.netCashOutflowAfterReceipts ?? 0,
                )}
                sub={comparisonNote(
                  noRecurringGiftResult?.contractualMonthlyPayments?.netCashOutflowAfterReceipts,
                  result?.primaryScenario.contractualMonthlyPayments?.netCashOutflowAfterReceipts,
                )}
              />
              {result?.primaryScenario.stressTests?.map((test) => (
                <ResultRow
                  key={test.type}
                  label={`Stress: ${test.type}`}
                  value={test.passed ? "Geslaagd" : "Niet gehaald"}
                  sub={`Effect ${formatCurrency(test.financialEffect)} · Buffer na stress ${formatCurrency(test.bufferAfterStress ?? 0)}`}
                />
              ))}
            </div>
            {recurringGiftWarnings?.length ? (
              <div className="mt-3 rounded-lg border border-[var(--hair)] bg-white/65 px-4 py-3 text-[13px] leading-6 text-[var(--muted)]">
                {recurringGiftWarnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            ) : null}
          </div>

          <DisclosureSection title="Hoe je dit leest" subtitle="Korte uitleg bij de belangrijkste uitkomsten.">
            <div className="space-y-3 text-[13px] leading-6 text-[var(--muted)]">
              <p>
                De totale financiering laat zien hoeveel van de aankoop met hypotheek,
                eigen geld, schenking en familielening wordt gedekt.
              </p>
              <p>
                De netto kasuitstroom na schenking blijft apart staan: een schenking
                verlaagt niet automatisch je contractuele maandlast, maar wel je
                netto kasstroom.
              </p>
              <p>
                Het scenario zonder periodieke schenking is bedoeld als realistische
                stressvariant, omdat toekomstige schenkingen onzeker zijn.
              </p>
            </div>
          </DisclosureSection>
        </section>
      }
      details={
        <DisclosureSection title="Inputkwaliteit" subtitle="Controleer deze punten als de uitkomst afwijkt." defaultOpen={false}>
          <div className="space-y-3">
            <ResultRow
              label="Woning- en financieringsgegevens"
              value={
                validation.errors.purchasePrice ||
                validation.errors.bankMortgagePrincipal ||
                validation.errors.bankMortgageAnnualRate ||
                validation.errors.bankMortgageTermYears
                  ? "Onvolledig"
                  : "In orde"
              }
            />
            <ResultRow
              label="DUO-gegevens"
              value={
                validation.errors.duoRemainingDebt ||
                validation.errors.duoAnnualInterestRate ||
                validation.errors.duoRemainingTermYears
                  ? "Onvolledig"
                  : "In orde"
              }
            />
            <ResultRow
              label="Familiegegevens"
              value={
                validation.errors.familyLoanPrincipal ||
                validation.errors.familyLoanAnnualRate ||
                validation.errors.familyLoanTermYears
                  ? "Onvolledig"
                  : "In orde"
              }
            />
          </div>
        </DisclosureSection>
      }
      disclaimer={
        <div className="rounded-xl border border-[var(--hair)] bg-white p-5 text-[13px] leading-6 text-[var(--muted)] shadow-paper">
          Deze tool is een educatieve scenariovergelijking. Toekomstige periodieke
          schenkingen zijn onzeker en worden hier expliciet als stressvariant
          getoond. Fiscale, juridische en acceptatie-afspraken kunnen per jaar en
          per geldverstrekker verschillen.
        </div>
      }
    />
  );
}
