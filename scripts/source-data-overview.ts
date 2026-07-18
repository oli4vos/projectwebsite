import {
  getDatasetFreshness,
  listDatasets,
  SOURCE_DATA_REFERENCE_DATE,
  SOURCE_DATASET_REGISTRY,
} from "../src/lib/financial-constants/source-datasets";
import type { SourceDataset } from "../src/lib/financial-constants/types";

function formatValue(value: string | number | undefined) {
  return value === undefined || value === "" ? "-" : String(value);
}

export function buildSourceDataOverviewMarkdown(
  registry: readonly SourceDataset[] = SOURCE_DATASET_REGISTRY,
  asOf = SOURCE_DATA_REFERENCE_DATE,
) {
  const rows = listDatasets(registry).map((dataset) => {
    const freshness = getDatasetFreshness(dataset, asOf);

    return [
      dataset.meta.id,
      dataset.meta.title,
      formatValue(dataset.meta.year),
      dataset.meta.version,
      dataset.meta.status,
      dataset.meta.effectiveFrom,
      formatValue(dataset.meta.effectiveTo),
      dataset.meta.lastVerifiedAt,
      dataset.meta.nextReviewAt,
      `[${dataset.meta.sourceName}](${dataset.meta.sourceUrl})`,
      dataset.usedBy.length > 0 ? dataset.usedBy.join(", ") : "-",
      formatValue(dataset.meta.supersedes),
      freshness.status,
    ];
  });

  return [
    "# Source Data Overview",
    "",
    `Generated from \`SOURCE_DATASET_REGISTRY\` in \`src/lib/financial-constants/source-datasets.ts\`. Peildatum: ${asOf}.`,
    "",
    "Regenerate with `npm run generate:source-overview`. Do not edit table rows manually.",
    "",
    "| Dataset-id | Titel | Jaar | Versie | Status | Effective from | Effective to | Last verified | Next review | Bron | Gebruikte modules/tools | Supersedes | Freshness |",
    "|---|---|---:|---|---|---|---|---|---|---|---|---|---|",
    ...rows.map((row) => `| ${row.join(" | ")} |`),
    "",
  ].join("\n");
}
