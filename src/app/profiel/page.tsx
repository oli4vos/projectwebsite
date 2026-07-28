"use client";

import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { DuoDebtPartsEditor } from "@/components/duo/DuoDebtPartsEditor";
import { FieldError } from "@/components/forms/FieldError";
import { ProfileSyncPanel } from "@/components/ProfileSyncPanel";
import { SavedCalculationsList } from "@/components/SavedCalculationsList";
import { SavedScenarioComparison } from "@/components/SavedScenarioComparison";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Btn } from "@/components/ui";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  getDuoSituationLabel,
  getEmploymentTypeLabel,
  getGlossaryExplanation,
  getRepaymentRuleLabel,
} from "@/lib/copy-glossary";
import { ENABLE_PROFILE } from "@/lib/feature-flags";
import {
  formatDuoRateYearLabel,
  getAvailableDuoRateYears,
  getDuoHistoricalRateYearForRule,
  getDuoRateForRule,
} from "@/lib/financial-constants";
import {
  createDefaultDuoDebtPartFormValues,
  createDuoDebtPartFormValue,
  validateDuoDebtPartFormValues,
  type DuoDebtPartFormValue,
} from "@/lib/duo/debt-parts-form";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import type { ProfileRetention } from "@/lib/storage/profile-retention";
import type {
  EmploymentType,
  HouseholdType,
  ProfileDuoSituation,
  ProfileRepaymentRule,
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
  mortgageAssessmentMonthlyPayment: string;
  repaymentRule: ProfileRepaymentRule;
  duoSituation: ProfileDuoSituation;
  duoRateYear: string;
  remainingTermYears: string;
  useDebtParts: boolean;
  debtParts: DuoDebtPartFormValue[];
  targetHomePrice: string;
  ownFunds: string;
  mortgageRate: string;
  mortgageTermYears: string;
  maxMortgageWithoutStudentDebt: string;
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
  mortgageAssessmentMonthlyPayment: "",
  repaymentRule: "UNKNOWN",
  duoSituation: "unknown",
  duoRateYear: "",
  remainingTermYears: "",
  useDebtParts: false,
  debtParts: createDefaultDuoDebtPartFormValues(),
  targetHomePrice: "",
  ownFunds: "",
  mortgageRate: "",
  mortgageTermYears: "",
  maxMortgageWithoutStudentDebt: "",
};

const profileSteps = ["Inkomen", "Studieschuld", "Wonen"] as const;

