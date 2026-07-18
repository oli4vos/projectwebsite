"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getVersionedPath, type SiteVersion } from "@/lib/version-routing";

type VersionSwitcherProps = {
  currentVersion: SiteVersion;
};

export function VersionSwitcher({ currentVersion }: VersionSwitcherProps) {
  const pathname = usePathname();
  const targetVersion: SiteVersion = currentVersion === "v1" ? "v2" : "v1";
  const href = getVersionedPath(pathname, targetVersion);
  const label = targetVersion === "v2" ? "v2" : "v1";

  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center rounded-lg border border-[var(--hair)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--ink)] transition hover:bg-[var(--paper-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
      title={`Wissel naar ${label}`}
    >
      {label}
    </Link>
  );
}
