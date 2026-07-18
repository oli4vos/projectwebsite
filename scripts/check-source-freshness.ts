import {
  getDatasetFreshness,
  listDatasets,
  SOURCE_DATA_REFERENCE_DATE,
} from "../src/lib/financial-constants/source-datasets";

const warnings = listDatasets()
  .map((dataset) => ({
    dataset,
    freshness: getDatasetFreshness(dataset, SOURCE_DATA_REFERENCE_DATE),
  }))
  .filter(({ freshness }) => freshness.status !== "fresh");

if (warnings.length === 0) {
  console.log("Source freshness check passed without warnings.");
} else {
  for (const { dataset, freshness } of warnings) {
    console.warn(
      `WARN ${dataset.meta.id}: ${freshness.status}${freshness.message ? ` - ${freshness.message}` : ""}`,
    );
  }
  console.log(`Source freshness check completed with ${warnings.length} warning(s).`);
}
