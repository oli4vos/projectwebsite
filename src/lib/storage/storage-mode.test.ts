import { describe, expect, it, vi } from "vitest";
import {
  getConfiguredProfileStorageMode,
  isRemoteProfileStorageMode,
  sanitizeProfileStorageMode,
} from "@/lib/storage/storage-mode";

describe("storage-mode", () => {
  it("falls back to local for undefined", () => {
    expect(sanitizeProfileStorageMode(undefined)).toBe("local");
  });

  it("falls back to local for empty string", () => {
    expect(sanitizeProfileStorageMode("")).toBe("local");
  });

  it("keeps local", () => {
    expect(sanitizeProfileStorageMode("local")).toBe("local");
  });

  it("keeps hybrid", () => {
    expect(sanitizeProfileStorageMode("hybrid")).toBe("hybrid");
  });

  it("keeps remote", () => {
    expect(sanitizeProfileStorageMode("remote")).toBe("remote");
  });

  it("falls back to local for unknown values", () => {
    expect(sanitizeProfileStorageMode("database")).toBe("local");
  });

  it("supports whitespace and case-insensitive values", () => {
    expect(sanitizeProfileStorageMode("  REMOTE ")).toBe("remote");
  });

  it("reads env var with local default fallback", () => {
    vi.stubEnv("NEXT_PUBLIC_PROFILE_STORAGE_MODE", "hybrid");
    expect(getConfiguredProfileStorageMode()).toBe("hybrid");

    vi.stubEnv("NEXT_PUBLIC_PROFILE_STORAGE_MODE", "something-else");
    expect(getConfiguredProfileStorageMode()).toBe("local");

    vi.unstubAllEnvs();
  });

  it("flags remote modes correctly", () => {
    expect(isRemoteProfileStorageMode("local")).toBe(false);
    expect(isRemoteProfileStorageMode("hybrid")).toBe(true);
    expect(isRemoteProfileStorageMode("remote")).toBe(true);
  });
});
