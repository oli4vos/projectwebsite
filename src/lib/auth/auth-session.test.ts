import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/config", () => ({
  isSupabaseConfigured: vi.fn(),
}));

vi.mock("@/lib/supabase/browser-client", () => ({
  createSupabaseBrowserClient: vi.fn(),
}));

import { getAuthSession } from "@/lib/auth/auth-session";
import { unauthenticatedSession } from "@/lib/auth/auth-session.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const mockedIsSupabaseConfigured = vi.mocked(isSupabaseConfigured);
const mockedCreateSupabaseBrowserClient = vi.mocked(createSupabaseBrowserClient);

afterEach(() => {
  vi.clearAllMocks();
});

describe("auth-session contract", () => {
  it("returns unauthenticated when supabase config is missing", async () => {
    mockedIsSupabaseConfigured.mockReturnValue(false);

    const result = await getAuthSession();

    expect(result.data).toEqual(unauthenticatedSession);
  });

  it("returns unauthenticated when supabase client is unavailable", async () => {
    mockedIsSupabaseConfigured.mockReturnValue(true);
    mockedCreateSupabaseBrowserClient.mockReturnValue(null);

    const result = await getAuthSession();

    expect(result.data).toEqual(unauthenticatedSession);
  });

  it("returns unauthenticated with error when provider throws", async () => {
    mockedIsSupabaseConfigured.mockReturnValue(true);
    mockedCreateSupabaseBrowserClient.mockReturnValue({
      auth: {
        getSession: vi.fn().mockRejectedValue(new Error("session failed")),
      },
    } as never);

    const result = await getAuthSession();

    expect(result.data).toEqual(unauthenticatedSession);
    expect(result.error).toBe("session failed");
  });
});
