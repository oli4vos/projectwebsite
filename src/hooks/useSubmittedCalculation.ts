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
  }, [formValues]);

  const setValues = useCallback((nextValues: T, message?: string) => {
    setFormValues(nextValues);
    if (message) {
      setSubmitContextMessage(message);
    }
  }, []);

  return {
    formValues,
    setFormValues,
    submittedValues,
    submit,
    hasDirtyChanges,
    submitContextMessage,
    setSubmitContextMessage,
    setValues,
  };
}
