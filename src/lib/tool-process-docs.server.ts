import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parsePublishedToolProcess } from "@/lib/tool-process";

export function getPublishedToolProcess(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Ongeldige tool-ID voor procesdocumentatie: ${slug}`);
  }

  const processPath = join(process.cwd(), "apps", slug, "PROCESS.md");
  return parsePublishedToolProcess(readFileSync(processPath, "utf8"));
}
