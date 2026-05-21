import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ mocked: true })),
}));
import {
  getSupabaseConfig,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import {
  createSupabaseBrowserClient,
  resetSupabaseBrowserClientCache,
} from "@/lib/supabase/browser-client";

afterEach(() => {
  vi.unstubAllEnvs();
  resetSupabaseBrowserClientCache();
});

describe("supabase config", () => {
  it("returns not configured when env is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    expect(getSupabaseConfig()).toEqual({
      url: null,
      anonKey: null,
      isConfigured: false,
    });
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("returns configured when env is present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key");

    expect(getSupabaseConfig()).toEqual({
      url: "https://example.supabase.co",
      anonKey: "public-anon-key",
      isConfigured: true,
    });
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("creates no client without valid config", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(createSupabaseBrowserClient()).toBeNull();
  });

  it("creates a reusable client when config is present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key");

    const clientA = createSupabaseBrowserClient();
    const clientB = createSupabaseBrowserClient();

    expect(clientA).toBeTruthy();
    expect(clientB).toBe(clientA);
  });
});
