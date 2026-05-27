"use client";

import { useMemo, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ProfileSyncPanel } from "@/components/ProfileSyncPanel";
import { SavedCalculationsList } from "@/components/SavedCalculationsList";
import { Btn } from "@/components/ui";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ENABLE_PROFILE } from "@/lib/feature-flags";
import {
  getDuoSituationLabel,
  getEmploymentTypeLabel,
  getGlossaryExplanation,
  getRepaymentRuleLabel,
} from "@/lib/copy-glossary";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import type {
  Box3MethodPreference,
  EmploymentType,
  HouseholdType,
  PensionBuildUp,
  ProfileDuoSituation,
  ProfileRepaymentRule,
  RiskProfile,
  UserProfile,
} from "@/lib/user-profile";

type ProfileFormState = {
  grossAnnualIncome: string;
  partnerGrossAnnualIncome: string;
  householdType: HouseholdType;
  employmentType: EmploymentType;
  remainingDebt: string;
  currentMonthlyPayment: string;
  statutoryMonthlyPayment: string;
  repaymentRule: ProfileRepaymentRule;
  duoSituation: ProfileDuoSituation;
  duoInterestRate: string;
  remainingTermYears: string;
  targetHomePrice: string;
  ownFunds: string;
  mortgageRate: string;
  mortgageTermYears: string;
  maxMortgageWithoutStudentDebt: string;
  currentSavings: string;
  targetEmergencyFund: string;
  monthlyFreeCashflow: string;
  expectedAnnualReturn: string;
  investmentHorizonYears: string;
  riskProfile: RiskProfile;
  hasAov: boolean;
  pensionBuildUp: PensionBuildUp;
  preferredBox3Method: Box3MethodPreference;
  hasFiscalPartnerTax: boolean;
  preferredTaxYear: string;
};

type ValidationErrors = Partial<Record<keyof ProfileFormState, string>>;

const defaultFormState: ProfileFormState = {
  grossAnnualIncome: "",
  partnerGrossAnnualIncome: "",
  householdType: "unknown",
  employmentType: "unknown",
  remainingDebt: "",
  currentMonthlyPayment: "",
  statutoryMonthlyPayment: "",
  repaymentRule: "UNKNOWN",
  duoSituation: "unknown",
  duoInterestRate: "",
  remainingTermYears: "",
  targetHomePrice: "",
  ownFunds: "",
  mortgageRate: "",
  mortgageTermYears: "",
  maxMortgageWithoutStudentDebt: "",
  currentSavings: "",
  targetEmergencyFund: "",
  monthlyFreeCashflow: "",
  expectedAnnualReturn: "",
  investmentHorizonYears: "",
  riskProfile: "neutral",
  hasAov: false,
  pensionBuildUp: "unknown",
  preferredBox3Method: "actual",
  hasFiscalPartnerTax: false,
  preferredTaxYear: "",
};

const employmentTypeOptions: EmploymentType[] = [
  "unknown",
  "employee",
  "selfEmployed",
  "mixed",
];

const repaymentRuleOptions: ProfileRepaymentRule[] = [
  "SF35",
  "SF15",
  "SF15_OLD",
  "SF15_LLLK",
  "UNKNOWN",
];

const duoSituationOptions: ProfileDuoSituation[] = [
  "repaying",
  "gracePeriod",
  "incomeBasedReduction",
  "paymentPause",
  "unknown",
];

