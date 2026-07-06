import { MobileDashboard } from "./MobileDashboard";
import { MobileForm } from "./MobileForm";
import { MobileResult } from "./MobileResult";

/**
 * Container die de drie mobiele schermen naast elkaar plaatst in een
 * styleguide. In productie render je elk scherm los binnen een echte mobile
 * viewport (bv. via je routing).
 *
 * De PhoneFrame hieronder is een eenvoudige device-bezel zonder afhankelijkheden.
 * Vervang door je eigen frame of laat weg.
 */
export function MobileFrames() {
  return (
    <div className="w-full h-full bg-[var(--paper)] p-10">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Mobiele versie · 390 × 780</div>
        <h2 className="font-serif text-[32px] tracking-[-0.01em] mt-2">Op de telefoon</h2>
        <p className="text-[13.5px] text-[var(--muted)] mt-1 max-w-[600px]">
          Eén kolom, gestapelde invoer, resultaat boven de vouw. Sticky onderbalk
          met "Bereken" zodat de actie altijd binnen duim‑bereik blijft.
        </p>
      </header>

      <div className="flex items-start justify-start gap-12">
        <FramedScreen label="Scherm 01 · Dashboard"><MobileDashboard /></FramedScreen>
        <FramedScreen label="Scherm 02 · Invoer"><MobileForm /></FramedScreen>
        <FramedScreen label="Scherm 03 · Resultaat"><MobileResult /></FramedScreen>
      </div>
    </div>
  );
}

function FramedScreen({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <PhoneFrame>{children}</PhoneFrame>
      <div className="text-[12px] text-[var(--muted)]">{label}</div>
    </div>
  );
}

/** Eenvoudige device-bezel — vervang door je eigen frame indien gewenst. */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-black rounded-[44px] p-[10px] shadow-paper-lg"
      style={{ width: 380, height: 800 }}
    >
      <div className="bg-[var(--paper)] rounded-[34px] overflow-hidden h-full relative">
        {/* notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[110px] h-[28px] rounded-full bg-black z-50" />
        {/* status bar spacing */}
        <div className="h-[44px]" />
        <div className="absolute inset-0 pt-[44px]">
          {children}
        </div>
      </div>
    </div>
  );
}
