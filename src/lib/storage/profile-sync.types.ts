import type { UserProfile } from "@/lib/user-profile";

export type ProfileSyncStatus =
  | "idle"
  | "skipped"
  | "pulledRemote"
  | "pushedLocal"
  | "merged"
  | "conflict"
  | "fallbackLocal"
  | "error";

export type ProfileSyncReason =
  | "localMode"
  | "notAuthenticated"
  | "supabaseNotConfigured"
  | "remoteMissing"
  | "localMissing"
  | "localNewer"
  | "remoteNewer"
  | "sameTimestamp"
  | "manual"
  | "unknown";

export type ProfileSyncPolicy = "preferLocal" | "preferRemote" | "preferNewest";

export type ProfileSyncEvent = {
  status: ProfileSyncStatus;
  reason: ProfileSyncReason;
  message: string;
  at: string;
};

export type ProfileSyncResult = {
  profile: UserProfile | null;
  status: ProfileSyncStatus;
  reason: ProfileSyncReason;
  events: ProfileSyncEvent[];
  error?: string;
};
