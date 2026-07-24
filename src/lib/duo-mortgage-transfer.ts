import type {
  DuoMortgageAssessmentResult,
  DuoMortgageAssessmentSituation,
} from "@/lib/duo";

export const DUO_MORTGAGE_TRANSFER_QUERY_PARAM = "duoMortgageTransfer";
export const DUO_MORTGAGE_TRANSFER_SCHEMA_VERSION = 1;
export const DUO_MORTGAGE_TRANSFER_TTL_MS = 45 * 60 * 1000;

const STORAGE_KEY_PREFIX = "project-site:duo-mortgage-transfer:v1:";
const ALLOWED_RETURN_PATHS = [
  "/apps/hypotheek-impact-studieschuld",
  "/apps/artifact-hypotheek-wonen-maximale-hypotheek",
] as const;
const ALLOWED_SOURCE_TOOLS = [
  "hypotheek-impact-studieschuld",
  "artifact-hypotheek-wonen-maximale-hypotheek",
] as const;
const ALLOWED_TARGET_TOOLS = ["duo-maandbedrag"] as const;

export type DuoMortgageTransferSourceTool = (typeof ALLOWED_SOURCE_TOOLS)[number];
export type DuoMortgageTransferTargetTool = (typeof ALLOWED_TARGET_TOOLS)[number];
export type DuoMortgageTransferReturnPath = (typeof ALLOWED_RETURN_PATHS)[number];
export type DuoMortgageTransferStatus = "active" | "candidate-ready" | "consumed" | "cancelled";

export type DuoMortgageTransferCandidate = {
  assessment: DuoMortgageAssessmentResult;
  sourceSituation: DuoMortgageAssessmentSituation;
  recommendedMonthlyAssessmentPayment: number;
  createdAt: string;
};

export type DuoMortgageTransferRecord<TDraft = Record<string, unknown>> = {
  schemaVersion: typeof DUO_MORTGAGE_TRANSFER_SCHEMA_VERSION;
  transferId: string;
  createdAt: string;
  expiresAt: string;
  sourceTool: DuoMortgageTransferSourceTool;
  targetTool: DuoMortgageTransferTargetTool;
  returnPath: DuoMortgageTransferReturnPath;
  returnStep?: string;
  returnAnchor?: string;
  draft: TDraft;
  expectedResultType: "duoMortgageAssessmentPayment";
  status: DuoMortgageTransferStatus;
  candidate?: DuoMortgageTransferCandidate;
  consumedAt?: string;
};

export type DuoMortgageTransferErrorCode =
  | "storage-unavailable"
  | "storage-write-failed"
  | "missing-transfer"
  | "corrupt-transfer"
  | "expired-transfer"
  | "invalid-transfer"
  | "wrong-source"
  | "wrong-target"
  | "consumed-transfer"
  | "cancelled-transfer";

export type DuoMortgageTransferResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: DuoMortgageTransferErrorCode };

export function isAllowedDuoMortgageReturnPath(
  value: string,
): value is DuoMortgageTransferReturnPath {
  return (ALLOWED_RETURN_PATHS as readonly string[]).includes(value);
}

export function createDuoMortgageTransfer<TDraft>(
  input: {
    sourceTool: DuoMortgageTransferSourceTool;
    targetTool: DuoMortgageTransferTargetTool;
    returnPath: DuoMortgageTransferReturnPath;
    returnStep?: string;
    returnAnchor?: string;
    draft: TDraft;
  },
  now = new Date(),
): DuoMortgageTransferResult<DuoMortgageTransferRecord<TDraft>> {
  const storage = getSessionStorage();
  if (!storage) {
    return { ok: false, error: "storage-unavailable" };
  }

  const record: DuoMortgageTransferRecord<TDraft> = {
    schemaVersion: DUO_MORTGAGE_TRANSFER_SCHEMA_VERSION,
    transferId: createTransferId(),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + DUO_MORTGAGE_TRANSFER_TTL_MS).toISOString(),
    sourceTool: input.sourceTool,
    targetTool: input.targetTool,
    returnPath: input.returnPath,
    returnStep: input.returnStep,
    returnAnchor: input.returnAnchor,
    draft: input.draft,
    expectedResultType: "duoMortgageAssessmentPayment",
    status: "active",
  };

  return writeRecord(storage, record);
}

export function readDuoMortgageTransfer<TDraft = Record<string, unknown>>(
  transferId: string | null | undefined,
  expected?: {
    sourceTool?: DuoMortgageTransferSourceTool;
    targetTool?: DuoMortgageTransferTargetTool;
    allowCandidateReady?: boolean;
  },
  now = new Date(),
): DuoMortgageTransferResult<DuoMortgageTransferRecord<TDraft>> {
  const storage = getSessionStorage();
  if (!storage) {
    return { ok: false, error: "storage-unavailable" };
  }

  const cleanTransferId = sanitizeTransferId(transferId);
  if (!cleanTransferId) {
    return { ok: false, error: "missing-transfer" };
  }

  let raw: string | null;
  try {
    raw = storage.getItem(getStorageKey(cleanTransferId));
  } catch {
    return { ok: false, error: "storage-unavailable" };
  }

  if (!raw) {
    return { ok: false, error: "missing-transfer" };
  }

  const parsed = parseRecord<TDraft>(raw);
  if (!parsed) {
    return { ok: false, error: "corrupt-transfer" };
  }

  return validateRecord(parsed, expected, now);
}

