import type { UserProfile } from "@/lib/user-profile";
import { localProfileStoreAsync } from "@/lib/storage/local-profile-store-async";
import type {
  ProfileStoreAsync,
  ProfileStoreResult,
} from "@/lib/storage/profile-store.types";
import { createRemoteProfileStoreAsyncStub } from "@/lib/storage/remote-profile-store-async";
import {
  getConfiguredProfileStorageMode,
  type ProfileStorageMode,
} from "@/lib/storage/storage-mode";

function resolveProfileStoreAsync(mode: ProfileStorageMode): ProfileStoreAsync {
  if (mode === "local") {
    return localProfileStoreAsync;
  }

  return createRemoteProfileStoreAsyncStub({
    mode,
    localStoreAsync: localProfileStoreAsync,
  });
}

export function getProfileStoreAsync(): ProfileStoreAsync {
  return resolveProfileStoreAsync(getConfiguredProfileStorageMode());
}

export async function loadUserProfileFromStoreAsync(): Promise<
  ProfileStoreResult<UserProfile>
> {
  return getProfileStoreAsync().loadProfile();
}

export async function saveUserProfileToStoreAsync(
  profile: UserProfile,
): Promise<ProfileStoreResult<UserProfile>> {
  return getProfileStoreAsync().saveProfile(profile);
}

export async function clearUserProfileFromStoreAsync(): Promise<
  ProfileStoreResult<null>
> {
  return getProfileStoreAsync().clearProfile();
}
