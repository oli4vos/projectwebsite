"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateLooptijdAflossingLening, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Looptijd aflossing lening";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-geld-lenen-financiering-looptijd-aflossing-lening").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateLooptijdAflossingLening}
    />
  );
}
