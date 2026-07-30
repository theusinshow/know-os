import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import { getDatabase } from "@/db/connection";
import {
  activities,
  attemptTestResults,
  attempts,
  conceptEvidence,
  concepts,
  lessonProgress,
  lessons,
  mistakes,
  modules,
  owners,
  reviewSchedules,
  studyEvents,
  trackProgress,
  xpTransactions
} from "@/db/schema";
import type * as schema from "@/db/schema";
import { categorizeSubmissionMistake } from "@/features/mistakes/mistake-categorization";
import { calculateInitialReviewAt, REVIEW_POLICY_VERSION } from "@/features/review/review-policy";
import type { JavaScriptEvaluationResult, JavaScriptExecutionResult, JavaScriptTestResult } from "@/runtime/javascript/api";

type ActivityAttemptDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;

export type CodeActivityRecord = Readonly<{
  id: string;
  stableId: string;
  lessonId: string;
  trackId: string;
  type: string;
  prompt: string;
  config: unknown;
  evaluatorVersion: string;
}>;

export type RecordedSubmission = Readonly<{
  attemptId: string;
  attemptNumber: number;
  outcome: "passed" | "failed";
  progressUpdated: boolean;
  eventType: "activity_submitted";
}>;

export type LatestAttemptFeedback = Readonly<{
  attemptId: string;
  attemptNumber: number;
  outcome: "passed" | "failed";
  source: string;
  execution: JavaScriptExecutionResult;
  tests: JavaScriptTestResult[];
  createdAt: Date;
}>;

export class ActivityAttemptRepository {
  constructor(private readonly db: ActivityAttemptDatabase = getDatabase()) {}

  async getCodeActivity(stableId: string): Promise<CodeActivityRecord | null> {
    const [row] = await this.db
      .select({
        id: activities.id,
        stableId: activities.stableId,
        lessonId: activities.lessonId,
        trackId: modules.trackId,
        type: activities.type,
        prompt: activities.prompt,
        config: activities.config,
        evaluatorVersion: activities.evaluatorVersion
      })
      .from(activities)
      .innerJoin(lessons, eq(lessons.id, activities.lessonId))
      .innerJoin(modules, eq(modules.id, lessons.moduleId))
      .where(eq(activities.stableId, stableId))
      .limit(1);

    return row ?? null;
  }

  async countAttemptsForActivity(ownerId: string, activityId: string): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(attempts)
      .where(and(eq(attempts.ownerId, ownerId), eq(attempts.activityId, activityId)));

