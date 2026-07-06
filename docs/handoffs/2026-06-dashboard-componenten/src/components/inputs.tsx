// Form inputs. Voor productie: vervang `defaultValue` door je form-state of
// een form-lib zoals react-hook-form.

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
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12px] tracking-[0.04em] uppercase text-[var(--muted)]">{label}</span>
        {hint && <span className="text-[11px] text-[var(--soft)]">{hint}</span>}
      </div>
      <div className={`flex items-center bg-white border hair rounded-md ${big ? "h-14" : "h-11"} px-3`}>
        {prefix && <span className="text-[var(--muted)] mr-2 tabular">{prefix}</span>}
        <input
          defaultValue={value}
          className={`flex-1 bg-transparent outline-none ring-focus font-mono ${big ? "text-[22px]" : "text-[15px]"} tabular`}
        />
        {suffix && <span className="text-[var(--muted)] ml-2 text-[13px]">{suffix}</span>}
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
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[12px] tracking-[0.04em] uppercase text-[var(--muted)]">{label}</span>
        <span className="font-mono text-[14px] tabular">{value}{suffix}</span>
      </div>
      <div className="relative h-[6px] bg-[var(--paper-soft)] rounded-full">
        <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--ink)]" style={{ width: `${pct}%` }} />
        <div
          className="absolute -top-1.5 size-[18px] rounded-full bg-white border-[3px] border-[var(--ink)]"
          style={{ left: `calc(${pct}% - 9px)` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-[var(--soft)] tabular mt-1.5">
        <span>{min}{suffix}</span><span>{max}{suffix}</span>
      </div>
    </div>
  );
}

interface ToggleProps {
  options: string[];
  active?: number;
  onChange?: (i: number) => void;
}
export function Toggle({ options, active = 0, onChange }: ToggleProps) {
  return (
    <div className="inline-flex items-center gap-0.5 p-1 rounded-full bg-[var(--paper-soft)] border hair">
      {options.map((o, i) => (
        <button
          key={i}
          onClick={() => onChange?.(i)}
          className={`px-3.5 h-8 rounded-full text-[13px] font-medium ${
            i === active ? "bg-white text-[var(--ink)] shadow-paper" : "text-[var(--muted)]"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
