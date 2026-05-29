"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateAnnuiteitBerekenen, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Annuïteit berekenen";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-basis-berekeningen-annuiteit-berekenen").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateAnnuiteitBerekenen}
    />
  );
}