    return row?.value ?? 0;
  }

  async countStudyEvents(ownerId: string): Promise<number> {
    const [row] = await this.db.select({ value: count() }).from(studyEvents).where(eq(studyEvents.ownerId, ownerId));
    return row?.value ?? 0;
  }

  async getLatestAttemptFeedback(ownerId: string, activityId: string): Promise<LatestAttemptFeedback | null> {
    const [attempt] = await this.db
      .select({
        id: attempts.id,
        attemptNumber: attempts.attemptNumber,
        outcome: attempts.outcome,
        response: attempts.response,
        output: attempts.output,
        createdAt: attempts.createdAt
      })
      .from(attempts)
      .where(and(eq(attempts.ownerId, ownerId), eq(attempts.activityId, activityId)))
      .orderBy(desc(attempts.attemptNumber))
      .limit(1);

    if (!attempt) {
      return null;
    }

    const tests = await this.db
      .select({
        name: attemptTestResults.name,
        status: attemptTestResults.status,
        message: attemptTestResults.message
      })
      .from(attemptTestResults)
      .where(eq(attemptTestResults.attemptId, attempt.id));

    return {
      attemptId: attempt.id,
      attemptNumber: attempt.attemptNumber,
      outcome: attempt.outcome === "passed" ? "passed" : "failed",
      source: parseAttemptSource(attempt.response),
      execution: attempt.output as JavaScriptExecutionResult,
      tests: tests.map((test) => ({
        name: test.name,
        status: test.status === "passed" ? "passed" : "failed",
        message: test.message ?? ""
      })),
      createdAt: attempt.createdAt
    };
  }

  async recordSubmission({
    ownerId,
    activity,
    source,
    evaluation
  }: Readonly<{
    ownerId: string;
    activity: CodeActivityRecord;
    source: string;
    evaluation: JavaScriptEvaluationResult;
  }>): Promise<RecordedSubmission> {
    return this.db.transaction(async (tx) => {
      await tx
        .insert(owners)
        .values({ id: ownerId, displayName: "Local owner" })
        .onConflictDoNothing({ target: owners.id });

      const [attemptCount] = await tx
        .select({ value: count() })
        .from(attempts)
        .where(and(eq(attempts.ownerId, ownerId), eq(attempts.activityId, activity.id)));
      const attemptNumber = (attemptCount?.value ?? 0) + 1;
      const [previousPassedAttempts] = await tx
        .select({ value: count() })
        .from(attempts)
        .where(
          and(eq(attempts.ownerId, ownerId), eq(attempts.activityId, activity.id), eq(attempts.outcome, "passed"))
        );

      const [attempt] = await tx
        .insert(attempts)
        .values({
          ownerId,
          activityId: activity.id,
          attemptNumber,
          response: { source },
          outcome: evaluation.outcome,
          output: evaluation.execution,
          evaluatorVersion: activity.evaluatorVersion
        })
        .returning({ id: attempts.id });

      if (!attempt) {
        throw new Error("Failed to create Attempt record");
      }

      for (const test of evaluation.tests) {
        await tx.insert(attemptTestResults).values({
          attemptId: attempt.id,
          name: test.name,
          status: test.status,
          message: test.message
        });
      }

      const activityConceptStableIds = parseActivityConceptStableIds(activity.config);
      const categorizedMistake = categorizeSubmissionMistake(evaluation);
      const conceptRows =
        activityConceptStableIds.length > 0
          ? await tx
              .select({ id: concepts.id, stableId: concepts.stableId })
              .from(concepts)
              .where(inArray(concepts.stableId, activityConceptStableIds))
          : [];

      for (const concept of conceptRows) {
        const now = new Date();
        await tx.insert(conceptEvidence).values({
          ownerId,
          conceptId: concept.id,
          attemptId: attempt.id,
          type: getEvidenceTypeForActivityType(activity.type),
          strength: evaluation.outcome === "passed" ? 2 : 1,
          sourceType: "activity_attempt",
          sourceId: attempt.id,
          conditions: {
            activityStableId: activity.stableId,
            activityType: activity.type,
            attemptNumber,
            conceptStableId: concept.stableId,
            evaluatorVersion: activity.evaluatorVersion,
            outcome: evaluation.outcome,
            testCount: evaluation.tests.length
          }
        });

        await tx
          .insert(reviewSchedules)
          .values({
            ownerId,
            conceptId: concept.id,
            currentMasteryState: evaluation.outcome === "passed" ? "understood" : "introduced",
            nextReviewAt: calculateInitialReviewAt(now),
            recentQuality: evaluation.outcome === "passed" ? 3 : 1,
            policyVersion: REVIEW_POLICY_VERSION
          })
          .onConflictDoNothing({ target: [reviewSchedules.ownerId, reviewSchedules.conceptId] });

        if (categorizedMistake) {
          await tx.insert(mistakes).values({
            ownerId,
            conceptId: concept.id,
            attemptId: attempt.id,
            category: categorizedMistake.category,
            summary: categorizedMistake.summary
          });
        } else {
          await tx
            .update(mistakes)
            .set({
              status: "resolved",
              resolvedAt: now
            })
            .where(and(eq(mistakes.ownerId, ownerId), eq(mistakes.conceptId, concept.id), eq(mistakes.status, "active")));
        }
      }

      if (evaluation.outcome === "passed") {
        if ((previousPassedAttempts?.value ?? 0) === 0) {
          await tx.insert(xpTransactions).values({
            ownerId,
            amount: activity.type === "debug" ? 80 : 60,
            reason: activity.type === "debug" ? "debug_activity_passed" : "code_activity_passed",
            sourceType: "attempt",
            sourceId: attempt.id
          });
        }

        await tx
          .insert(lessonProgress)
          .values({
            ownerId,
            lessonId: activity.lessonId,
            submittedActivities: 1
          })
          .onConflictDoUpdate({
            target: [lessonProgress.ownerId, lessonProgress.lessonId],
            set: {
              submittedActivities: sql`${lessonProgress.submittedActivities} + 1`,
              updatedAt: sql`now()`
            }
          });

        await tx
          .insert(trackProgress)
          .values({
            ownerId,
            trackId: activity.trackId,
            completedLessons: 1
          })
          .onConflictDoUpdate({
            target: [trackProgress.ownerId, trackProgress.trackId],
            set: {
              completedLessons: sql`greatest(${trackProgress.completedLessons}, 1)`,
              updatedAt: sql`now()`
            }
          });
      }

      await tx.insert(studyEvents).values({
        ownerId,
        type: "activity_submitted",
        entityType: "activity",
        entityId: activity.stableId,
        payload: {
          attemptId: attempt.id,
          attemptNumber,
          outcome: evaluation.outcome
        }
      });

      return {
        attemptId: attempt.id,
        attemptNumber,
        outcome: evaluation.outcome,
        progressUpdated: evaluation.outcome === "passed",
        eventType: "activity_submitted"
      };
    });
  }
}

function parseAttemptSource(response: unknown) {
  if (
    typeof response === "object" &&
    response !== null &&
    "source" in response &&
    typeof response.source === "string"
  ) {
    return response.source;
  }

  return "";
}

function parseActivityConceptStableIds(config: unknown) {
  if (
    typeof config === "object" &&
    config !== null &&
    "conceptIds" in config &&
    Array.isArray(config.conceptIds)
  ) {
    return config.conceptIds.filter((conceptId): conceptId is string => typeof conceptId === "string");
  }

  return [];
}

function getEvidenceTypeForActivityType(activityType: string) {
  if (activityType === "debug") {
    return "bug_diagnosed";
  }

  return "code_written";
}