function formatUpdatedAt(value?: string) {
  if (!value) {
    return "Nog niet opgeslagen";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Onbekende datum";
  }

  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function toFormValue(value?: number) {
  return value === undefined ? "" : String(value);
}

function profileToFormState(profile: UserProfile): ProfileFormState {
  return {
    grossAnnualIncome: toFormValue(profile.income?.grossAnnualIncome),
    partnerGrossAnnualIncome: toFormValue(profile.income?.partnerGrossAnnualIncome),
    householdType: profile.income?.householdType ?? "unknown",
    employmentType: profile.income?.employmentType ?? "unknown",
    remainingDebt: toFormValue(profile.studentDebt?.remainingDebt),
    currentMonthlyPayment: toFormValue(profile.studentDebt?.currentMonthlyPayment),
    statutoryMonthlyPayment: toFormValue(
      profile.studentDebt?.statutoryMonthlyPayment,
    ),
    repaymentRule: profile.studentDebt?.repaymentRule ?? "UNKNOWN",
    duoSituation: profile.studentDebt?.duoSituation ?? "unknown",
    duoInterestRate: toFormValue(profile.studentDebt?.duoInterestRate),
    remainingTermYears: toFormValue(profile.studentDebt?.remainingTermYears),
    targetHomePrice: toFormValue(profile.housing?.targetHomePrice),
    ownFunds: toFormValue(profile.housing?.ownFunds),
    mortgageRate: toFormValue(profile.housing?.mortgageRate),
    mortgageTermYears: toFormValue(profile.housing?.mortgageTermYears),
    maxMortgageWithoutStudentDebt: toFormValue(
      profile.housing?.maxMortgageWithoutStudentDebt,
    ),
    currentSavings: toFormValue(profile.savingInvesting?.currentSavings),
    targetEmergencyFund: toFormValue(profile.savingInvesting?.targetEmergencyFund),
    monthlyFreeCashflow: toFormValue(profile.savingInvesting?.monthlyFreeCashflow),
    expectedAnnualReturn: toFormValue(profile.savingInvesting?.expectedAnnualReturn),
    investmentHorizonYears: toFormValue(
      profile.savingInvesting?.investmentHorizonYears,
    ),
    riskProfile: profile.savingInvesting?.riskProfile ?? "neutral",
    hasAov: profile.savingInvesting?.hasAov ?? false,
    pensionBuildUp: profile.savingInvesting?.pensionBuildUp ?? "unknown",
    preferredBox3Method: profile.tax?.preferredBox3Method ?? "actual",
    hasFiscalPartnerTax: profile.tax?.hasFiscalPartner ?? false,
    preferredTaxYear: toFormValue(profile.tax?.preferredTaxYear),
  };
}

function parseOptionalNumber(value: string) {
  return parseOptionalDecimalInput(value);
}

function validateNonNegative(
  key: keyof ProfileFormState,
  value: number | undefined,
  errors: ValidationErrors,
  message: string,
) {
  if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
    errors[key] = message;
  }
}

function validatePositive(
  key: keyof ProfileFormState,
  value: number | undefined,
  errors: ValidationErrors,
  message: string,
) {
  if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
    errors[key] = message;
  }
}

