import type { SourceTier } from "@/lib/financial-constants";

export const SOURCE_TIER_LABELS: Record<SourceTier, string> = {
  wet: "Wet/regeling",
  normadvies: "Normadvies",
  toezicht: "Toezichthouder",
  overheidsuitleg: "Overheidsuitleg",
  praktijk: "Praktijk",
  "indicatieve-benadering": "Indicatieve benadering",
  projectaanname: "Projectaanname",
};

export function isApproximation(tier: SourceTier): boolean {
  return tier === "indicatieve-benadering" || tier === "projectaanname";
}
