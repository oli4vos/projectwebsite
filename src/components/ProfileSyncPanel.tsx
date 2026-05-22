"use client";

import { useMemo, useState } from "react";
import { Btn } from "@/components/ui";
import { ENABLE_PROFILE_SYNC_PANEL } from "@/lib/feature-flags";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getProfileSyncEvents } from "@/lib/storage/profile-sync-events";
import { getProfileSyncStatusLabel, getProfileSyncReasonLabel } from "@/lib/storage/profile-sync-labels";
import { syncProfileOnce } from "@/lib/storage/profile-sync-orchestrator";
import { getConfiguredProfileStorageMode } from "@/lib/storage/storage-mode";
import type { ProfileSyncResult } from "@/lib/storage/profile-sync.types";

function formatSyncTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Onbekende tijd";
  }
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function ProfileSyncPanel() {
  const storageMode = useMemo(() => getConfiguredProfileStorageMode(), []);
  const supabaseConfigured = useMemo(() => isSupabaseConfigured(), []);
  const isRelevantMode = storageMode === "hybrid" || storageMode === "remote";
  const shouldShowPanel =
    ENABLE_PROFILE_SYNC_PANEL && (isRelevantMode || supabaseConfigured);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<ProfileSyncResult | null>(null);

  const recentEvents = getProfileSyncEvents().slice(-5).reverse();

  if (!shouldShowPanel) {
    return null;
  }

  const isInactiveSync = !isRelevantMode || !supabaseConfigured;

  async function handleSync() {
    setIsSyncing(true);
    try {
      const result = await syncProfileOnce();
      setSyncResult(result);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <section className="mt-6 grid gap-4 rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
      <div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Profielsync
        </div>
        <h2 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
          Profiel synchroniseren
        </h2>
        <p className="mt-3 text-[14.5px] leading-[1.7] text-[var(--ink-2)]">
          Je profiel blijft lokaal werken. Synchronisatie is optioneel en
          experimenteel.
        </p>
      </div>

      {isInactiveSync ? (
        <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
          Synchronisatie is nog niet actief. Je profiel blijft lokaal bewaard.
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Btn type="button" onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? "Synchroniseren..." : "Synchroniseer profiel"}
          </Btn>
          {syncResult ? (
            <p className="text-[13px] text-[var(--muted)]">
              Laatste status: {getProfileSyncStatusLabel(syncResult.status)} ·{" "}
              {getProfileSyncReasonLabel(syncResult.reason)}
            </p>
          ) : null}
        </div>
      )}

      {recentEvents.length > 0 ? (
        <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4">
          <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">
            Recente sync-events
          </p>
          <ul className="mt-2 grid gap-2 text-[13px] text-[var(--ink-2)]">
            {recentEvents.map((event, index) => (
              <li key={`${event.at}-${event.status}-${index}`}>
                <span className="font-semibold text-[var(--ink)]">
                  {getProfileSyncStatusLabel(event.status)}
                </span>{" "}
                · {getProfileSyncReasonLabel(event.reason)} · {formatSyncTime(event.at)}
                <br />
                <span className="text-[var(--muted)]">{event.message}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
