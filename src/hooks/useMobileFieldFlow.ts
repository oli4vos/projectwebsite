"use client";

import type { KeyboardEvent } from "react";
import { useMemo, useState } from "react";

type UseMobileFieldFlowResult = {
  activeFieldId: string;
  activeIndex: number;
  total: number;
  isActiveField: (fieldId: string) => boolean;
  getFieldClassName: (fieldId: string) => string;
  goNext: () => void;
  goPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  handleEnterAdvance: (fieldId: string, blocked?: boolean) => (event: KeyboardEvent) => void;
};

export function useMobileFieldFlow(fieldIds: string[]): UseMobileFieldFlowResult {
  const sanitizedFieldIds = useMemo(
    () => fieldIds.filter((fieldId) => fieldId.trim().length > 0),
    [fieldIds],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const total = sanitizedFieldIds.length;
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, total - 1));
  const activeFieldId = sanitizedFieldIds[safeActiveIndex] ?? "";

  function isActiveField(fieldId: string) {
    return activeFieldId === fieldId;
  }

  function getFieldClassName(fieldId: string) {
    return isActiveField(fieldId) ? "grid gap-2 md:grid" : "hidden md:grid md:gap-2";
  }

  function goNext() {
    setActiveIndex((current) => {
      const next = Math.min(
        current + 1,
        Math.max(0, sanitizedFieldIds.length - 1),
      );
      return next;
    });
  }

  function goPrev() {
    setActiveIndex((current) => Math.max(current - 1, 0));
  }

  function handleEnterAdvance(fieldId: string, blocked = false) {
    return (event: KeyboardEvent) => {
      if (event.key !== "Enter") {
        return;
      }

      if (!isActiveField(fieldId)) {
        return;
      }

      event.preventDefault();

      if (blocked) {
        return;
      }

      goNext();
    };
  }

  return {
    activeFieldId,
    activeIndex: safeActiveIndex,
    total,
    isActiveField,
    getFieldClassName,
    goNext,
    goPrev,
    canGoNext: safeActiveIndex < total - 1,
    canGoPrev: safeActiveIndex > 0,
    handleEnterAdvance,
  };
}
