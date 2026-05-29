"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateGesubsidieerdeRechtsbijstand, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Gesubsidieerde rechtsbijstand";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-gezin-relatie-gesubsidieerde-rechtsbijstand").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateGesubsidieerdeRechtsbijstand}
    />
  );
}
