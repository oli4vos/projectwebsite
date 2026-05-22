import type {
  ProfileSyncReason,
  ProfileSyncStatus,
} from "@/lib/storage/profile-sync.types";

export function getProfileSyncStatusLabel(status: ProfileSyncStatus): string {
  switch (status) {
    case "skipped":
      return "Overgeslagen";
    case "fallbackLocal":
      return "Lokale fallback";
    case "pulledRemote":
      return "Remote opgehaald";
    case "pushedLocal":
      return "Lokaal gepusht";
    case "error":
      return "Fout";
    case "merged":
      return "Samengevoegd";
    case "conflict":
      return "Conflict";
    case "idle":
    default:
      return "Geen wijziging";
  }
}

export function getProfileSyncReasonLabel(reason: ProfileSyncReason): string {
  switch (reason) {
    case "localMode":
      return "Local mode";
    case "notAuthenticated":
      return "Niet ingelogd";
    case "supabaseNotConfigured":
      return "Supabase niet ingesteld";
    case "remoteMissing":
      return "Remote profiel ontbreekt";
    case "localMissing":
      return "Lokaal profiel ontbreekt";
    case "localNewer":
      return "Lokaal profiel is nieuwer";
    case "remoteNewer":
      return "Remote profiel is nieuwer";
    case "sameTimestamp":
      return "Gelijke timestamp";
    case "manual":
      return "Handmatig";
    case "unknown":
    default:
      return "Onbekend";
  }
}
