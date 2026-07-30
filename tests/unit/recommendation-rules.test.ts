import { describe, expect, it } from "vitest";

import { buildRecommendations } from "@/features/recommendations/recommendation-rules";

describe("buildRecommendations", () => {
  it("orders due reviews before mistakes and continuation", () => {
    const recommendations = buildRecommendations({
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
          conceptStableId: "concept-b",
          conceptTitle: "Concept B",
          attemptId: "attempt-1",
          category: "failed_check",
          summary: "Failed",
          status: "active",
          createdAt: new Date(),
          resolvedAt: null
        }
      ],
      tracks: [
        {
          stableId: "track-a",
          title: "Track A",
          description: null,
          lessonCount: 1
        }
      ],
      projects: [
        {
          stableId: "project-a",
          title: "Project A",
          description: null,
          status: "active",
          conceptCount: 2,
          activityCount: 1
        }
      ]
    });

    expect(recommendations.map((recommendation) => recommendation.kind)).toEqual([
      "review",
      "mistake",
      "continue",
      "project"
    ]);
  });

  it("does not recommend resolved mistakes", () => {
    expect(
      buildRecommendations({
        dueReviews: [],
        mistakes: [
          {
            id: "mistake-1",
            conceptStableId: "concept-b",
            conceptTitle: "Concept B",
            attemptId: "attempt-1",
            category: "failed_check",
            summary: "Failed",
            status: "resolved",
            createdAt: new Date(),
            resolvedAt: new Date()
          }
        ],
        tracks: [],
        projects: []
      })
    ).toEqual([]);
  });

  it("does not recommend inactive or unlinked projects", () => {
    const recommendations = buildRecommendations({
      dueReviews: [],
      mistakes: [],
      tracks: [],
      projects: [
        {
          stableId: "inactive",
          title: "Inactive",
          description: null,
          status: "archived",
          conceptCount: 2,
          activityCount: 1
        },
        {
          stableId: "unlinked",
          title: "Unlinked",
          description: null,
          status: "active",
          conceptCount: 0,
          activityCount: 0
        }
      ]
    });

    expect(recommendations).toEqual([]);
  });

  it("recommends active projects linked only to activities", () => {
    const recommendations = buildRecommendations({
      dueReviews: [],
      mistakes: [],
      tracks: [],
      projects: [
        {
          stableId: "activity-project",
          title: "Activity Project",
          description: null,
          status: "active",
          conceptCount: 0,
          activityCount: 1
        }
      ]
    });

    expect(recommendations).toMatchObject([
      {
        id: "project:activity-project",
        kind: "project",
        href: "/projects"
      }
    ]);
  });
});
