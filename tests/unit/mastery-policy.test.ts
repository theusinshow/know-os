import { describe, expect, it } from "vitest";

import { calculateConceptMastery } from "@/features/mastery/mastery-policy";

describe("calculateConceptMastery", () => {
  it("keeps concepts unseen with no evidence", () => {
    expect(calculateConceptMastery([])).toMatchObject({
      state: "unseen",
      level: 0,
      policyVersion: "mastery.v1",
      evidenceCount: 0
    });
  });

  it("does not mark one immediate successful activity as mastered", () => {
    expect(
      calculateConceptMastery([
        {
          type: "code_written",
          strength: 2,
          conditions: { outcome: "passed" }
        }
      ])
    ).toMatchObject({
      state: "understood",
      level: 2,
      evidenceCount: 1,
      totalStrength: 2
    });
  });

  it("requires delayed review and transfer evidence for mastered", () => {
    expect(
      calculateConceptMastery([
        {
          type: "code_written",
          strength: 2,
          conditions: { outcome: "passed" }
        },
        {
          type: "delayed_review_result",
          strength: 3,
          conditions: { outcome: "passed" }
        },
        {
          type: "project_application",
          strength: 3,
          conditions: { outcome: "passed" }
        }
      ])
    ).toMatchObject({
      state: "mastered",
      level: 5,
      evidenceCount: 3,
      totalStrength: 8
    });
  });
});
