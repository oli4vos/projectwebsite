export const USER_PREFERENCES_STORAGE_KEY = "project-site:user-preferences:v1";
export const USER_PREFERENCES_STORAGE_EVENT = "project-site:user-preferences:changed";

export type KnowledgeLevel = "basic" | "standard" | "advanced";

export type UserPreferences = {
  knowledgeLevel: KnowledgeLevel;
};

export const defaultUserPreferences: UserPreferences = {
  knowledgeLevel: "standard",
};

const knowledgeLevels = new Set<KnowledgeLevel>(["basic", "standard", "advanced"]);

export function sanitizeKnowledgeLevel(value: unknown): KnowledgeLevel {
  if (typeof value !== "string") {
    return defaultUserPreferences.knowledgeLevel;
  }
  return knowledgeLevels.has(value as KnowledgeLevel)
    ? (value as KnowledgeLevel)
    : defaultUserPreferences.knowledgeLevel;
}

export function sanitizeUserPreferences(value: unknown): UserPreferences {
  if (!value || typeof value !== "object") {
    return defaultUserPreferences;
  }

  const asObject = value as Partial<UserPreferences>;
  return {
    knowledgeLevel: sanitizeKnowledgeLevel(asObject.knowledgeLevel),
  };
}

export function getKnowledgeLevelLabel(level: KnowledgeLevel): string {
  if (level === "basic") {
    return "Basis";
  }
  if (level === "advanced") {
    return "Verdiept";
  }
  return "Normaal";
}

export function loadUserPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return defaultUserPreferences;
  }

  try {
    const rawValue = window.localStorage.getItem(USER_PREFERENCES_STORAGE_KEY);
    if (!rawValue) {
      return defaultUserPreferences;
    }
    return sanitizeUserPreferences(JSON.parse(rawValue));
  } catch {
    return defaultUserPreferences;
  }
}

export function saveUserPreferences(preferences: UserPreferences): UserPreferences {
  const sanitized = sanitizeUserPreferences(preferences);
  if (typeof window === "undefined") {
    return sanitized;
  }
  window.localStorage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(sanitized));
  window.dispatchEvent(new Event(USER_PREFERENCES_STORAGE_EVENT));
  return sanitized;
}
