import examplePack from "../../packs/examples/javascript-fundamentals.track.json";
import { count, eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { afterEach, describe, expect, it } from "vitest";

import { DrizzleTrackImportRepository } from "@/db/repositories/track-import-repository";
import { activities, attempts, contentBlocks, lessons, packImports, studyEvents, tracks } from "@/db/schema";
import { importTrackPack } from "@/features/import/api";

import { createMigratedPgliteTestDatabase } from "./pglite-test-db";

type TestDb = Awaited<ReturnType<typeof createMigratedPgliteTestDatabase>>;

describe("DrizzleTrackImportRepository", () => {
  let testDb: TestDb | undefined;

  afterEach(async () => {
    await testDb?.close();
    testDb = undefined;
  });

  it("applies the example Track Pack transactionally and keeps user-state tables untouched", async () => {
    testDb = await createMigratedPgliteTestDatabase();
    const repository = new DrizzleTrackImportRepository(testDb.db as never);

    const result = await importTrackPack(examplePack, repository);

    expect(result).toMatchObject({
      status: "imported",
      summary: {
        trackStableId: "javascript",
        importedLessons: 1,
        importedActivities: 2
      }
    });

    await expect(countRows(testDb.db, packImports)).resolves.toBe(1);
    await expect(countRows(testDb.db, tracks)).resolves.toBe(1);
    await expect(countRows(testDb.db, lessons)).resolves.toBe(1);
    await expect(countRows(testDb.db, contentBlocks)).resolves.toBe(2);
    await expect(countRows(testDb.db, activities)).resolves.toBe(2);
    await expect(countRows(testDb.db, attempts)).resolves.toBe(0);
    await expect(countRows(testDb.db, studyEvents)).resolves.toBe(0);
  });

  it("does not duplicate content when the same Pack version is imported again", async () => {
    testDb = await createMigratedPgliteTestDatabase();
    const repository = new DrizzleTrackImportRepository(testDb.db as never);

    await expect(importTrackPack(examplePack, repository)).resolves.toMatchObject({ status: "imported" });
    await expect(importTrackPack(examplePack, repository)).resolves.toMatchObject({ status: "already_imported" });

    await expect(countRows(testDb.db, packImports)).resolves.toBe(1);
    await expect(countRows(testDb.db, tracks)).resolves.toBe(1);
    await expect(countRows(testDb.db, lessons)).resolves.toBe(1);
    await expect(countRows(testDb.db, activities)).resolves.toBe(2);
  });

  it("reports a conflict without mutating when same Pack version has different content", async () => {
    testDb = await createMigratedPgliteTestDatabase();
    const repository = new DrizzleTrackImportRepository(testDb.db as never);
    const changedPack = structuredClone(examplePack);

    await expect(importTrackPack(examplePack, repository)).resolves.toMatchObject({ status: "imported" });
    changedPack.track.title = "JavaScript alterado";

    await expect(importTrackPack(changedPack, repository)).resolves.toMatchObject({ status: "conflict" });
    await expect(countRows(testDb.db, packImports)).resolves.toBe(1);
    await expect(
      testDb.db.select({ title: tracks.title }).from(tracks).where(eq(tracks.stableId, "javascript"))
    ).resolves.toEqual([{ title: "JavaScript" }]);
  });
});

async function countRows(db: TestDb["db"], table: PgTable) {
  const [row] = await db.select({ value: count() }).from(table);
  return row?.value ?? 0;
}
