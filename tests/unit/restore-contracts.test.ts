import { describe, expect, it } from "vitest";

import examplePack from "../../packs/examples/javascript-fundamentals.track.json";
import { applyBackupRestore } from "@/features/restore/api";
import { previewRestore } from "@/features/restore/restore-contracts";
import type { TrackImportRepository } from "@/features/import/api";

const backupExport = {
  schema: "know-os.export.v1",
  kind: "backup",
  exportedAt: "2026-07-30T12:00:00.000Z",
  privacy: {
    warnings: [],
    includesPrivateSourceCode: true,
    includesProjectContext: true
  },
  payload: {
    packManifests: [examplePack],
    tracks: [{}],
    knowledgeMap: [{}],
    masteryEvidence: [{}],
    recentAttempts: [{}],
    dueReviews: [],
    mistakes: [],
    projects: [{}],
    xpSummary: {
      totalXp: 60,
      transactions: [{}]
    },
    events: [{}]
  }
};

describe("previewRestore", () => {
  it("builds a non-destructive restore preview for Backup exports", () => {
    expect(previewRestore(backupExport)).toMatchObject({
      status: "ready",
      schema: "know-os.restore-preview.v1",
      sourceExportedAt: "2026-07-30T12:00:00.000Z",
      applicationMode: "non_destructive_plan",
      categories: expect.any(Array)
    });
    expect(previewRestore(backupExport)).toMatchObject({
      status: "ready",
      categories: expect.arrayContaining([
        expect.objectContaining({ id: "pack_manifests", count: 1, private: false }),
        expect.objectContaining({ id: "content_references", count: 1, private: false }),
        expect.objectContaining({ id: "attempts", count: 1, private: true }),
        expect.objectContaining({ id: "projects", count: 1, private: true })
      ])
    });
  });

  it("rejects non-backup export kinds", () => {
    expect(previewRestore({ ...backupExport, kind: "teacher_context" })).toMatchObject({
      status: "invalid",
      code: "unsupported_restore_kind"
    });
  });

  it("applies Pack manifests non-destructively and skips automatic user-state overwrite", async () => {
    const repository: TrackImportRepository & { applied: number } = {
      applied: 0,
      async findPackImport() {
        return null;
      },
      async applyTrackPack() {
        this.applied += 1;

        return {
          trackStableId: "javascript",
          importedLessons: 1,
          importedActivities: 2
        };
      }
    };

    await expect(applyBackupRestore(backupExport, repository)).resolves.toMatchObject({
      status: "applied",
      restoredPacks: 1,
      alreadyImportedPacks: 0,
      skippedUserStateCategories: expect.arrayContaining(["attempts", "mastery_evidence", "history"])
    });
    expect(repository.applied).toBe(1);
  });
});
