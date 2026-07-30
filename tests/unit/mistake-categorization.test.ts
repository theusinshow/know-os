import { describe, expect, it } from "vitest";

import { categorizeSubmissionMistake } from "@/features/mistakes/mistake-categorization";
import type { JavaScriptEvaluationResult } from "@/runtime/javascript/api";

describe("categorizeSubmissionMistake", () => {
  it("returns null for passed submissions", () => {
    expect(categorizeSubmissionMistake(evaluation({ outcome: "passed" }))).toBeNull();
  });

  it("categorizes failed checks from test results", () => {
    expect(categorizeSubmissionMistake(evaluation({ outcome: "failed" }))).toMatchObject({
      category: "failed_check",
      summary: "Expected stdout to equal false."
    });
  });

  it("categorizes runtime timeouts before test failures", () => {
    expect(
      categorizeSubmissionMistake(
        evaluation({
          outcome: "failed",
          executionStatus: "timeout"
        })
      )
    ).toMatchObject({
      category: "timeout"
    });
  });
});

function evaluation({
  outcome,
  executionStatus = "completed"
}: Readonly<{
  outcome: "passed" | "failed";
  executionStatus?: JavaScriptEvaluationResult["execution"]["status"];
}>): JavaScriptEvaluationResult {
  return {
    outcome,
    execution: {
      status: executionStatus,
      stdout: [],
      stderr: [],
      result: null,
      runtimeVersion: "test",
      limits: {
        timeoutMs: 1000,
        outputLimit: 1000
      },
      capabilities: {
        dom: false,
        network: false,
        ambientSecrets: false
      }
    },
    tests: [
      {
        name: "stdout check",
        status: outcome,
        message: outcome === "passed" ? "" : "Expected stdout to equal false."
      }
    ]
  };
}
