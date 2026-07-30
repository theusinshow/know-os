import { count, eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { afterEach, describe, expect, it } from "vitest";

import { GamificationRepository } from "@/db/repositories/gamification-repository";
import { badgeAwards, missionProgress, missionProgressEvents } from "@/db/schema";
import { buildGamificationSummary } from "@/features/gamification/gamification-rules";

import { createMigratedPgliteTestDatabase } from "./pglite-test-db";

type TestDb = Awaited<ReturnType<typeof createMigratedPgliteTestDatabase>>;

describe("GamificationRepository", () => {
  let testDb: TestDb | undefined;

  afterEach(async () => {
    await testDb?.close();
    testDb = undefined;
  });

  it("materializes badge awards once and audits mission status changes", async () => {
    testDb = await createMigratedPgliteTestDatabase();
    const repository = new GamificationRepository(testDb.db as never);
    const completeSummary = buildGamificationSummary({
      xp: {
        totalXp: 60,
        transactions: [
          {
            id: "xp-1",
            amount: 60,
            reason: "code_activity_passed",
            sourceType: "attempt",
            sourceId: "attempt-1",
            createdAt: new Date("2026-07-30T12:00:00.000Z")
          }
        ]
      },
      dueReviews: [],
      mistakes: []
    });

    await repository.syncSummary("local-owner", completeSummary);
    await repository.syncSummary("local-owner", completeSummary);

    await expect(countRows(testDb.db, badgeAwards)).resolves.toBe(1);
    await expect(countRows(testDb.db, missionProgress)).resolves.toBe(3);
    await expect(countRows(testDb.db, missionProgressEvents)).resolves.toBe(3);

    const reopenedSummary = buildGamificationSummary({
      xp: {
        totalXp: 60,
        transactions: [
          {
            id: "xp-1",
            amount: 60,
            reason: "code_activity_passed",
            sourceType: "attempt",
            sourceId: "attempt-1",
            createdAt: new Date("2026-07-30T12:00:00.000Z")
          }
        ]
      },
      dueReviews: [
        {
          conceptStableId: "concept-a",
          conceptTitle: "Concept A",
          currentMasteryState: "understood",
          nextReviewAt: new Date("2026-07-31T12:00:00.000Z"),
          reviewCount: 1,
          recentQuality: 3,
          reason: "Review due"
        }
      ],
      mistakes: []
    });

    await repository.syncSummary("local-owner", reopenedSummary);

    await expect(countRows(testDb.db, badgeAwards)).resolves.toBe(1);
    await expect(countRows(testDb.db, missionProgressEvents)).resolves.toBe(4);
    const [reviewMission] = await testDb.db
      .select({ status: missionProgress.status, completedAt: missionProgress.completedAt })
      .from(missionProgress)
      .where(eq(missionProgress.missionId, "review-due"));

    expect(reviewMission).toMatchObject({
      status: "available",
      completedAt: expect.any(Date)
    });
  });
});

async function countRows(db: TestDb["db"], table: PgTable) {
  const [row] = await db.select({ value: count() }).from(table);
  return row?.value ?? 0;
}
