import type {
  AuthSessionProvider,
  AuthSessionResult,
} from "@/lib/auth/auth-session.types";
import { localAuthSessionProvider } from "@/lib/auth/local-auth-session";
import { supabaseAuthSessionProvider } from "@/lib/auth/supabase-auth-session";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function getAuthSessionProvider(): AuthSessionProvider {
  if (!isSupabaseConfigured()) {
    return localAuthSessionProvider;
  }

  return supabaseAuthSessionProvider;
}

export async function getAuthSession(): Promise<AuthSessionResult> {
  return getAuthSessionProvider().getSession();
}
