"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateRvuRegelingInkomensdaling, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "RVU-regeling - inkomensdaling";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-pensioen-aow-rvu-regeling-inkomensdaling").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateRvuRegelingInkomensdaling}
    />
  );
}
