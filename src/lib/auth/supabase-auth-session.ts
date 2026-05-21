import type { AuthSessionProvider } from "@/lib/auth/auth-session.types";
import { unauthenticatedSession } from "@/lib/auth/auth-session.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export const supabaseAuthSessionProvider: AuthSessionProvider = {
  async getSession() {
    const client = createSupabaseBrowserClient();

    if (!client) {
      return { data: unauthenticatedSession };
    }

    try {
      const { data, error } = await client.auth.getSession();

      if (error) {
        return {
          data: unauthenticatedSession,
          error: error.message,
        };
      }

      const sessionUser = data.session?.user;

      if (!sessionUser) {
        return { data: unauthenticatedSession };
      }

      return {
        data: {
          userId: sessionUser.id,
          email: sessionUser.email ?? null,
          isAuthenticated: true,
        },
      };
    } catch (error) {
      return {
        data: unauthenticatedSession,
        error: error instanceof Error ? error.message : "Unknown auth session error",
      };
    }
  },
};
