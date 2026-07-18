export type SiteVersion = "v1" | "v2";

const V2_PREFIX = "/v2";

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "") || "/";
}

export function getVersionedPath(pathname: string, targetVersion: SiteVersion) {
  const normalized = normalizePath(pathname);
  const isV2 = normalized === V2_PREFIX || normalized.startsWith(`${V2_PREFIX}/`);

  if (targetVersion === "v2") {
    if (isV2) {
      return normalized;
    }

    return `${V2_PREFIX}${normalized === "/" ? "" : normalized}`;
  }

  if (!isV2) {
    return normalized;
  }

  const stripped = normalized.slice(V2_PREFIX.length);
  return stripped === "" ? "/" : stripped;
}

