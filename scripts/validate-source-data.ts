import process from "node:process";
import { validateDatasetRegistry } from "../src/lib/financial-constants/source-datasets";

const result = validateDatasetRegistry();

for (const warning of result.warnings) {
  console.warn(`WARN ${warning.datasetId ?? "source-data"}: ${warning.message}`);
}

if (!result.ok) {
  for (const error of result.errors) {
    console.error(`ERROR ${error.datasetId ?? "source-data"}: ${error.message}`);
  }
  process.exit(1);
}

console.log(
  `Source data validation passed with ${result.warnings.length} warning(s).`,
);
