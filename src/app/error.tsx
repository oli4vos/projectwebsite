"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

const CHUNK_RECOVERY_KEY = "projectwebsite:chunk-recovery-attempted";

function isLikelyChunkError(error: Error) {
  const message = error.message.toLowerCase();
  return (
    message.includes("chunkloaderror") ||
    message.includes("loading chunk") ||
    message.includes("failed to fetch dynamically imported module")
  );
}

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (!isLikelyChunkError(error)) {
      return;
    }

    const hasAttemptedReload = window.sessionStorage.getItem(CHUNK_RECOVERY_KEY);
    if (hasAttemptedReload) {
      return;
    }

    window.sessionStorage.setItem(CHUNK_RECOVERY_KEY, "1");
    window.location.reload();
  }, [error]);

  function handleTryAgain() {
    window.sessionStorage.removeItem(CHUNK_RECOVERY_KEY);
    reset();
  }

  return (
    <main id="main-content" className="page-shell flex min-h-[72dvh] items-center py-10">
      <ErrorState onRetry={handleTryAgain} />
    </main>
  );
}
