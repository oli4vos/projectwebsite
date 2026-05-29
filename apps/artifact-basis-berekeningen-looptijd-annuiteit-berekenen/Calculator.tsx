"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateLooptijdAnnuiteitBerekenen, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Looptijd annuïteit berekenen";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-basis-berekeningen-looptijd-annuiteit-berekenen").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateLooptijdAnnuiteitBerekenen}
    />
  );
}