const profileStepByField: Record<keyof ProfileFormState, number> = {
  grossAnnualIncome: 0,
  partnerGrossAnnualIncome: 0,
  householdType: 0,
  employmentType: 0,
  remainingDebt: 1,
  currentMonthlyPayment: 1,
  statutoryMonthlyPayment: 1,
  mortgageAssessmentMonthlyPayment: 1,
  repaymentRule: 1,
  duoSituation: 1,
  duoRateYear: 1,
  remainingTermYears: 1,
  useDebtParts: 1,
  debtParts: 1,
  targetHomePrice: 2,
  ownFunds: 2,
  mortgageRate: 2,
  mortgageTermYears: 2,
  maxMortgageWithoutStudentDebt: 2,
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
  const repaymentRule = profile.studentDebt?.repaymentRule ?? "UNKNOWN";
  const inferredRateYear =
    repaymentRule === "UNKNOWN"
      ? undefined
      : getDuoHistoricalRateYearForRule(
          repaymentRule,
          profile.studentDebt?.duoInterestRate,
        );
  const storedRateYear = profile.studentDebt?.duoRateYear;
  const duoRateYear =
    storedRateYear !== undefined &&
    getAvailableDuoRateYears().includes(storedRateYear)
      ? storedRateYear
      : inferredRateYear;
  const debtParts =
    profile.studentDebt?.debtParts?.map((part, index) => ({
      id: `profile-duo-debt-part-${index + 1}`,
      amount: String(part.remainingDebt),
      rateYear: String(part.rateYear),
    })) ?? [];

  return {
    grossAnnualIncome: toFormValue(profile.income?.grossAnnualIncome),
    partnerGrossAnnualIncome: toFormValue(
      profile.income?.partnerGrossAnnualIncome,
    ),
    householdType: profile.income?.householdType ?? "unknown",
    employmentType: profile.income?.employmentType ?? "unknown",
    remainingDebt: toFormValue(profile.studentDebt?.remainingDebt),
    currentMonthlyPayment: toFormValue(
      profile.studentDebt?.currentMonthlyPayment,
    ),
    statutoryMonthlyPayment: toFormValue(
      profile.studentDebt?.statutoryMonthlyPayment,
    ),
    mortgageAssessmentMonthlyPayment: toFormValue(
      profile.studentDebt?.mortgageAssessmentMonthlyPayment,
    ),
    repaymentRule,
    duoSituation: profile.studentDebt?.duoSituation ?? "unknown",
    duoRateYear: toFormValue(duoRateYear),
    remainingTermYears: toFormValue(profile.studentDebt?.remainingTermYears),
    useDebtParts: debtParts.length > 0,
    debtParts:
      debtParts.length > 0 ? debtParts : createDefaultDuoDebtPartFormValues(),
    targetHomePrice: toFormValue(profile.housing?.targetHomePrice),
    ownFunds: toFormValue(profile.housing?.ownFunds),
    mortgageRate: toFormValue(profile.housing?.mortgageRate),
    mortgageTermYears: toFormValue(profile.housing?.mortgageTermYears),
    maxMortgageWithoutStudentDebt: toFormValue(
      profile.housing?.maxMortgageWithoutStudentDebt,
    ),
  };
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
  const grossAnnualIncome = parseOptionalDecimalInput(
    formValues.grossAnnualIncome,
  );
  const partnerGrossAnnualIncome = parseOptionalDecimalInput(
    formValues.partnerGrossAnnualIncome,
  );
  const remainingDebt = parseOptionalDecimalInput(formValues.remainingDebt);
  const currentMonthlyPayment = parseOptionalDecimalInput(
    formValues.currentMonthlyPayment,
  );
  const statutoryMonthlyPayment = parseOptionalDecimalInput(
    formValues.statutoryMonthlyPayment,
  );
  const mortgageAssessmentMonthlyPayment = parseOptionalDecimalInput(
    formValues.mortgageAssessmentMonthlyPayment,
  );
  const duoRateYear =
    formValues.duoRateYear.trim().length > 0
      ? Number.parseInt(formValues.duoRateYear, 10)
      : undefined;
  const remainingTermYears = parseOptionalDecimalInput(
    formValues.remainingTermYears,
  );
  const targetHomePrice = parseOptionalDecimalInput(
    formValues.targetHomePrice,
  );
  const ownFunds = parseOptionalDecimalInput(formValues.ownFunds);
  const mortgageRate = parseOptionalDecimalInput(formValues.mortgageRate);
  const mortgageTermYears = parseOptionalDecimalInput(
    formValues.mortgageTermYears,
  );
  const maxMortgageWithoutStudentDebt = parseOptionalDecimalInput(
    formValues.maxMortgageWithoutStudentDebt,
  );
  const debtPartsValidation = validateDuoDebtPartFormValues(formValues.debtParts);

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
    "mortgageAssessmentMonthlyPayment",
    mortgageAssessmentMonthlyPayment,
    errors,
    "Gebruik 0 of een hoger maandbedrag voor de hypotheektoets.",
  );
  if (
    formValues.useDebtParts &&
    (Object.keys(debtPartsValidation.errorsById).length > 0 ||
      debtPartsValidation.sanitizedParts.length === 0)
  ) {
    errors.debtParts =
      debtPartsValidation.sanitizedParts.length === 0
        ? "Voeg minimaal één geldig leningdeel toe."
        : "Controleer de leningdelen met een foutmelding.";
  }
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

  if (
    duoRateYear !== undefined &&
    !getAvailableDuoRateYears().includes(duoRateYear)
  ) {
    errors.duoRateYear = "Kies een beschikbaar DUO-rentejaar.";
  }

  if (
    mortgageRate !== undefined &&
    (!Number.isFinite(mortgageRate) ||
      mortgageRate < 0 ||
      mortgageRate > 100)
  ) {
    errors.mortgageRate = "Gebruik een rentepercentage tussen 0 en 100.";
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

  const profile: Pick<UserProfile, "income" | "studentDebt" | "housing"> | null =
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
            remainingDebt: formValues.useDebtParts
              ? debtPartsValidation.totalDebt
              : remainingDebt,
            currentMonthlyPayment,
            statutoryMonthlyPayment,
            mortgageAssessmentMonthlyPayment,
            repaymentRule:
              formValues.repaymentRule === "UNKNOWN"
                ? undefined
                : formValues.repaymentRule,
            duoSituation:
              formValues.duoSituation === "unknown"
                ? undefined
                : formValues.duoSituation,
            duoRateYear,
            duoInterestRate:
              duoRateYear !== undefined &&
              formValues.repaymentRule !== "UNKNOWN"
                ? getDuoRateForRule(formValues.repaymentRule, duoRateYear)
                : undefined,
            remainingTermYears,
            debtParts: formValues.useDebtParts
              ? debtPartsValidation.sanitizedParts.map((part) => ({
                  remainingDebt: part.remainingDebt ?? 0,
                  rateYear: part.rateYear ?? 0,
                }))
              : undefined,
          },
          housing: {
            targetHomePrice,
            ownFunds,
            mortgageRate,
            mortgageTermYears,
            maxMortgageWithoutStudentDebt,
          },
        }
      : null;

  return {
    errors,
    profile,
    debtPartErrors: debtPartsValidation.errorsById,
    debtPartsTotal: debtPartsValidation.totalDebt,
  };
}

