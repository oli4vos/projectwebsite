import { describe, expect, it } from "vitest";
import {
  getProfileSyncReasonLabel,
  getProfileSyncStatusLabel,
} from "@/lib/storage/profile-sync-labels";

describe("profile-sync-labels", () => {
  it("maps key status labels", () => {
    expect(getProfileSyncStatusLabel("skipped")).toBe("Overgeslagen");
    expect(getProfileSyncStatusLabel("fallbackLocal")).toBe("Lokale fallback");
    expect(getProfileSyncStatusLabel("pulledRemote")).toBe("Remote opgehaald");
    expect(getProfileSyncStatusLabel("pushedLocal")).toBe("Lokaal gepusht");
    expect(getProfileSyncStatusLabel("error")).toBe("Fout");
  });

  it("maps key reason labels", () => {
    expect(getProfileSyncReasonLabel("localMode")).toBe("Local mode");
    expect(getProfileSyncReasonLabel("notAuthenticated")).toBe("Niet ingelogd");
    expect(getProfileSyncReasonLabel("supabaseNotConfigured")).toBe(
      "Supabase niet ingesteld",
    );
  });
});
