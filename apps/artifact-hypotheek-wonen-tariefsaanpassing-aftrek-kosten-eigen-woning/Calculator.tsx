"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateTariefsaanpassingAftrekKostenEigenWoning, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Tariefsaanpassing aftrek kosten eigen woning";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-hypotheek-wonen-tariefsaanpassing-aftrek-kosten-eigen-woning").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculateTariefsaanpassingAftrekKostenEigenWoning}
    />
  );
}
