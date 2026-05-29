"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateAanvullendPartnerverlof, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Aanvullend partnerverlof";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-gezin-relatie-aanvullend-partnerverlof").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateAanvullendPartnerverlof}
    />
  );
}
