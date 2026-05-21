import type { AuthSessionProvider } from "@/lib/auth/auth-session.types";
import { unauthenticatedSession } from "@/lib/auth/auth-session.types";

export const localAuthSessionProvider: AuthSessionProvider = {
  async getSession() {
    return {
      data: unauthenticatedSession,
    };
  },
};
