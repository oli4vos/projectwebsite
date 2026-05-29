"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateMaximaleHypotheekNaVerhuizen, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Maximale hypotheek na verhuizen";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-hypotheek-wonen-maximale-hypotheek-na-verhuizen").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateMaximaleHypotheekNaVerhuizen}
    />
  );
}
