"use client";

import { useEffect, useState } from "react";
import { appRegistryBySlug } from "@/lib/app-registry";
import {
  consumeToolHandoff,
  getToolHandoffIdFromUrl,
  type ToolHandoffRecord,
} from "@/lib/tool-handoff";

export function useToolHandoff(targetTool: string) {
  const [handoff, setHandoff] = useState<ToolHandoffRecord | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const transferId = getToolHandoffIdFromUrl(window.location.search);
      if (!transferId) {
        return;
      }

      const result = consumeToolHandoff(transferId, targetTool);
      if (result.ok) {
        setHandoff(result.data);
      }

      const url = new URL(window.location.href);
      url.searchParams.delete("toolHandoff");
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
    });
  }, [targetTool]);

  return handoff
    ? {
        ...handoff,
        sourceTitle:
          appRegistryBySlug[handoff.sourceTool]?.title ?? "de vorige tool",
      }
    : null;
}