export function attachDuoMortgageTransferCandidate<TDraft>(
  transferId: string,
  candidate: DuoMortgageTransferCandidate,
  now = new Date(),
): DuoMortgageTransferResult<DuoMortgageTransferRecord<TDraft>> {
  const current = readDuoMortgageTransfer<TDraft>(
    transferId,
    { targetTool: "duo-maandbedrag" },
    now,
  );
  if (!current.ok) {
    return current;
  }

  return updateDuoMortgageTransfer({
    ...current.data,
    candidate,
    status: "candidate-ready",
  });
}

export function consumeDuoMortgageTransfer<TDraft>(
  transferId: string,
  now = new Date(),
): DuoMortgageTransferResult<DuoMortgageTransferRecord<TDraft>> {
  const current = readDuoMortgageTransfer<TDraft>(
    transferId,
    {
      targetTool: "duo-maandbedrag",
      allowCandidateReady: true,
    },
    now,
  );
  if (!current.ok) {
    return current;
  }

  return updateDuoMortgageTransfer({
    ...current.data,
    status: "consumed",
    consumedAt: now.toISOString(),
  });
}

export function cancelDuoMortgageTransfer<TDraft>(
  transferId: string,
  now = new Date(),
): DuoMortgageTransferResult<DuoMortgageTransferRecord<TDraft>> {
  const current = readDuoMortgageTransfer<TDraft>(
    transferId,
    {
      targetTool: "duo-maandbedrag",
      allowCandidateReady: true,
    },
    now,
  );
  if (!current.ok) {
    return current;
  }

  return updateDuoMortgageTransfer({
    ...current.data,
    status: "cancelled",
    consumedAt: now.toISOString(),
  });
}

export function getDuoMortgageTransferIdFromUrl(search: string) {
  return sanitizeTransferId(new URLSearchParams(search).get(DUO_MORTGAGE_TRANSFER_QUERY_PARAM));
}

export function getDuoMortgageTransferUrl(
  path: string,
  transferId: string,
  anchor?: string,
) {
  const params = new URLSearchParams();
  params.set(DUO_MORTGAGE_TRANSFER_QUERY_PARAM, transferId);
  const prefixedPath = prefixCurrentBasePath(path);
  return `${prefixedPath}?${params.toString()}${anchor ? `#${encodeURIComponent(anchor)}` : ""}`;
}

function updateDuoMortgageTransfer<TDraft>(
  record: DuoMortgageTransferRecord<TDraft>,
): DuoMortgageTransferResult<DuoMortgageTransferRecord<TDraft>> {
  const storage = getSessionStorage();
  if (!storage) {
    return { ok: false, error: "storage-unavailable" };
  }

  return writeRecord(storage, record);
}

function writeRecord<TDraft>(
  storage: Storage,
  record: DuoMortgageTransferRecord<TDraft>,
): DuoMortgageTransferResult<DuoMortgageTransferRecord<TDraft>> {
  try {
    storage.setItem(getStorageKey(record.transferId), JSON.stringify(record));
    return { ok: true, data: record };
  } catch {
    return { ok: false, error: "storage-write-failed" };
  }
}

function validateRecord<TDraft>(
  record: DuoMortgageTransferRecord<TDraft>,
  expected: {
    sourceTool?: DuoMortgageTransferSourceTool;
    targetTool?: DuoMortgageTransferTargetTool;
    allowCandidateReady?: boolean;
  } = {},
  now = new Date(),
): DuoMortgageTransferResult<DuoMortgageTransferRecord<TDraft>> {
  if (
    record.schemaVersion !== DUO_MORTGAGE_TRANSFER_SCHEMA_VERSION ||
    !sanitizeTransferId(record.transferId) ||
    !isAllowedDuoMortgageReturnPath(record.returnPath) ||
    !(ALLOWED_SOURCE_TOOLS as readonly string[]).includes(record.sourceTool) ||
    !(ALLOWED_TARGET_TOOLS as readonly string[]).includes(record.targetTool) ||
    record.expectedResultType !== "duoMortgageAssessmentPayment" ||
    !["active", "candidate-ready", "consumed", "cancelled"].includes(record.status)
  ) {
    return { ok: false, error: "invalid-transfer" };
  }

  if (expected.sourceTool && record.sourceTool !== expected.sourceTool) {
    return { ok: false, error: "wrong-source" };
  }

  if (expected.targetTool && record.targetTool !== expected.targetTool) {
    return { ok: false, error: "wrong-target" };
  }

  if (new Date(record.expiresAt).getTime() <= now.getTime()) {
    return { ok: false, error: "expired-transfer" };
  }

  if (record.status === "consumed") {
    return { ok: false, error: "consumed-transfer" };
  }

  if (record.status === "cancelled") {
    return { ok: false, error: "cancelled-transfer" };
  }

  if (record.status === "candidate-ready" && !expected.allowCandidateReady) {
    return { ok: false, error: "invalid-transfer" };
  }

  return { ok: true, data: record };
}

function parseRecord<TDraft>(raw: string): DuoMortgageTransferRecord<TDraft> | null {
  try {
    const parsed = JSON.parse(raw) as Partial<DuoMortgageTransferRecord<TDraft>>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed as DuoMortgageTransferRecord<TDraft>;
  } catch {
    return null;
  }
}

function sanitizeTransferId(value: string | null | undefined) {
  const clean = value?.trim();
  return clean && /^[a-zA-Z0-9-]{12,80}$/.test(clean) ? clean : null;
}

function createTransferId() {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  return `transfer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
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

  const currentPath = window.location.pathname;
  const appsIndex = currentPath.indexOf("/apps/");
  if (appsIndex <= 0) {
    return path;
  }

  const basePath = currentPath.slice(0, appsIndex);
  return `${basePath}${path}`;
}
