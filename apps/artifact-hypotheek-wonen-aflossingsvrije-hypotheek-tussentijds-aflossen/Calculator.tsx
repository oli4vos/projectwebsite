"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateAflossingsvrijeHypotheekTussentijdsAflossen, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Aflossingsvrije hypotheek tussentijds aflossen";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-hypotheek-wonen-aflossingsvrije-hypotheek-tussentijds-aflossen").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateAflossingsvrijeHypotheekTussentijdsAflossen}
    />
  );
}
