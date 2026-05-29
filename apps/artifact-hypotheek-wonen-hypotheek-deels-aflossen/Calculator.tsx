"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateHypotheekDeelsAflossen, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Hypotheek deels aflossen";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-hypotheek-wonen-hypotheek-deels-aflossen").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateHypotheekDeelsAflossen}
    />
  );
}
