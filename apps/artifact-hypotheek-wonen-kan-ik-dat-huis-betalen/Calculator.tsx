"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateKanIkDatHuisBetalen, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Kan ik dat huis betalen?";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-hypotheek-wonen-kan-ik-dat-huis-betalen").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateKanIkDatHuisBetalen}
    />
  );
}
