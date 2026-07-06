import { Btn, CategoryDot } from "../../components/ui";
import { Field, Slider } from "../../components/inputs";

/**
 * Mobiel — Invoerformulier. Eén kolom, sticky CTA onderaan binnen duim-bereik.
 */
export function MobileForm() {
  return (
    <div className="h-full bg-[var(--paper)] flex flex-col relative">
      <div className="px-5 pt-3 pb-2 flex items-center justify-between text-[13px]">
        <span className="text-[var(--ink)] font-medium">← Hypotheek</span>
        <span className="text-[var(--muted)]">Stap 1 / 2</span>
      </div>

      <div className="px-5 pt-2">
        <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
          <CategoryDot cat="hyp" /><span className="uppercase tracking-[0.1em]">Hypotheek</span>
        </div>
        <h1 className="font-serif text-[24px] leading-[1.1] tracking-[-0.01em] mt-2">Annuïteit of lineair</h1>
        <p className="text-[12.5px] text-[var(--muted)] mt-1.5 leading-[1.55]">
          Vul vier velden — wij rekenen beide vormen tegelijk.
        </p>
      </div>

      <div className="px-5 mt-5 space-y-4 flex-1 overflow-y-auto pb-28">
        <Field big label="Hypotheekbedrag" value="385.000" prefix="€" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Rente"    value="3,89" suffix="%" />
          <Field label="Looptijd" value="30"   suffix="jr" />
        </div>
        <Field label="Belastbaar inkomen" value="58.500" prefix="€" suffix="/jr" />

        <div className="pt-2">
          <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)] mb-2">Rentevaste periode</div>
          <div className="grid grid-cols-4 gap-1.5">
            {["5 jr", "10 jr", "20 jr", "30 jr"].map((l, i) => (
              <button key={i} className={`h-9 rounded-md text-[12.5px] ${
                i === 1 ? "bg-[var(--deep)] text-[var(--paper)]" : "bg-white border hair text-[var(--ink-2)]"
              }`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="pt-1">
          <Slider label="Eigen inleg" min={0} max={100} value={15} suffix=" %" />
        </div>

        <div className="bg-white border hair rounded-xl p-4 mt-2">
          <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Voorlopige uitkomst</div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="font-mono text-[20px] tabular">€ 1.642</div>
            <div className="text-[11.5px] text-[var(--muted)]">annuïteit / mnd</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-3 bg-[var(--paper)]/95 backdrop-blur hair-t">
        <Btn full kind="primary" size="lg">Bekijk resultaat →</Btn>
      </div>
    </div>
  );
}
