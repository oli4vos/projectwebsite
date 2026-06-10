import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Run: npm run generate:apps

export type AppCalculatorComponent = ComponentType<Record<string, never>>;

export const appComponents: Record<string, AppCalculatorComponent> = {
  "familiehulp-eerste-woning": dynamic(() => import("../../apps/familiehulp-eerste-woning/Calculator"), {
    loading: () => (
      <div className="rounded-[2rem] border border-line bg-white/80 p-6 text-sm text-muted">
        Rekentool laden...
      </div>
    ),
  }),
  "hypotheek-impact-studieschuld": dynamic(() => import("../../apps/hypotheek-impact-studieschuld/Calculator"), {
    loading: () => (
      <div className="rounded-[2rem] border border-line bg-white/80 p-6 text-sm text-muted">
        Rekentool laden...
      </div>
    ),
  }),
  "schulden-volgorde": dynamic(() => import("../../apps/schulden-volgorde/Calculator"), {
    loading: () => (
      <div className="rounded-[2rem] border border-line bg-white/80 p-6 text-sm text-muted">
        Rekentool laden...
      </div>
    ),
  }),
  "studieschuld-vs-beleggen": dynamic(() => import("../../apps/studieschuld-vs-beleggen/Calculator"), {
    loading: () => (
      <div className="rounded-[2rem] border border-line bg-white/80 p-6 text-sm text-muted">
        Rekentool laden...
      </div>
    ),
  }),
  "volgende-euro": dynamic(() => import("../../apps/volgende-euro/Calculator"), {
    loading: () => (
      <div className="rounded-[2rem] border border-line bg-white/80 p-6 text-sm text-muted">
        Rekentool laden...
      </div>
    ),
  }),
};