function formStateToProfile(formValues: ProfileFormState) {
  const errors: ValidationErrors = {};

  const grossAnnualIncome = parseOptionalNumber(formValues.grossAnnualIncome);
  const partnerGrossAnnualIncome = parseOptionalNumber(
    formValues.partnerGrossAnnualIncome,
  );
  const remainingDebt = parseOptionalNumber(formValues.remainingDebt);
  const currentMonthlyPayment = parseOptionalNumber(formValues.currentMonthlyPayment);
  const statutoryMonthlyPayment = parseOptionalNumber(
    formValues.statutoryMonthlyPayment,
  );
  const duoInterestRate = parseOptionalNumber(formValues.duoInterestRate);
  const remainingTermYears = parseOptionalNumber(formValues.remainingTermYears);
  const targetHomePrice = parseOptionalNumber(formValues.targetHomePrice);
  const ownFunds = parseOptionalNumber(formValues.ownFunds);
  const mortgageRate = parseOptionalNumber(formValues.mortgageRate);
  const mortgageTermYears = parseOptionalNumber(formValues.mortgageTermYears);
  const maxMortgageWithoutStudentDebt = parseOptionalNumber(
    formValues.maxMortgageWithoutStudentDebt,
  );
  const currentSavings = parseOptionalNumber(formValues.currentSavings);
  const targetEmergencyFund = parseOptionalNumber(formValues.targetEmergencyFund);
  const monthlyFreeCashflow = parseOptionalNumber(formValues.monthlyFreeCashflow);
  const expectedAnnualReturn = parseOptionalNumber(formValues.expectedAnnualReturn);
  const investmentHorizonYears = parseOptionalNumber(
    formValues.investmentHorizonYears,
  );
  const preferredTaxYear = parseOptionalNumber(formValues.preferredTaxYear);
  const hasSavingNumbers =
    currentSavings !== undefined ||
    targetEmergencyFund !== undefined ||
    monthlyFreeCashflow !== undefined ||
    expectedAnnualReturn !== undefined ||
    investmentHorizonYears !== undefined;
  const hasTaxPreferences =
    formValues.preferredBox3Method !== "actual" ||
    formValues.hasFiscalPartnerTax ||
    preferredTaxYear !== undefined;

  validateNonNegative(
    "grossAnnualIncome",
    grossAnnualIncome,
    errors,
    "Gebruik 0 of een hoger bruto jaarinkomen.",
  );
  validateNonNegative(
    "partnerGrossAnnualIncome",
    partnerGrossAnnualIncome,
    errors,
    "Gebruik 0 of een hoger partnerinkomen.",
  );
  validateNonNegative(
    "remainingDebt",
    remainingDebt,
    errors,
    "Gebruik 0 of een hogere resterende studieschuld.",
  );
  validateNonNegative(
    "currentMonthlyPayment",
    currentMonthlyPayment,
    errors,
    "Gebruik 0 of een hoger DUO-maandbedrag.",
  );
  validateNonNegative(
    "statutoryMonthlyPayment",
    statutoryMonthlyPayment,
    errors,
    "Gebruik 0 of een hoger wettelijk DUO-maandbedrag.",
  );
  validateNonNegative(
    "targetHomePrice",
    targetHomePrice,
    errors,
    "Gebruik 0 of een hogere woningprijs.",
  );
  validateNonNegative(
    "ownFunds",
    ownFunds,
    errors,
    "Gebruik 0 of een hoger bedrag aan eigen geld.",
  );
  validateNonNegative(
    "maxMortgageWithoutStudentDebt",
    maxMortgageWithoutStudentDebt,
    errors,
    "Gebruik 0 of een hogere maximale hypotheek.",
  );
  validateNonNegative(
    "currentSavings",
    currentSavings,
    errors,
    "Gebruik 0 of een hoger bedrag aan spaargeld.",
  );
  validateNonNegative(
    "targetEmergencyFund",
    targetEmergencyFund,
    errors,
    "Gebruik 0 of een hogere minimale buffer.",
  );
  validateNonNegative(
    "monthlyFreeCashflow",
    monthlyFreeCashflow,
    errors,
    "Gebruik 0 of een hogere maandelijkse vrije ruimte.",
  );

  if (
    duoInterestRate !== undefined &&
    (!Number.isFinite(duoInterestRate) || duoInterestRate < 0 || duoInterestRate > 100)
  ) {
    errors.duoInterestRate = "Gebruik een rentepercentage tussen 0 en 100.";
  }

  if (
    mortgageRate !== undefined &&
    (!Number.isFinite(mortgageRate) || mortgageRate < 0 || mortgageRate > 100)
  ) {
    errors.mortgageRate = "Gebruik een rentepercentage tussen 0 en 100.";
  }

  if (
    expectedAnnualReturn !== undefined &&
    (!Number.isFinite(expectedAnnualReturn) ||
      expectedAnnualReturn < 0 ||
      expectedAnnualReturn > 100)
  ) {
    errors.expectedAnnualReturn =
      "Gebruik een verwacht rendement tussen 0 en 100.";
  }

  validatePositive(
    "remainingTermYears",
    remainingTermYears,
    errors,
    "Gebruik een resterende looptijd groter dan 0.",
  );
  validatePositive(
    "mortgageTermYears",
    mortgageTermYears,
    errors,
    "Gebruik een hypotheeklooptijd groter dan 0.",
  );
  validatePositive(
    "investmentHorizonYears",
    investmentHorizonYears,
    errors,
    "Gebruik een beleggingshorizon groter dan 0.",
  );
  if (
    preferredTaxYear !== undefined &&
    (!Number.isFinite(preferredTaxYear) ||
      preferredTaxYear < 2000 ||
      preferredTaxYear > 2200)
  ) {
    errors.preferredTaxYear = "Gebruik een jaartal tussen 2000 en 2200.";
  }

  const profile: UserProfile | null =
    Object.keys(errors).length === 0
      ? {
          income: {
            grossAnnualIncome,
            partnerGrossAnnualIncome,
            householdType:
              formValues.householdType === "unknown"
                ? undefined
                : formValues.householdType,
            employmentType:
              formValues.employmentType === "unknown"
                ? undefined
                : formValues.employmentType,
          },
          studentDebt: {
            remainingDebt,
            currentMonthlyPayment,
            statutoryMonthlyPayment,
            repaymentRule:
              formValues.repaymentRule === "UNKNOWN"
                ? undefined
                : formValues.repaymentRule,
            duoSituation:
              formValues.duoSituation === "unknown"
                ? undefined
                : formValues.duoSituation,
            duoInterestRate,
            remainingTermYears,
          },
          housing: {
            targetHomePrice,
            ownFunds,
            mortgageRate,
            mortgageTermYears,
            maxMortgageWithoutStudentDebt,
          },
          savingInvesting: {
            currentSavings,
            targetEmergencyFund,
            monthlyFreeCashflow,
            expectedAnnualReturn,
            investmentHorizonYears,
            riskProfile:
              hasSavingNumbers || formValues.riskProfile !== "neutral"
                ? formValues.riskProfile
                : undefined,
            hasAov: formValues.hasAov ? true : undefined,
            pensionBuildUp:
              formValues.pensionBuildUp === "unknown"
                ? undefined
                : formValues.pensionBuildUp,
          },
          tax: {
            preferredBox3Method:
              hasTaxPreferences || formValues.preferredBox3Method !== "actual"
                ? formValues.preferredBox3Method
                : undefined,
            hasFiscalPartner: formValues.hasFiscalPartnerTax ? true : undefined,
            preferredTaxYear,
          },
        }
      : null;

  return {
    errors,
    profile,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-700">{message}</p>;
}

export default function ProfilePage() {
  const { profile, hasProfile, saveProfile, clearProfile } = useUserProfile();
  const [saveMessage, setSaveMessage] = useState("");

  if (!ENABLE_PROFILE) {
    return (
      <>
        <SiteHeader />
        <main
          id="main-content"
          className="page-shell min-h-[100dvh] max-w-3xl pb-10 pt-8 lg:pb-14"
        >
          <section className="grid gap-4 rounded-[1.5rem] border hair bg-white/80 p-6 shadow-paper">
            <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Mijn profiel
            </div>
            <h1 className="mt-2 font-serif text-[34px] tracking-[-0.02em] text-[var(--ink)]">
              Profielfunctie staat tijdelijk uit
            </h1>
            <p className="text-[14.5px] leading-[1.7] text-[var(--ink-2)]">
              Deze functie is bewust tijdelijk uitgeschakeld. Je kunt alle tools
              blijven gebruiken met handmatige invoer of voorbeeldwaarden.
            </p>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }
  const formKey = profile.updatedAt ?? (hasProfile ? "profile-present" : "profile-empty");

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="page-shell min-h-[100dvh] max-w-4xl pb-10 pt-8 lg:pb-14"
      >
        <section className="grid gap-4 rounded-[1.5rem] border hair bg-white/80 p-6 shadow-paper">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Mijn profiel
            </div>
            <h1 className="mt-2 font-serif text-[34px] tracking-[-0.02em] text-[var(--ink)]">
              Vul je basisgegevens één keer in
            </h1>
            <p className="mt-3 max-w-[62ch] text-[14.5px] leading-[1.7] text-[var(--ink-2)]">
              Gebruik je vaak meerdere rekentools? Dan hoef je niet steeds opnieuw
              je inkomen, DUO-gegevens of woningdoel in te vullen. Dit profiel vult
              relevante tools automatisch voor waar dat logisch is.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            Je profiel wordt alleen lokaal in deze browser opgeslagen. Er wordt niets
            naar een server gestuurd. Gebruik je een andere browser of wis je
            browsergegevens, dan ben je dit profiel kwijt.
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-[var(--muted)]">
            <span>Laatst bijgewerkt: {formatUpdatedAt(profile.updatedAt)}</span>
            <span>{hasProfile ? "Profiel aanwezig" : "Nog geen opgeslagen profiel"}</span>
          </div>
        </section>

        <ProfileEditor
          key={formKey}
          initialValues={profileToFormState(profile)}
          saveMessage={saveMessage}
          onSaveMessageChange={setSaveMessage}
          onSave={saveProfile}
          onClear={clearProfile}
        />
        <ProfileSyncPanel />
        <SavedCalculationsList />
      </main>
      <SiteFooter />
    </>
  );
}

type ProfileEditorProps = {
  initialValues: ProfileFormState;
  saveMessage: string;
  onSaveMessageChange: (message: string) => void;
  onSave: (profile: UserProfile) => UserProfile;
  onClear: () => void;
};

function ProfileEditor({
  initialValues,
  saveMessage,
  onSaveMessageChange,
  onSave,
  onClear,
}: ProfileEditorProps) {
  const [formValues, setFormValues] = useState<ProfileFormState>(initialValues);
  const profileSteps = [
    "Inkomen",
    "Studieschuld",
    "Wonen",
    "Sparen & beleggen",
    "Belasting",
  ] as const;
  const [activeStep, setActiveStep] = useState(0);
  const { errors, profile: parsedProfile } = useMemo(
    () => formStateToProfile(formValues),
    [formValues],
  );

  function updateField<K extends keyof ProfileFormState>(
    field: K,
    value: ProfileFormState[K],
  ) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
    onSaveMessageChange("");
  }

  function handleSave() {
    if (!parsedProfile) {
      onSaveMessageChange("Controleer eerst de velden met een foutmelding.");
      return;
    }

    try {
      const savedProfile = onSave(parsedProfile);
      setFormValues(profileToFormState(savedProfile));
      onSaveMessageChange("Profiel lokaal opgeslagen in deze browser.");
    } catch {
      onSaveMessageChange(
        "Opslaan is niet gelukt. Controleer of lokale opslag in je browser is toegestaan.",
      );
    }
  }

  function handleClear() {
    onClear();
    setFormValues(defaultFormState);
    onSaveMessageChange("Profiel uit deze browser verwijderd.");
  }

  function goToPreviousStep() {
    setActiveStep((current) => Math.max(0, current - 1));
  }

  function goToNextStep() {
    setActiveStep((current) => Math.min(profileSteps.length - 1, current + 1));
  }

  return (
    <>
      <section className="mt-6 space-y-6">
          <div className="rounded-[1.5rem] border hair bg-white p-4 shadow-paper">
            <div className="flex items-center justify-between gap-3 text-[12px] text-[var(--muted)]">
              <span>
                Stap {activeStep + 1} van {profileSteps.length}
              </span>
              <span>{profileSteps[activeStep]}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[var(--paper-soft)]">
              <div
                className="h-2 rounded-full bg-[var(--accent)] transition-all"
                style={{
                  width: `${((activeStep + 1) / profileSteps.length) * 100}%`,
                }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {profileSteps.map((step, index) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`rounded-full border px-3 py-2 text-[12px] transition ${
                    index === activeStep
                      ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                      : "border-[var(--hair)] bg-white text-[var(--ink)] hover:bg-[var(--paper-soft)]"
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>

          {activeStep === 0 ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Persoonlijk en inkomen
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Bruto jaarinkomen gebruiker
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.grossAnnualIncome}
                  onChange={(event) =>
                    updateField("grossAnnualIncome", event.target.value)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.grossAnnualIncome} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Bruto jaarinkomen partner
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.partnerGrossAnnualIncome}
                  onChange={(event) =>
                    updateField("partnerGrossAnnualIncome", event.target.value)
                  }
                  placeholder="Optioneel"
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.partnerGrossAnnualIncome} />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Huishoudenstype
                </span>
                <select
                  value={formValues.householdType}
                  onChange={(event) =>
                    updateField("householdType", event.target.value as HouseholdType)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
                >
                  <option value="unknown">Onbekend / nog niet ingevuld</option>
                  <option value="single">Alleenstaand</option>
                  <option value="withPartner">Met partner</option>
                  <option value="family">Gezin</option>
                </select>
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Werksituatie
                </span>
                <select
                  value={formValues.employmentType}
                  onChange={(event) =>
                    updateField("employmentType", event.target.value as EmploymentType)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
                >
                  {employmentTypeOptions.map((value) => (
                    <option key={value} value={value}>
                      {getEmploymentTypeLabel(value)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          ) : null}

          {activeStep === 1 ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Studieschuld en DUO
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Resterende studieschuld
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.remainingDebt}
                  onChange={(event) => updateField("remainingDebt", event.target.value)}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.remainingDebt} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Huidig DUO-maandbedrag
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.currentMonthlyPayment}
                  onChange={(event) =>
                    updateField("currentMonthlyPayment", event.target.value)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.currentMonthlyPayment} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Wettelijk DUO-maandbedrag
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.statutoryMonthlyPayment}
                  onChange={(event) =>
                    updateField("statutoryMonthlyPayment", event.target.value)
                  }
                  placeholder="Optioneel"
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.statutoryMonthlyPayment} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Terugbetalingsregel
                </span>
                <select
                  value={formValues.repaymentRule}
                  onChange={(event) =>
                    updateField(
                      "repaymentRule",
                      event.target.value as ProfileRepaymentRule,
                    )
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
                >
                  {repaymentRuleOptions.map((value) => (
                    <option key={value} value={value}>
                      {getRepaymentRuleLabel(value)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  DUO-rentepercentage
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.duoInterestRate}
                  onChange={(event) =>
                    updateField("duoInterestRate", event.target.value)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.duoInterestRate} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Resterende looptijd
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.remainingTermYears}
                  onChange={(event) =>
                    updateField("remainingTermYears", event.target.value)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.remainingTermYears} />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  DUO-situatie
                </span>
                <select
                  value={formValues.duoSituation}
                  onChange={(event) =>
                    updateField(
                      "duoSituation",
                      event.target.value as ProfileDuoSituation,
                    )
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
                >
                  {duoSituationOptions.map((value) => (
                    <option key={value} value={value}>
                      {getDuoSituationLabel(value)}
                    </option>
                  ))}
                </select>
                <p className="text-[12px] leading-[1.5] text-[var(--muted)]">
                  {getGlossaryExplanation("draagkracht")}{" "}
                  {getGlossaryExplanation("aflossingsvrijePeriode")}
                </p>
              </label>
            </div>
          </div>
          ) : null}

          {activeStep === 2 ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Wonen
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Gewenste woningprijs
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.targetHomePrice}
                  onChange={(event) =>
                    updateField("targetHomePrice", event.target.value)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.targetHomePrice} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Eigen geld
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.ownFunds}
                  onChange={(event) => updateField("ownFunds", event.target.value)}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.ownFunds} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Hypotheekrentepercentage
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.mortgageRate}
                  onChange={(event) => updateField("mortgageRate", event.target.value)}
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.mortgageRate} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Hypotheeklooptijd
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.mortgageTermYears}
                  onChange={(event) =>
                    updateField("mortgageTermYears", event.target.value)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.mortgageTermYears} />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Maximale hypotheek zonder studieschuld
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.maxMortgageWithoutStudentDebt}
                  onChange={(event) =>
                    updateField(
                      "maxMortgageWithoutStudentDebt",
                      event.target.value,
                    )
                  }
                  placeholder="Volgens adviseur of rekenhulp"
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.maxMortgageWithoutStudentDebt} />
              </label>
            </div>
          </div>
          ) : null}

          {activeStep === 3 ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Sparen en beleggen
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Huidige buffer / spaargeld
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.currentSavings}
                  onChange={(event) =>
                    updateField("currentSavings", event.target.value)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.currentSavings} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Gewenste minimale buffer
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.targetEmergencyFund}
                  onChange={(event) =>
                    updateField("targetEmergencyFund", event.target.value)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.targetEmergencyFund} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Maandelijkse vrije ruimte
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.monthlyFreeCashflow}
                  onChange={(event) =>
                    updateField("monthlyFreeCashflow", event.target.value)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.monthlyFreeCashflow} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Verwacht jaarlijks rendement
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.expectedAnnualReturn}
                  onChange={(event) =>
                    updateField("expectedAnnualReturn", event.target.value)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.expectedAnnualReturn} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Beleggingshorizon in jaren
                </span>
                <input
                  inputMode="decimal"
                  value={formValues.investmentHorizonYears}
                  onChange={(event) =>
                    updateField("investmentHorizonYears", event.target.value)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.investmentHorizonYears} />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Risicoprofiel
                </span>
                <select
                  value={formValues.riskProfile}
                  onChange={(event) =>
                    updateField("riskProfile", event.target.value as RiskProfile)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
                >
                  <option value="conservative">Voorzichtig</option>
                  <option value="neutral">Neutraal</option>
                  <option value="offensive">Offensief</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Arbeidsongeschiktheidsverzekering (AOV)
                </span>
                <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
                  <input
                    type="checkbox"
                    checked={formValues.hasAov}
                    onChange={(event) => updateField("hasAov", event.target.checked)}
                    className="size-4 accent-[var(--accent)]"
                  />
                  Ja, ik houd rekening met AOV in mijn planning
                </span>
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Pensioenopbouw
                </span>
                <select
                  value={formValues.pensionBuildUp}
                  onChange={(event) =>
                    updateField("pensionBuildUp", event.target.value as PensionBuildUp)
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
                >
                  <option value="unknown">Onbekend / nog niet ingevuld</option>
                  <option value="active">Actief via werkgever of regeling</option>
                  <option value="limited">Beperkt of onregelmatig</option>
                  <option value="none">Nog geen opbouw</option>
                </select>
              </label>
            </div>
          </div>
          ) : null}

          {activeStep === 4 ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h2 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Belastingvoorkeuren
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Box 3-methode (default in tools)
                </span>
                <select
                  value={formValues.preferredBox3Method}
                  onChange={(event) =>
                    updateField(
                      "preferredBox3Method",
                      event.target.value as Box3MethodPreference,
                    )
                  }
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"
                >
                  <option value="actual">Werkelijk rendement (default)</option>
                  <option value="forfaitary">Forfaitair rendement</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Fiscale partner voor box 3
                </span>
                <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
                  <input
                    type="checkbox"
                    checked={formValues.hasFiscalPartnerTax}
                    onChange={(event) =>
                      updateField("hasFiscalPartnerTax", event.target.checked)
                    }
                    className="size-4 accent-[var(--accent)]"
                  />
                  Ja, reken standaard met partnervrijstelling
                </span>
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Voorkeursjaar belastingaannames
                </span>
                <input
                  inputMode="numeric"
                  value={formValues.preferredTaxYear}
                  onChange={(event) => updateField("preferredTaxYear", event.target.value)}
                  placeholder="Bijvoorbeeld 2026"
                  className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
                />
                <FieldError message={errors.preferredTaxYear} />
              </label>
            </div>
          </div>
          ) : null}
        </section>

        <section className="mt-6 rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Btn type="button" kind="outline" onClick={goToPreviousStep}>
              Vorige stap
            </Btn>
            <Btn type="button" kind="outline" onClick={goToNextStep}>
              Volgende stap
            </Btn>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Btn type="button" onClick={handleSave}>
              Profiel opslaan
            </Btn>
            <Btn type="button" kind="outline" onClick={handleClear}>
              Profiel wissen
            </Btn>
          </div>
          {saveMessage ? (
            <p className="mt-4 text-[13.5px] leading-[1.65] text-[var(--muted)]">
              {saveMessage}
            </p>
          ) : null}
        </section>
    </>
  );
}
