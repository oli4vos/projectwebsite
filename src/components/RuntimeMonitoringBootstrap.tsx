"use client";

import { useEffect } from "react";
import { registerRuntimeMonitoring } from "@/lib/runtime-monitoring";

export function RuntimeMonitoringBootstrap() {
  useEffect(() => {
    const unregister = registerRuntimeMonitoring();
    return unregister;
  }, []);

  return null;
}
