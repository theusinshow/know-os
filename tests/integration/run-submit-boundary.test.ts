import examplePack from "../../packs/examples/javascript-fundamentals.track.json";
import { count } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActivityAttemptRepository } from "@/db/repositories/activity-attempt-repository";
import { ConceptEvidenceRepository } from "@/db/repositories/concept-evidence-repository";
import { XpRepository } from "@/db/repositories/xp-repository";
import { DrizzleTrackImportRepository } from "@/db/repositories/track-import-repository";
import { attempts, conceptEvidence, lessonProgress, studyEvents, trackProgress, xpTransactions } from "@/db/schema";
import { importTrackPack } from "@/features/import/api";
import { getLatestActivityAttemptFeedback, runCodeActivity, submitCodeActivity } from "@/features/activities/api";

import { createMigratedPgliteTestDatabase } from "./pglite-test-db";

type TestDb = Awaited<ReturnType<typeof createMigratedPgliteTestDatabase>>;

const passingSource =
  "const documentExists = true;\nconst userAuthorized = false;\nconst canOpen = documentExists && userAuthorized;\nconsole.log(canOpen);";

describe("RUN and SUBMIT boundaries", () => {
  let testDb: TestDb | undefined;

  afterEach(async () => {
    vi.unstubAllEnvs();
    await testDb?.close();
    testDb = undefined;
  });

  it("RUN evaluates code without recording an Attempt or StudyEvent", async () => {
    vi.stubEnv("KNOW_OS_OWNER_ID", "local-owner");
    testDb = await createImportedSlice();
    const repository = new ActivityAttemptRepository(testDb.db as never);

    const result = await runCodeActivity("js-logical-and-code-001", passingSource, repository);

    expect(result).toMatchObject({
      status: "executed",
      attemptsBefore: 0,
      execution: {
        status: "completed",
        stdout: ["false"]
      }
    });
    await expect(countRows(testDb.db, attempts)).resolves.toBe(0);
    await expect(countRows(testDb.db, conceptEvidence)).resolves.toBe(0);
    await expect(countRows(testDb.db, studyEvents)).resolves.toBe(0);
    await expect(countRows(testDb.db, xpTransactions)).resolves.toBe(0);
  });

  it("SUBMIT records exactly one immutable Attempt, concept evidence, progress projection and StudyEvent", async () => {
    vi.stubEnv("KNOW_OS_OWNER_ID", "local-owner");
    testDb = await createImportedSlice();
    const repository = new ActivityAttemptRepository(testDb.db as never);
    const evidenceRepository = new ConceptEvidenceRepository(testDb.db as never);
    const xpRepository = new XpRepository(testDb.db as never);

    const result = await submitCodeActivity("js-logical-and-code-001", passingSource, repository);

    expect(result).toMatchObject({
      status: "submitted",
      evaluation: {
        outcome: "passed"
      },
      submission: {
        attemptNumber: 1,
        outcome: "passed",
        progressUpdated: true,
        eventType: "activity_submitted"
      }
    });
    await expect(countRows(testDb.db, attempts)).resolves.toBe(1);
    await expect(countRows(testDb.db, conceptEvidence)).resolves.toBe(1);
    await expect(countRows(testDb.db, studyEvents)).resolves.toBe(1);
    await expect(countRows(testDb.db, lessonProgress)).resolves.toBe(1);
    await expect(countRows(testDb.db, trackProgress)).resolves.toBe(1);
    await expect(countRows(testDb.db, xpTransactions)).resolves.toBe(1);
    await expect(xpRepository.getSummary("local-owner")).resolves.toMatchObject({
      totalXp: 60,
      transactions: [
        {
          amount: 60,
          reason: "code_activity_passed",
          sourceType: "attempt"
        }
      ]
    });
    await expect(evidenceRepository.listForConcept("local-owner", "js-logical-and")).resolves.toMatchObject([
      {
        conceptStableId: "js-logical-and",
        type: "code_written",
        strength: 2,
        sourceType: "activity_attempt",
        attemptId: result.status === "submitted" ? result.submission.attemptId : ""
      }
    ]);
  });

  it("does not award duplicate XP for repeated passed submissions of the same activity", async () => {
    vi.stubEnv("KNOW_OS_OWNER_ID", "local-owner");
    testDb = await createImportedSlice();
    const repository = new ActivityAttemptRepository(testDb.db as never);
    const xpRepository = new XpRepository(testDb.db as never);

    await submitCodeActivity("js-logical-and-code-001", passingSource, repository);
    await submitCodeActivity("js-logical-and-code-001", passingSource, repository);

    await expect(countRows(testDb.db, attempts)).resolves.toBe(2);
    await expect(countRows(testDb.db, xpTransactions)).resolves.toBe(1);
    await expect(xpRepository.getSummary("local-owner")).resolves.toMatchObject({
      totalXp: 60
    });
  });

  it("exposes the latest persisted attempt feedback for activity renderers", async () => {
    vi.stubEnv("KNOW_OS_OWNER_ID", "local-owner");
    testDb = await createImportedSlice();
    const repository = new ActivityAttemptRepository(testDb.db as never);

    await submitCodeActivity("js-logical-and-code-001", passingSource, repository);

    const feedback = await getLatestActivityAttemptFeedback("js-logical-and-code-001", repository);

    expect(feedback).toMatchObject({
      attemptNumber: 1,
      outcome: "passed",
      execution: {
        status: "completed",
        stdout: ["false"]
      },
      tests: [
        {
          name: "uses both conditions",
          status: "passed"
        },
        {
          name: "current example is false",
          status: "passed"
        }
      ]
    });
    expect(feedback?.submittedAt).toEqual(expect.any(String));
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
