import { defaultUserProfile, sanitizeUserProfile, type UserProfile } from "@/lib/user-profile";
import { localProfileStoreAsync } from "@/lib/storage/local-profile-store-async";
import { recordProfileSyncEvent } from "@/lib/storage/profile-sync-events";
import { createRemoteProfileStoreAsync } from "@/lib/storage/remote-profile-store-async";
import { resolveProfileSyncPolicy } from "@/lib/storage/profile-sync-policy";
import type {
  ProfileSyncEvent,
  ProfileSyncPolicy,
  ProfileSyncReason,
  ProfileSyncResult,
  ProfileSyncStatus,
} from "@/lib/storage/profile-sync.types";
import { getConfiguredProfileStorageMode, type ProfileStorageMode } from "@/lib/storage/storage-mode";

import type { ProfileStoreAsync } from "@/lib/storage/profile-store.types";

type SyncStores = {
  local: ProfileStoreAsync;
  remote: ProfileStoreAsync;
};

type SyncOptions = {
  policy?: ProfileSyncPolicy;
  mode?: ProfileStorageMode;
  stores?: SyncStores;
};

function nowIso() {
  return new Date().toISOString();
}

function createEvent(
  status: ProfileSyncStatus,
  reason: ProfileSyncReason,
  message: string,
): ProfileSyncEvent {
  return { status, reason, message, at: nowIso() };
}

function addEvent(
  events: ProfileSyncEvent[],
  status: ProfileSyncStatus,
  reason: ProfileSyncReason,
  message: string,
) {
  const event = createEvent(status, reason, message);
  events.push(event);
  recordProfileSyncEvent(event);
}

function toNullableProfile(profile: UserProfile | null | undefined): UserProfile | null {
  if (!profile) {
    return null;
  }

  if (Object.keys(profile).length === 0) {
    return null;
  }

  return sanitizeUserProfile(profile);
}

function buildStores(mode: ProfileStorageMode): SyncStores {
  return {
    local: localProfileStoreAsync,
    remote: createRemoteProfileStoreAsync({
      mode: mode === "local" ? "hybrid" : mode,
      localStoreAsync: localProfileStoreAsync,
    }),
  };
}

export async function syncProfileOnce(options: SyncOptions = {}): Promise<ProfileSyncResult> {
  const mode = options.mode ?? getConfiguredProfileStorageMode();
  const policy = options.policy ?? "preferNewest";
  const stores = options.stores ?? buildStores(mode);
  const events: ProfileSyncEvent[] = [];

  if (mode === "local") {
    addEvent(events, "skipped", "localMode", "Sync overgeslagen: local mode is actief.");
    return {
      profile: null,
      status: "skipped",
      reason: "localMode",
      events,
    };
  }

  try {
    const localResult = await stores.local.loadProfile();
    const remoteResult = await stores.remote.loadProfile();

    const localProfile = toNullableProfile(localResult.data);
    const remoteProfile = toNullableProfile(remoteResult.data);

    if (remoteResult.error?.includes("fallback")) {
      addEvent(events, "fallbackLocal", "supabaseNotConfigured", remoteResult.error);
    }

    if (mode === "remote" && !remoteProfile && localProfile) {
      addEvent(
        events,
        "fallbackLocal",
        "notAuthenticated",
        "Remote mode zonder geldig remote profiel; lokale fallback gebruikt.",
      );
      return {
        profile: localProfile,
        status: "fallbackLocal",
        reason: "notAuthenticated",
        events,
        error: remoteResult.error,
      };
    }

    const decision = resolveProfileSyncPolicy(localProfile, remoteProfile, policy);

    if (decision.winner === "none") {
      addEvent(events, "idle", decision.reason, "Local en remote zijn gelijk.");
      return {
        profile: localProfile ?? remoteProfile ?? null,
        status: "idle",
        reason: decision.reason,
        events,
      };
    }

    if (decision.winner === "local" && localProfile) {
      if (remoteProfile && JSON.stringify(localProfile) === JSON.stringify(remoteProfile)) {
        addEvent(
          events,
          "idle",
          "sameTimestamp",
          "Geen sync nodig; profielen zijn inhoudelijk gelijk.",
        );
        return {
          profile: localProfile,
          status: "idle",
          reason: "sameTimestamp",
          events,
        };
      }

      const pushResult = await stores.remote.saveProfile(localProfile);
      addEvent(
        events,
        pushResult.error ? "fallbackLocal" : "pushedLocal",
        decision.reason,
        pushResult.error
          ? `Remote push niet gelukt; lokaal profiel blijft leidend (${pushResult.error}).`
          : "Lokaal profiel naar remote gepusht.",
      );
      return {
        profile: localProfile,
        status: pushResult.error ? "fallbackLocal" : "pushedLocal",
        reason: decision.reason,
        events,
        error: pushResult.error,
      };
    }

    if (decision.winner === "remote" && remoteProfile) {
      const pullResult = await stores.local.saveProfile(remoteProfile);
      addEvent(
        events,
        pullResult.error ? "error" : "pulledRemote",
        decision.reason,
        pullResult.error
          ? `Remote pull niet volledig opgeslagen lokaal (${pullResult.error}).`
          : "Remote profiel lokaal opgeslagen.",
      );
      return {
        profile: remoteProfile,
        status: pullResult.error ? "error" : "pulledRemote",
        reason: decision.reason,
        events,
        error: pullResult.error,
      };
    }

    addEvent(events, "fallbackLocal", "unknown", "Onbekende syncstatus; local fallback toegepast.");
    return {
      profile: localProfile ?? remoteProfile ?? defaultUserProfile,
      status: "fallbackLocal",
      reason: "unknown",
      events,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    addEvent(events, "error", "unknown", message);
    return {
      profile: null,
      status: "error",
      reason: "unknown",
      events,
      error: message,
    };
  }
}
