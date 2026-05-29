"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateBanksparenVoorPensioen, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Banksparen voor Pensioen";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-pensioen-aow-banksparen-voor-pensioen").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateBanksparenVoorPensioen}
    />
  );
}
