"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateMaximaleLening, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Maximale lening";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-geld-lenen-financiering-maximale-lening").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateMaximaleLening}
    />
  );
}
