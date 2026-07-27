"use client";

import { ErrorState } from "@/components/ErrorState";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="nl">
      <body>
        <main className="page-shell flex min-h-[100dvh] items-center py-10">
          <ErrorState onRetry={reset} />
        </main>
      </body>
    </html>
  );
}