function TextField({
  field,
  label,
  value,
  error,
  hint,
  placeholder,
  readOnly = false,
  onChange,
}: {
  field: keyof ProfileFormState;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
}) {
  const id = `profile-${field}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]"
      >
        {label}
      </label>
      <input
        id={id}
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        className="ring-focus hair h-12 min-w-0 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none read-only:bg-[var(--paper-soft)]"
      />
      {hint ? (
        <p id={hintId} className="text-[12px] leading-[1.5] text-[var(--muted)]">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function SelectField<T extends string>({
  field,
  label,
  value,
  options,
  hint,
  error,
  disabled = false,
  onChange,
}: {
  field: keyof ProfileFormState;
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  hint?: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  const id = `profile-${field}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as T)}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        className="ring-focus hair h-12 min-w-0 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none disabled:cursor-not-allowed disabled:bg-[var(--paper-soft)] disabled:text-[var(--muted)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p id={hintId} className="text-[12px] leading-[1.5] text-[var(--muted)]">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function StorageChoice({
  retention,
  onChange,
}: {
  retention: ProfileRetention;
  onChange: (retention: ProfileRetention) => void;
}) {
  return (
    <fieldset className="border-t border-[var(--hair)] pt-4">
      <legend className="text-[13px] font-semibold text-[var(--ink)]">
        Hoe lang mogen je gegevens blijven staan?
      </legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <StorageOption
          value="session"
          checked={retention === "session"}
          title="Alleen dit bezoek"
          description="Verdwijnt wanneer je deze browsersessie sluit."
          onChange={onChange}
        />
        <StorageOption
          value="device"
          checked={retention === "device"}
          title="Op dit apparaat"
          description="Blijft staan totdat je het profiel zelf wist."
          onChange={onChange}
        />
      </div>
    </fieldset>
  );
}

function StorageOption({
  value,
  checked,
  title,
  description,
  onChange,
}: {
  value: ProfileRetention;
  checked: boolean;
  title: string;
  description: string;
  onChange: (retention: ProfileRetention) => void;
}) {
  return (
    <label className="flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border border-[var(--hair)] bg-white px-4 py-3">
      <input
        type="radio"
        name="profile-retention"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
      />
      <span>
        <span className="block text-[13px] font-semibold text-[var(--ink)]">
          {title}
        </span>
        <span className="mt-1 block text-[12px] leading-[1.5] text-[var(--muted)]">
          {description}
        </span>
      </span>
    </label>
  );
}

