import { describe, expect, it } from "vitest";

import { buildGamificationSummary } from "@/features/gamification/gamification-rules";

describe("buildGamificationSummary", () => {
  it("keeps rank based on XP and separate from mastery", () => {
    const summary = buildGamificationSummary({
      xp: {
        totalXp: 60,
        transactions: [
          {
            id: "xp-1",
            amount: 60,
            reason: "code_activity_passed",
            sourceType: "attempt",
            sourceId: "attempt-1",
            createdAt: new Date()
          }
        ]
      },
      dueReviews: [],
      mistakes: []
    });

    expect(summary.rank).toMatchObject({
      label: "Practitioner I",
      currentXp: 60,
      explanation: expect.stringContaining("não é certificação")
    });
    expect(summary.badges.find((badge) => badge.id === "first-submit")).toMatchObject({
      earned: true
    });
    expect(summary.missions.map((mission) => mission.status)).toEqual(["complete", "complete", "complete"]);
  });

  it("marks review and mistake missions available when work is pending", () => {
    const summary = buildGamificationSummary({
      xp: {
        totalXp: 0,
        transactions: []
      },
      dueReviews: [
        {
          conceptStableId: "concept-a",
          conceptTitle: "Concept A",
          currentMasteryState: "understood",
          nextReviewAt: new Date(),
          reviewCount: 0,
          recentQuality: 3,
          reason: "Due"
        }
      ],
      mistakes: [
        {
          id: "mistake-1",
          conceptStableId: "concept-a",
          conceptTitle: "Concept A",
          attemptId: "attempt-1",
          category: "failed_check",
          summary: "Failed",
          status: "active",
          createdAt: new Date(),
          resolvedAt: null
        }
      ]
    });

    expect(summary.missions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "review-due", status: "available" }),
        expect.objectContaining({ id: "resolve-mistakes", status: "available" })
      ])
    );
  });
});
