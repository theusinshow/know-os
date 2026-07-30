import { getDatabaseUrl } from "@/db/connection";
import { MemoryTrackImportRepository } from "@/db/repositories/memory-store";
import { DrizzleTrackImportRepository } from "@/db/repositories/track-import-repository";
import { importTrackPack, type TrackImportRepository } from "@/features/import/api";

import { parseRestoreBackupPayload, previewRestore, type RestorePreviewResult } from "./restore-contracts";

export type RestoreApplyResult =
  | Readonly<{
      status: "applied";
      sourceExportedAt: string;
      restoredPacks: number;
      alreadyImportedPacks: number;
      skippedUserStateCategories: readonly string[];
      warning: string;
    }>
  | Readonly<{
      status: "invalid";
      preview: RestorePreviewResult;
    }>;

export async function applyBackupRestore(
  input: unknown,
  repository: TrackImportRepository = createTrackImportRepository()
): Promise<RestoreApplyResult> {
  const parsed = parseRestoreBackupPayload(input);

  if (!parsed.ok) {
    return { status: "invalid", preview: parsed.preview };
  }

  let restoredPacks = 0;
  let alreadyImportedPacks = 0;

  for (const manifest of parsed.payload.packManifests) {
    const result = await importTrackPack(manifest, repository);

    if (result.status === "invalid" || result.status === "conflict") {
      return {
        status: "invalid",
        preview: previewRestore(input)
      };
    }

    if (result.status === "imported") {
      restoredPacks += 1;
    }

    if (result.status === "already_imported") {
      alreadyImportedPacks += 1;
    }
  }

  return {
    status: "applied",
    sourceExportedAt: parsed.exportedAt,
    restoredPacks,
    alreadyImportedPacks,
    skippedUserStateCategories: [
      "mastery_evidence",
      "attempts",
      "review_queue",
      "mistakes",
      "projects",
      "xp",
      "gamification",
      "history"
    ],
    warning:
      "Restore V1 aplica conteúdo de forma não destrutiva. Estado do usuário é validado no plano e não é sobrescrito automaticamente."
  };
}

function createTrackImportRepository(): TrackImportRepository {
  if (getDatabaseUrl() === "memory://local") {
    return new MemoryTrackImportRepository();
  }

  return new DrizzleTrackImportRepository();
}
