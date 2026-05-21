export type RuntimeMonitoringEvent = {
  type: "error" | "unhandledrejection";
  message: string;
  release: string;
  path: string;
  timestamp: string;
};

const STORAGE_KEY = "project-site:runtime-monitoring:v1";
const MAX_EVENTS = 50;

function getReleaseVersion() {
  return process.env.NEXT_PUBLIC_RELEASE_VERSION?.trim() || "dev-local";
}

function sanitizeMessage(value: unknown) {
  if (typeof value === "string") {
    return value.slice(0, 400);
  }
  if (value instanceof Error) {
    return `${value.name}: ${value.message}`.slice(0, 400);
  }
  return "Onbekende fout";
}

function readStoredEvents(): RuntimeMonitoringEvent[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is RuntimeMonitoringEvent => {
      return (
        typeof item === "object" &&
        item !== null &&
        (item as RuntimeMonitoringEvent).type !== undefined &&
        typeof (item as RuntimeMonitoringEvent).message === "string" &&
        typeof (item as RuntimeMonitoringEvent).release === "string" &&
        typeof (item as RuntimeMonitoringEvent).path === "string" &&
        typeof (item as RuntimeMonitoringEvent).timestamp === "string"
      );
    });
  } catch {
    return [];
  }
}

function storeEvent(event: RuntimeMonitoringEvent) {
  if (typeof window === "undefined") {
    return;
  }
  const events = readStoredEvents();
  events.push(event);
  const trimmed = events.slice(-MAX_EVENTS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

async function sendToWebhook(event: RuntimeMonitoringEvent) {
  const webhookUrl = process.env.NEXT_PUBLIC_MONITORING_WEBHOOK_URL?.trim();
  if (!webhookUrl || typeof window === "undefined") {
    return;
  }
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(event),
      keepalive: true,
    });
  } catch {
    // Stil falen: monitoring mag de appflow niet blokkeren.
  }
}

function createEvent(
  type: RuntimeMonitoringEvent["type"],
  message: unknown,
): RuntimeMonitoringEvent {
  return {
    type,
    message: sanitizeMessage(message),
    release: getReleaseVersion(),
    path: typeof window !== "undefined" ? window.location.pathname : "/",
    timestamp: new Date().toISOString(),
  };
}

export function registerRuntimeMonitoring() {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onError = (event: ErrorEvent) => {
    const monitoringEvent = createEvent("error", event.error ?? event.message);
    storeEvent(monitoringEvent);
    void sendToWebhook(monitoringEvent);
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    const monitoringEvent = createEvent("unhandledrejection", event.reason);
    storeEvent(monitoringEvent);
    void sendToWebhook(monitoringEvent);
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
  };
}

export function getRuntimeMonitoringStorageKey() {
  return STORAGE_KEY;
}