export default function ProfilePage() {
  const {
    profile,
    hasProfile,
    retention,
    saveProfile,
    clearProfile,
    setRetention,
  } = useUserProfile();
  const [saveMessage, setSaveMessage] = useState("");

  if (!ENABLE_PROFILE) {
    return (
      <>
        <SiteHeader />
        <main
          id="main-content"
          className="page-shell min-h-[100dvh] max-w-3xl pb-10 pt-8 lg:pb-14"
        >
          <section className="surface-panel p-6">
            <h1 className="font-serif text-[34px] text-[var(--ink)]">
              Profielfunctie staat tijdelijk uit
            </h1>
            <p className="mt-3 text-[14.5px] leading-[1.7] text-[var(--ink-2)]">
              Je kunt alle tools blijven gebruiken met handmatige invoer.
            </p>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  const formKey = `${retention}-${profile.updatedAt ?? (hasProfile ? "present" : "empty")}`;

  function handleRetentionChange(nextRetention: ProfileRetention) {
    setRetention(nextRetention);
    setSaveMessage(
      nextRetention === "session"
        ? "Je profiel wordt nu alleen tijdens deze browsersessie bewaard."
        : "Je profiel blijft nu op dit apparaat staan totdat je het wist.",
    );
  }

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="page-shell min-h-[100dvh] max-w-4xl pb-10 pt-8 lg:pb-14"
      >
        <section className="surface-panel grid gap-5 p-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Mijn gegevens
            </div>
            <h1 className="mt-2 font-serif text-[34px] text-[var(--ink)]">
              Vul je basisgegevens één keer in
            </h1>
            <p className="mt-3 max-w-[62ch] text-[14.5px] leading-[1.7] text-[var(--ink-2)]">
              Relevante tools nemen deze gegevens automatisch over. Je controleert
              de ingevulde velden altijd zelf voordat je een berekening start.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            Alles blijft in deze browser. We sturen je profiel niet naar een
            server. Sla hier geen BSN, documenten of inloggegevens op.
          </div>

          <StorageChoice
            retention={retention}
            onChange={handleRetentionChange}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-[var(--muted)]">
            <span>Laatst bijgewerkt: {formatUpdatedAt(profile.updatedAt)}</span>
            <span>
              {hasProfile
                ? retention === "session"
                  ? "Tijdelijk profiel actief"
                  : "Profiel op dit apparaat actief"
                : "Nog geen opgeslagen profiel"}
            </span>
          </div>
        </section>

        <ProfileEditor
          key={formKey}
          existingProfile={profile}
          initialValues={profileToFormState(profile)}
          retention={retention}
          saveMessage={saveMessage}
          onSaveMessageChange={setSaveMessage}
          onSave={saveProfile}
          onClear={clearProfile}
        />
        <ProfileSyncPanel />
        <SavedCalculationsList />
        <SavedScenarioComparison />
      </main>
      <SiteFooter />
    </>
  );
}

type ProfileEditorProps = {
  existingProfile: UserProfile;
  initialValues: ProfileFormState;
  retention: ProfileRetention;
  saveMessage: string;
  onSaveMessageChange: (message: string) => void;
  onSave: (profile: UserProfile) => UserProfile;
  onClear: () => void;
};

function ProfileEditor({
  existingProfile,
  initialValues,
  retention,
  saveMessage,
  onSaveMessageChange,
  onSave,
  onClear,
}: ProfileEditorProps) {
  const [formValues, setFormValues] = useState(initialValues);
  const [activeStep, setActiveStep] = useState(0);
  const [didSubmitAttempt, setDidSubmitAttempt] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const {
    errors,
    profile: parsedProfile,
    debtPartErrors,
    debtPartsTotal,
  } = useMemo(
    () => formStateToProfile(formValues),
    [formValues],
  );

  function updateField<K extends keyof ProfileFormState>(
    field: K,
    value: ProfileFormState[K],
  ) {
    setFormValues((current) => ({ ...current, [field]: value }));
    onSaveMessageChange("");
  }

  function updateRepaymentRule(value: ProfileRepaymentRule) {
    setFormValues((current) => ({
      ...current,
      repaymentRule: value,
      duoRateYear: value === "UNKNOWN" ? "" : current.duoRateYear,
    }));
    onSaveMessageChange("");
  }

  function toggleDebtParts(enabled: boolean) {
    setFormValues((current) => {
      if (!enabled) {
        const totalDebt =
          validateDuoDebtPartFormValues(current.debtParts).totalDebt;
        return {
          ...current,
          useDebtParts: false,
          remainingDebt:
            totalDebt > 0
              ? String(totalDebt)
              : current.remainingDebt,
        };
      }

      const nextParts =
        current.debtParts.length > 0
          ? current.debtParts
          : createDefaultDuoDebtPartFormValues();

      return {
        ...current,
        useDebtParts: true,
        debtParts: nextParts.map((part, index) =>
          index === 0 &&
          part.amount.trim().length === 0 &&
          current.remainingDebt.trim().length > 0
            ? { ...part, amount: current.remainingDebt }
            : part,
        ),
      };
    });
    onSaveMessageChange("");
  }

  function updateDebtPart(
    id: string,
    field: keyof Pick<DuoDebtPartFormValue, "amount" | "rateYear">,
    value: string,
  ) {
    setFormValues((current) => {
      const debtParts = current.debtParts.map((part) =>
        part.id === id ? { ...part, [field]: value } : part,
      );
      const totalDebt = validateDuoDebtPartFormValues(debtParts).totalDebt;

      return {
        ...current,
        debtParts,
        remainingDebt: totalDebt > 0 ? String(totalDebt) : current.remainingDebt,
      };
    });
    onSaveMessageChange("");
  }

  function addDebtPart() {
    setFormValues((current) => ({
      ...current,
      debtParts: [...current.debtParts, createDuoDebtPartFormValue()],
    }));
    onSaveMessageChange("");
  }

  function removeDebtPart(id: string) {
    setFormValues((current) => {
      const debtParts =
        current.debtParts.length > 1
          ? current.debtParts.filter((part) => part.id !== id)
          : current.debtParts;
      const totalDebt = validateDuoDebtPartFormValues(debtParts).totalDebt;

      return {
        ...current,
        debtParts,
        remainingDebt: totalDebt > 0 ? String(totalDebt) : current.remainingDebt,
      };
    });
    onSaveMessageChange("");
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!parsedProfile) {
      setDidSubmitAttempt(true);
      onSaveMessageChange("Controleer eerst de velden met een foutmelding.");
      const firstError = Object.keys(errors)[0] as
        | keyof ProfileFormState
        | undefined;
      if (firstError) {
        setActiveStep(profileStepByField[firstError]);
      }
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setDidSubmitAttempt(false);
    const savedProfile = onSave({
      ...existingProfile,
      ...parsedProfile,
    });
    setFormValues(profileToFormState(savedProfile));
    onSaveMessageChange(
      retention === "session"
        ? "Tijdelijk profiel opgeslagen voor deze browsersessie."
        : "Profiel opgeslagen op dit apparaat.",
    );
  }

  function handleClear() {
    onClear();
    setFormValues(defaultFormState);
    setActiveStep(0);
    setDidSubmitAttempt(false);
    onSaveMessageChange("Profielgegevens uit deze browser verwijderd.");
  }

  return (
    <form className="mt-6" onSubmit={handleSave} noValidate>
      <section className="space-y-6" aria-labelledby="profile-editor-title">
        <h2 id="profile-editor-title" className="sr-only">
          Profielgegevens
        </h2>

        <div className="surface-panel p-4">
          <div className="flex items-center justify-between gap-3 text-[12px] text-[var(--muted)]">
            <span>
              Stap {activeStep + 1} van {profileSteps.length}
            </span>
            <span>{profileSteps[activeStep]}</span>
          </div>
          <div
            className="mt-3 h-2 rounded-full bg-[var(--paper-soft)]"
            role="progressbar"
            aria-label="Voortgang profiel"
            aria-valuemin={1}
            aria-valuemax={profileSteps.length}
            aria-valuenow={activeStep + 1}
          >
            <div
              className="h-2 rounded-full bg-[var(--accent)] transition-[width] motion-reduce:transition-none"
              style={{
                width: `${((activeStep + 1) / profileSteps.length) * 100}%`,
              }}
            />
          </div>
          <nav className="mt-4 flex flex-wrap gap-2" aria-label="Profielstappen">
            {profileSteps.map((step, index) => (
              <button
                key={step}
                type="button"
                onClick={() => setActiveStep(index)}
                aria-current={index === activeStep ? "step" : undefined}
                className={`min-h-11 rounded-full border px-3 py-2 text-[12px] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 ${
                  index === activeStep
                    ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                    : "border-[var(--hair)] bg-white text-[var(--ink)] hover:bg-[var(--paper-soft)]"
                }`}
              >
                {step}
              </button>
            ))}
          </nav>
        </div>

        {didSubmitAttempt && Object.keys(errors).length > 0 ? (
          <div
            ref={errorSummaryRef}
            tabIndex={-1}
            role="alert"
            className="rounded-lg border border-[var(--neg-soft)] bg-[var(--neg-soft)]/55 px-4 py-3 text-sm text-[oklch(35%_0.13_28)]"
          >
            Controleer de gemarkeerde velden voordat je het profiel opslaat.
          </div>
        ) : null}

        {activeStep === 0 ? (
          <ProfileStep title="Persoonlijk en inkomen">
            <TextField
              field="grossAnnualIncome"
              label="Bruto jaarinkomen"
              value={formValues.grossAnnualIncome}
              error={errors.grossAnnualIncome}
              onChange={(value) => updateField("grossAnnualIncome", value)}
            />
            <TextField
              field="partnerGrossAnnualIncome"
              label="Bruto jaarinkomen partner"
              value={formValues.partnerGrossAnnualIncome}
              error={errors.partnerGrossAnnualIncome}
              placeholder="Optioneel"
              onChange={(value) =>
                updateField("partnerGrossAnnualIncome", value)
              }
            />
            <SelectField
              field="householdType"
              label="Huishouden"
              value={formValues.householdType}
              options={[
                { value: "unknown", label: "Nog niet ingevuld" },
                { value: "single", label: "Alleenstaand" },
                { value: "withPartner", label: "Met partner" },
                { value: "family", label: "Gezin" },
              ]}
              onChange={(value) => updateField("householdType", value)}
            />
            <SelectField
              field="employmentType"
              label="Werksituatie"
              value={formValues.employmentType}
              options={employmentTypeOptions.map((value) => ({
                value,
                label: getEmploymentTypeLabel(value),
              }))}
              onChange={(value) => updateField("employmentType", value)}
            />
          </ProfileStep>
        ) : null}

        {activeStep === 1 ? (
          <ProfileStep title="Studieschuld en DUO">
            <TextField
              field="remainingDebt"
              label="Resterende studieschuld"
              value={formValues.remainingDebt}
              error={errors.remainingDebt}
              hint={
                formValues.useDebtParts
                  ? "Automatisch totaal van de leningdelen hieronder."
                  : undefined
              }
              readOnly={formValues.useDebtParts}
              onChange={(value) => updateField("remainingDebt", value)}
            />
            <TextField
              field="currentMonthlyPayment"
              label="Huidig DUO-maandbedrag"
              value={formValues.currentMonthlyPayment}
              error={errors.currentMonthlyPayment}
              onChange={(value) => updateField("currentMonthlyPayment", value)}
            />
            <TextField
              field="statutoryMonthlyPayment"
              label="Wettelijk DUO-maandbedrag"
              value={formValues.statutoryMonthlyPayment}
              error={errors.statutoryMonthlyPayment}
              hint="Alleen nodig voor sommige hypotheekberekeningen."
              onChange={(value) =>
                updateField("statutoryMonthlyPayment", value)
              }
            />
            <TextField
              field="mortgageAssessmentMonthlyPayment"
              label="Maandbedrag voor hypotheektoets"
              value={formValues.mortgageAssessmentMonthlyPayment}
              error={errors.mortgageAssessmentMonthlyPayment}
              hint="Het rekenbedrag dat een hypotheektool gebruikt; dit kan afwijken van wat DUO incasseert."
              onChange={(value) =>
                updateField("mortgageAssessmentMonthlyPayment", value)
              }
            />
            <SelectField
              field="repaymentRule"
              label="Terugbetalingsregel"
              value={formValues.repaymentRule}
              options={repaymentRuleOptions.map((value) => ({
                value,
                label: getRepaymentRuleLabel(value),
              }))}
              onChange={updateRepaymentRule}
            />
            <SelectField
              field="duoRateYear"
              label="DUO-rentejaar en percentage"
              value={formValues.duoRateYear}
              options={
                formValues.repaymentRule === "UNKNOWN"
                  ? [
                      {
                        value: "",
                        label: "Kies eerst je terugbetalingsregel",
                      },
                    ]
                  : [
                      { value: "", label: "Nog niet ingevuld" },
                      ...getAvailableDuoRateYears().map((year) => ({
                        value: String(year),
                        label: formatDuoRateYearLabel(
                          year,
                          formValues.repaymentRule,
                        ),
                      })),
                    ]
              }
              error={errors.duoRateYear}
              disabled={formValues.repaymentRule === "UNKNOWN"}
              hint="Kies het rentejaar dat in Mijn DUO bij je schuld staat."
              onChange={(value) => updateField("duoRateYear", value)}
            />
            <TextField
              field="remainingTermYears"
              label="Resterende looptijd in jaren"
              value={formValues.remainingTermYears}
              error={errors.remainingTermYears}
              onChange={(value) => updateField("remainingTermYears", value)}
            />
            <div className="md:col-span-2">
              <SelectField
                field="duoSituation"
                label="DUO-situatie"
                value={formValues.duoSituation}
                options={duoSituationOptions.map((value) => ({
                  value,
                  label: getDuoSituationLabel(value),
                }))}
                hint={`${getGlossaryExplanation("draagkracht")} ${getGlossaryExplanation("aflossingsvrijePeriode")}`}
                onChange={(value) => updateField("duoSituation", value)}
              />
            </div>
            <div className="md:col-span-2">
              <DuoDebtPartsEditor
                enabled={formValues.useDebtParts}
                parts={formValues.debtParts}
                totalDebt={debtPartsTotal}
                errorsById={debtPartErrors}
                repaymentRule={formValues.repaymentRule}
                onToggle={toggleDebtParts}
                onPartChange={updateDebtPart}
                onAddPart={addDebtPart}
                onRemovePart={removeDebtPart}
              />
              <FieldError
                id="profile-debtParts-error"
                message={errors.debtParts}
              />
            </div>
          </ProfileStep>
        ) : null}

        {activeStep === 2 ? (
          <ProfileStep title="Wonen">
            <TextField
              field="targetHomePrice"
              label="Gewenste woningprijs"
              value={formValues.targetHomePrice}
              error={errors.targetHomePrice}
              onChange={(value) => updateField("targetHomePrice", value)}
            />
            <TextField
              field="ownFunds"
              label="Eigen geld"
              value={formValues.ownFunds}
              error={errors.ownFunds}
              onChange={(value) => updateField("ownFunds", value)}
            />
            <TextField
              field="mortgageRate"
              label="Hypotheekrentepercentage"
              value={formValues.mortgageRate}
              error={errors.mortgageRate}
              onChange={(value) => updateField("mortgageRate", value)}
            />
            <TextField
              field="mortgageTermYears"
              label="Hypotheeklooptijd in jaren"
              value={formValues.mortgageTermYears}
              error={errors.mortgageTermYears}
              onChange={(value) => updateField("mortgageTermYears", value)}
            />
            <div className="md:col-span-2">
              <TextField
                field="maxMortgageWithoutStudentDebt"
                label="Maximale hypotheek zonder studieschuld"
                value={formValues.maxMortgageWithoutStudentDebt}
                error={errors.maxMortgageWithoutStudentDebt}
                placeholder="Volgens adviseur of rekenhulp"
                onChange={(value) =>
                  updateField("maxMortgageWithoutStudentDebt", value)
                }
              />
            </div>
          </ProfileStep>
        ) : null}
      </section>

      <section className="surface-panel mt-6 p-6" aria-label="Profielacties">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Btn
            type="button"
            kind="outline"
            disabled={activeStep === 0}
            onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
          >
            Vorige stap
          </Btn>
          <Btn
            type="button"
            kind="outline"
            disabled={activeStep === profileSteps.length - 1}
            onClick={() =>
              setActiveStep((current) =>
                Math.min(profileSteps.length - 1, current + 1),
              )
            }
          >
            Volgende stap
          </Btn>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Btn type="submit">Profiel opslaan</Btn>
          <Btn type="button" kind="outline" onClick={handleClear}>
            Profiel wissen
          </Btn>
        </div>
        {saveMessage ? (
          <p
            className="mt-4 text-[13.5px] leading-[1.65] text-[var(--muted)]"
            role="status"
            aria-live="polite"
          >
            {saveMessage}
          </p>
        ) : null}
      </section>
    </form>
  );
}

function ProfileStep({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="surface-panel p-6">
      <h3 className="font-serif text-[24px] text-[var(--ink)]">{title}</h3>
      <div className="mt-5 grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}
