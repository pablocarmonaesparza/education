#!/usr/bin/env node

import path from "node:path";
import {
  CONTRACT_DIR,
  asArray,
  createServiceClient,
  jsonObject,
  readYamlFiles,
  upsertSingle,
} from "./seed-utils.mjs";

const APPLY = process.argv.includes("--apply");

function practiceBeatRow(beat) {
  const triggeredByGap = asArray(beat.triggered_by_gap).map(String);
  const dimension = beat.dimension ? String(beat.dimension) : null;

  return {
    slug: beat.id,
    title: beat.principle_card?.headline ?? beat.id,
    target_gap_keys: triggeredByGap,
    duration_estimate_min: Math.max(
      1,
      Math.ceil(Number(beat.duration_max_seconds ?? 120) / 60),
    ),
    content_json: jsonObject(beat),
    status: beat.status ?? "draft",
    dimension_key: dimension,
    level: beat.level ?? null,
    career_key: beat.career_key ?? "marketing",
    expected_signals_json: {
      triggered_by_gap: triggeredByGap,
      dimension,
      exercise_type: beat.practice_exercise?.type ?? null,
    },
    completion_criteria_json: {
      duration_max_seconds: beat.duration_max_seconds ?? null,
      contributes_to_resim_score: beat.exit?.contributes_to_resim_score ?? false,
      success_rule: beat.completion_criteria ?? null,
    },
  };
}

async function main() {
  const practiceFiles = readYamlFiles(
    path.join(CONTRACT_DIR, "practice_beats"),
    "practice_beat",
  );
  const rows = practiceFiles.map(({ value }) => practiceBeatRow(value));

  if (!APPLY) {
    console.log(
      `Dry run: ${rows.length} practice beats ready. Re-run with --apply to seed Supabase.`,
    );
    return;
  }

  const db = createServiceClient();
  for (const row of rows) {
    await upsertSingle(
      db,
      "practice_beats",
      row,
      "slug",
      `practice_beats:${row.slug}`,
    );
  }

  console.log(`Seeded ${rows.length} practice beats.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
