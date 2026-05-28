"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateTariefsaanpassingAftrekKostenEigenWoning, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Tariefsaanpassing aftrek kosten eigen woning";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE).input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      calculate={calculateTariefsaanpassingAftrekKostenEigenWoning}
    />
  );
}
