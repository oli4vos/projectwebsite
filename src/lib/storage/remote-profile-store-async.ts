import { getAuthSession } from "@/lib/auth/auth-session";
import type { AuthSessionResult } from "@/lib/auth/auth-session.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {
  sanitizeUserProfile,
  type UserProfile,
} from "@/lib/user-profile";
import type {
  ProfileStoreAsync,
  ProfileStoreResult,
} from "@/lib/storage/profile-store.types";
import type { ProfileStorageMode } from "@/lib/storage/storage-mode";

type RemoteProfileStoreAsyncOptions = {
  mode: Exclude<ProfileStorageMode, "local">;
  localStoreAsync: ProfileStoreAsync;
  getAuthSession?: () => Promise<AuthSessionResult>;
  createClient?: typeof createSupabaseBrowserClient;
};

type RemoteProfileRow = {
  data: UserProfile | null;
};

async function fallbackToLocalProfile(
  localStoreAsync: ProfileStoreAsync,
  message: string,
) {
  const result = await localStoreAsync.loadProfile();
  return result.error ? result : { ...result, error: message };
}

function resolveFallbackMessage(mode: Exclude<ProfileStorageMode, "local">) {
  return mode === "hybrid"
    ? "Hybrid async profile storage gebruikt momenteel lokale fallback."
    : "Remote async profile storage gebruikt momenteel lokale fallback.";
}

export function createRemoteProfileStoreAsync({
  mode,
  localStoreAsync,
  getAuthSession: getAuthSessionOverride,
  createClient: createClientOverride,
}: RemoteProfileStoreAsyncOptions): ProfileStoreAsync {
  const fallbackMessage = resolveFallbackMessage(mode);
  const resolveAuthSession = getAuthSessionOverride ?? getAuthSession;
  const resolveClient = createClientOverride ?? createSupabaseBrowserClient;

  return {
    async loadProfile(): Promise<ProfileStoreResult<UserProfile>> {
      const client = resolveClient();
      if (!client) {
        return fallbackToLocalProfile(localStoreAsync, fallbackMessage);
      }

      const session = await resolveAuthSession();
      if (!session.data.isAuthenticated || !session.data.userId) {
        return fallbackToLocalProfile(localStoreAsync, fallbackMessage);
      }

      try {
        const { data, error } = await client
          .from("profiles")
          .select("data")
          .eq("user_id", session.data.userId)
          .maybeSingle<RemoteProfileRow>();

        if (error) {
          const localResult = await localStoreAsync.loadProfile();
          return {
            data: localResult.data,
            error: error.message,
          };
        }

        if (!data?.data) {
          return fallbackToLocalProfile(localStoreAsync, fallbackMessage);
        }

        return {
          data: sanitizeUserProfile(data.data),
        };
      } catch (error) {
        const localResult = await localStoreAsync.loadProfile();
        return {
          data: localResult.data,
          error:
            error instanceof Error
              ? error.message
              : "Unknown remote profile load error",
        };
      }
    },

    async saveProfile(profile: UserProfile): Promise<ProfileStoreResult<UserProfile>> {
      const client = resolveClient();
      if (!client) {
        return localStoreAsync.saveProfile(profile);
      }

      const session = await resolveAuthSession();
      if (!session.data.isAuthenticated || !session.data.userId) {
        return localStoreAsync.saveProfile(profile);
      }

      const sanitizedProfile = sanitizeUserProfile({
        ...profile,
        updatedAt: new Date().toISOString(),
      });

      try {
        const { error } = await client.from("profiles").upsert(
          {
            user_id: session.data.userId,
            data: sanitizedProfile,
          },
          {
            onConflict: "user_id",
          },
        );

        if (error) {
          const localResult = await localStoreAsync.saveProfile(profile);
          return {
            data: localResult.data,
            error: error.message,
          };
        }

        return { data: sanitizedProfile };
      } catch (error) {
        const localResult = await localStoreAsync.saveProfile(profile);
        return {
          data: localResult.data,
          error:
            error instanceof Error
              ? error.message
              : "Unknown remote profile save error",
        };
      }
    },

    async clearProfile(): Promise<ProfileStoreResult<null>> {
      const client = resolveClient();
      if (!client) {
        return localStoreAsync.clearProfile();
      }

      const session = await resolveAuthSession();
      if (!session.data.isAuthenticated || !session.data.userId) {
        return localStoreAsync.clearProfile();
      }

      try {
        const { error } = await client
          .from("profiles")
          .delete()
          .eq("user_id", session.data.userId);

        const localResult = await localStoreAsync.clearProfile();
        if (error) {
          return {
            data: localResult.data,
            error: error.message,
          };
        }

        return localResult;
      } catch (error) {
        const localResult = await localStoreAsync.clearProfile();
        return {
          data: localResult.data,
          error:
            error instanceof Error
              ? error.message
              : "Unknown remote profile clear error",
        };
      }
    },
  };
}
