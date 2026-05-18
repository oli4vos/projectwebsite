import type { ChangeEventHandler } from "react";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  error?: string;
  hint?: string;
  placeholder?: string;
  inputMode?: "decimal" | "numeric" | "text" | "search" | "email" | "tel" | "url";
}

export function InputField({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  inputMode = "decimal",
}: InputFieldProps) {
  return (
    <label className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
          {label}
        </span>
        {hint ? <span className="text-[11px] text-[var(--soft)]">{hint}</span> : null}
      </div>
      <input
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        placeholder={placeholder}
        className="ring-focus hair h-11 rounded-[var(--radius-soft)] border bg-white px-3.5 font-mono text-[15px] tabular text-[var(--ink)] outline-none"
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </label>
  );
}

interface FieldProps {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  hint?: string;
  big?: boolean;
}

export function Field({ label, value, suffix, hint, prefix, big }: FieldProps) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">{label}</span>
        {hint ? <span className="text-[11px] text-[var(--soft)]">{hint}</span> : null}
      </div>
      <div
        className={`hair flex items-center rounded-[var(--radius-soft)] border bg-white px-3 ${big ? "h-14" : "h-11"}`}
      >
        {prefix ? <span className="mr-2 tabular text-[var(--muted)]">{prefix}</span> : null}
        <input
          defaultValue={value}
          className={`ring-focus tabular flex-1 bg-transparent font-mono outline-none ${big ? "text-[22px]" : "text-[15px]"}`}
        />
        {suffix ? <span className="ml-2 text-[13px] text-[var(--muted)]">{suffix}</span> : null}
      </div>
    </label>
  );
}

interface SliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  suffix?: string;
}

export function Slider({ label, min, max, value, suffix = "" }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">{label}</span>
        <span className="font-mono text-[14px] tabular">
          {value}
          {suffix}
        </span>
      </div>
      <div className="relative h-[6px] rounded-full bg-[var(--paper-soft)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--ink)]"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute -top-1.5 size-[18px] rounded-full border-[3px] border-[var(--ink)] bg-white"
          style={{ left: `calc(${percentage}% - 9px)` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-[var(--soft)] tabular">
        <span>
          {min}
          {suffix}
        </span>
        <span>
          {max}
          {suffix}
        </span>
      </div>
    </div>
  );
}

interface ToggleProps {
  options: string[];
  active?: number;
  onChange?: (index: number) => void;
}

export function Toggle({ options, active = 0, onChange }: ToggleProps) {
  return (
    <div className="hair inline-flex items-center gap-0.5 rounded-[var(--radius-soft)] border bg-[var(--paper-soft)] p-1">
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange?.(index)}
          className={`h-8 rounded-[calc(var(--radius-soft)-2px)] px-3.5 text-[13px] font-medium transition ${
            index === active ? "bg-white text-[var(--ink)] shadow-paper" : "text-[var(--muted)]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
