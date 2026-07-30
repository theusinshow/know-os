import examplePack from "../../packs/examples/javascript-fundamentals.track.json";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProjectRepository } from "@/db/repositories/project-repository";
import { DrizzleTrackImportRepository } from "@/db/repositories/track-import-repository";
import { importTrackPack } from "@/features/import/api";

import { createMigratedPgliteTestDatabase } from "./pglite-test-db";

type TestDb = Awaited<ReturnType<typeof createMigratedPgliteTestDatabase>>;

describe("ProjectRepository", () => {
  let testDb: TestDb | undefined;

  afterEach(async () => {
    vi.unstubAllEnvs();
    await testDb?.close();
    testDb = undefined;
  });

  it("creates optional project contexts linked to imported concepts and activities", async () => {
    testDb = await createMigratedPgliteTestDatabase();
    await importTrackPack(examplePack, new DrizzleTrackImportRepository(testDb.db as never));
    const repository = new ProjectRepository(testDb.db as never);

    await expect(
      repository.createProject({
        ownerId: "local-owner",
        stableId: "access-control-refactor",
        title: "Refatoração de controle de acesso",
        description: "Aplicação real dos conceitos de condição e tipos.",
        conceptStableIds: ["js-logical-and", "missing-concept"],
        activityStableIds: ["js-logical-and-code-001", "missing-activity"]
      })
    ).resolves.toEqual({
      stableId: "access-control-refactor",
      linkedConcepts: 1,
      linkedActivities: 1
    });

    await expect(repository.listProjects("local-owner")).resolves.toMatchObject([
      {
        stableId: "access-control-refactor",
        title: "Refatoração de controle de acesso",
        conceptCount: 1,
        activityCount: 1,
        status: "active"
      }
    ]);
  });
});
