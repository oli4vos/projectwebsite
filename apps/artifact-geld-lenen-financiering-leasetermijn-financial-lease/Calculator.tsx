"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateLeasetermijnFinancialLease, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Leasetermijn financial lease";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-geld-lenen-financiering-leasetermijn-financial-lease").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateLeasetermijnFinancialLease}
    />
  );
}
