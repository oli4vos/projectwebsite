"use client";

import { ArtifactCalculator } from "../_artifact_shared/ArtifactCalculator";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculatePartnerUitkopenUitEigenWoning, TOOL_PROFILE } from "./logic";

const TOOL_TITLE = "Partner uitkopen uit eigen woning";
const DEFAULT_INPUT = getProfileFixture(TOOL_PROFILE, "artifact-gezin-relatie-partner-uitkopen-uit-eigen-woning").input;

export default function Calculator() {
  return (
    <ArtifactCalculator
      title={TOOL_TITLE}
      defaultInput={DEFAULT_INPUT}
      profile={TOOL_PROFILE}
      calculate={calculatePartnerUitkopenUitEigenWoning}
    />
  );
}
