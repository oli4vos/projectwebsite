"use client";

import { useCallback, useMemo, useState } from "react";

export function useSubmittedCalculation<T>(initialValues: T) {
  const [formValues, setFormValues] = useState<T>(initialValues);
  const [submittedValues, setSubmittedValues] = useState<T | null>(null);
  const [submitContextMessage, setSubmitContextMessage] = useState<string | null>(null);

  const hasDirtyChanges = useMemo(() => {
    if (!submittedValues) {
      return false;
    }
    return JSON.stringify(formValues) !== JSON.stringify(submittedValues);
  }, [formValues, submittedValues]);

  const submit = useCallback(() => {
    setSubmittedValues(formValues);
    setSubmitContextMessage(null);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        document.getElementById("tool-result-summary")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [formValues]);

  const submitValues = useCallback((nextValues: T, message?: string) => {
    setFormValues(nextValues);
    setSubmittedValues(nextValues);
    setSubmitContextMessage(message ?? null);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        document.getElementById("tool-result-summary")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, []);

  const setValues = useCallback((nextValues: T, message?: string) => {
    setFormValues(nextValues);
    if (message) {
      setSubmitContextMessage(message);
    }
  }, []);

  const reset = useCallback((message?: string) => {
    setFormValues(initialValues);
    setSubmittedValues(null);
    setSubmitContextMessage(message ?? null);
  }, [initialValues]);

  return {
    formValues,
    setFormValues,
    submittedValues,
    submit,
    submitValues,
    hasDirtyChanges,
    submitContextMessage,
    setSubmitContextMessage,
    setValues,
    reset,
  };
}
