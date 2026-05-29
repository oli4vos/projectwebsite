"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateHypotheekMaandlastenBijNieuwbouw, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Hypotheek maandlasten bij nieuwbouw";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-hypotheek-wonen-hypotheek-maandlasten-bij-nieuwbouw").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateHypotheekMaandlastenBijNieuwbouw}
    />
  );
}
