"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateRestschuldBijFinancialLease, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Restschuld bij financial lease";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE).input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      calculate={calculateRestschuldBijFinancialLease}
    />
  );
}
