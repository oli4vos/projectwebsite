import type { UserProfile } from "@/lib/user-profile";
import type {
  ProfileSyncPolicy,
  ProfileSyncReason,
} from "@/lib/storage/profile-sync.types";

export type SyncResolution =
  | { winner: "local"; reason: ProfileSyncReason }
  | { winner: "remote"; reason: ProfileSyncReason }
  | { winner: "none"; reason: ProfileSyncReason };

function toTimestamp(value?: string): number | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function resolveProfileSyncPolicy(
  localProfile: UserProfile | null,
  remoteProfile: UserProfile | null,
  policy: ProfileSyncPolicy = "preferNewest",
): SyncResolution {
  if (!localProfile && !remoteProfile) {
    return { winner: "none", reason: "unknown" };
  }

  if (localProfile && !remoteProfile) {
    return { winner: "local", reason: "remoteMissing" };
  }

  if (!localProfile && remoteProfile) {
    return { winner: "remote", reason: "localMissing" };
  }

  if (policy === "preferLocal") {
    return { winner: "local", reason: "manual" };
  }

  if (policy === "preferRemote") {
    return { winner: "remote", reason: "manual" };
  }

  const localTimestamp = toTimestamp(localProfile?.updatedAt);
  const remoteTimestamp = toTimestamp(remoteProfile?.updatedAt);

  if (localTimestamp === null || remoteTimestamp === null) {
    return { winner: "local", reason: "unknown" };
  }

  if (localTimestamp > remoteTimestamp) {
    return { winner: "local", reason: "localNewer" };
  }

  if (remoteTimestamp > localTimestamp) {
    return { winner: "remote", reason: "remoteNewer" };
  }

  return { winner: "none", reason: "sameTimestamp" };
}
