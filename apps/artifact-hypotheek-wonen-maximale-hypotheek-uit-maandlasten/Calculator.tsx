"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateMaximaleHypotheekUitMaandlasten, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Maximale hypotheek uit maandlasten";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-hypotheek-wonen-maximale-hypotheek-uit-maandlasten").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateMaximaleHypotheekUitMaandlasten}
    />
  );
}
