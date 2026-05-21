import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

let cachedClient: SupabaseClient | null | undefined;

export function createSupabaseBrowserClient(): SupabaseClient | null {
  const config = getSupabaseConfig();

  if (!config.isConfigured || !config.url || !config.anonKey) {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = createClient(config.url, config.anonKey);
  return cachedClient;
}

export function resetSupabaseBrowserClientCache() {
  cachedClient = undefined;
}
