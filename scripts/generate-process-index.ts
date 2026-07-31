import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { buildProcessIndex, processIndexPath, projectRoot } from "./process-docs-lib";

const absolutePath = join(projectRoot, processIndexPath);
mkdirSync(dirname(absolutePath), { recursive: true });
writeFileSync(absolutePath, buildProcessIndex(), "utf8");
console.log(`Generated ${processIndexPath}.`);
