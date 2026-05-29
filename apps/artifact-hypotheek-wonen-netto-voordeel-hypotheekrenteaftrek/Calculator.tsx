"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateNettoVoordeelHypotheekrenteaftrek, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Netto voordeel hypotheekrenteaftrek";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-hypotheek-wonen-netto-voordeel-hypotheekrenteaftrek").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateNettoVoordeelHypotheekrenteaftrek}
    />
  );
}
