import { appRegistryBySlug } from "@/lib/app-registry";
import {
  profileHasValues,
  sanitizeUserProfile,
  type UserProfile,
} from "@/lib/user-profile";

export const TOOL_HANDOFF_QUERY_PARAM = "toolHandoff";
export const TOOL_HANDOFF_TTL_MS = 45 * 60 * 1000;

const STORAGE_KEY_PREFIX = "project-site:tool-handoff:v1:";

export type ToolHandoffRecord = {
  schemaVersion: 1;
  transferId: string;
  sourceTool: string;
  targetTool: string;
  profilePatch: Partial<UserProfile>;
  fieldLabels: string[];
  createdAt: string;
  expiresAt: string;
};

type ToolHandoffResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: "storage-unavailable" | "invalid-transfer" | "missing-transfer" };

export function createToolHandoff(
  input: {
    sourceTool: string;
    targetTool: string;
    profilePatch: Partial<UserProfile>;
    fieldLabels: string[];
  },
  now = new Date(),
): ToolHandoffResult<ToolHandoffRecord> {
  const storage = getSessionStorage();
  const sanitizedPatch = sanitizeUserProfile(input.profilePatch);
  if (
    !storage ||
    !isEnabledTool(input.sourceTool) ||
    !isEnabledTool(input.targetTool) ||
    !profileHasValues(sanitizedPatch)
  ) {
    return {
      ok: false,
      error: storage ? "invalid-transfer" : "storage-unavailable",
    };
  }

  const record: ToolHandoffRecord = {
    schemaVersion: 1,
    transferId: createTransferId(),
    sourceTool: input.sourceTool,
    targetTool: input.targetTool,
    profilePatch: sanitizedPatch,
    fieldLabels: input.fieldLabels
      .filter((label) => typeof label === "string" && label.trim().length > 0)
      .slice(0, 12),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + TOOL_HANDOFF_TTL_MS).toISOString(),
  };

  try {
    storage.setItem(getStorageKey(record.transferId), JSON.stringify(record));
    return { ok: true, data: record };
  } catch {
    return { ok: false, error: "storage-unavailable" };
  }
}

export function consumeToolHandoff(
  transferId: string | null | undefined,
  targetTool: string,
  now = new Date(),
): ToolHandoffResult<ToolHandoffRecord> {
  const storage = getSessionStorage();
  const cleanId = sanitizeTransferId(transferId);
  if (!storage) {
    return { ok: false, error: "storage-unavailable" };
  }
  if (!cleanId) {
    return { ok: false, error: "missing-transfer" };
  }

  const key = getStorageKey(cleanId);
  const raw = storage.getItem(key);
  if (!raw) {
    return { ok: false, error: "missing-transfer" };
  }

  storage.removeItem(key);
  const record = parseRecord(raw);
  if (
    !record ||
    record.schemaVersion !== 1 ||
    record.transferId !== cleanId ||
    record.targetTool !== targetTool ||
    !isEnabledTool(record.sourceTool) ||
    !isEnabledTool(record.targetTool) ||
    new Date(record.expiresAt).getTime() <= now.getTime()
  ) {
    return { ok: false, error: "invalid-transfer" };
  }

  const profilePatch = sanitizeUserProfile(record.profilePatch);
  if (!profileHasValues(profilePatch)) {
    return { ok: false, error: "invalid-transfer" };
  }

  return {
    ok: true,
    data: {
      ...record,
      profilePatch,
      fieldLabels: record.fieldLabels
        .filter((label) => typeof label === "string" && label.trim().length > 0)
        .slice(0, 12),
    },
  };
}

export function getToolHandoffIdFromUrl(search: string) {
  return sanitizeTransferId(
    new URLSearchParams(search).get(TOOL_HANDOFF_QUERY_PARAM),
  );
}

export function getToolHandoffUrl(path: string, transferId: string) {
  const params = new URLSearchParams();
  params.set(TOOL_HANDOFF_QUERY_PARAM, transferId);
  return `${prefixCurrentBasePath(path)}?${params.toString()}`;
}

function parseRecord(raw: string): ToolHandoffRecord | null {
  try {
    const record = JSON.parse(raw) as ToolHandoffRecord;
    return record && typeof record === "object" ? record : null;
  } catch {
    return null;
  }
}

function isEnabledTool(slug: string) {
  return Boolean(appRegistryBySlug[slug]);
}

function sanitizeTransferId(value: string | null | undefined) {
  const clean = value?.trim();
  return clean && /^[a-zA-Z0-9-]{12,80}$/.test(clean) ? clean : null;
}

function createTransferId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `handoff-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getStorageKey(transferId: string) {
  return `${STORAGE_KEY_PREFIX}${transferId}`;
}

function getSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function prefixCurrentBasePath(path: string) {
  if (typeof window === "undefined" || !path.startsWith("/apps/")) {
    return path;
  }

  const appsIndex = window.location.pathname.indexOf("/apps/");
  if (appsIndex <= 0) {
    return path;
  }

  return `${window.location.pathname.slice(0, appsIndex)}${path}`;
}
