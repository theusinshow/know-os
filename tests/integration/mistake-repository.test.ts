import examplePack from "../../packs/examples/javascript-fundamentals.track.json";
import { count } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActivityAttemptRepository } from "@/db/repositories/activity-attempt-repository";
import { MistakeRepository } from "@/db/repositories/mistake-repository";
import { DrizzleTrackImportRepository } from "@/db/repositories/track-import-repository";
import { mistakes } from "@/db/schema";
import { submitCodeActivity } from "@/features/activities/api";
import { importTrackPack } from "@/features/import/api";

import { createMigratedPgliteTestDatabase } from "./pglite-test-db";

type TestDb = Awaited<ReturnType<typeof createMigratedPgliteTestDatabase>>;

const failingSource =
  "const documentExists = true;\nconst userAuthorized = false;\nconst canOpen = false;\nconsole.log(canOpen);";
const passingSource =
  "const documentExists = true;\nconst userAuthorized = false;\nconst canOpen = documentExists && userAuthorized;\nconsole.log(canOpen);";

describe("MistakeRepository", () => {
  let testDb: TestDb | undefined;

  afterEach(async () => {
    vi.unstubAllEnvs();
    await testDb?.close();
    testDb = undefined;
  });

  it("keeps corrected mistakes in history with resolved state", async () => {
    vi.stubEnv("KNOW_OS_OWNER_ID", "local-owner");
    testDb = await createImportedSlice();
    const attemptRepository = new ActivityAttemptRepository(testDb.db as never);
    const mistakeRepository = new MistakeRepository(testDb.db as never);

    await submitCodeActivity("js-logical-and-code-001", failingSource, attemptRepository);

    await expect(countRows(testDb.db, mistakes)).resolves.toBe(1);
    await expect(mistakeRepository.listMistakes("local-owner")).resolves.toMatchObject([
      {
        conceptStableId: "js-logical-and",
        category: "failed_check",
        status: "active"
      }
    ]);

    await submitCodeActivity("js-logical-and-code-001", passingSource, attemptRepository);

    await expect(countRows(testDb.db, mistakes)).resolves.toBe(1);
    await expect(mistakeRepository.listMistakes("local-owner")).resolves.toMatchObject([
      {
        conceptStableId: "js-logical-and",
        category: "failed_check",
        status: "resolved",
        resolvedAt: expect.any(Date)
      }
    ]);
  });
});

async function createImportedSlice() {
  const testDb = await createMigratedPgliteTestDatabase();
  const importRepository = new DrizzleTrackImportRepository(testDb.db as never);
  await importTrackPack(examplePack, importRepository);
  return testDb;
}

async function countRows(db: TestDb["db"], table: PgTable) {
  const [row] = await db.select({ value: count() }).from(table);
  return row?.value ?? 0;
}
