import { describe, expect, it } from "vitest";

import {
  DEEPSEEK_PRICING_VERSION,
  estimateDeepSeekUsageCostUsd,
  withDeepSeekUsageEstimate
} from "@/features/generation/pricing";

describe("DeepSeek generation pricing", () => {
  it("estimates cached input, uncached input and output cost from versioned prices", () => {
    expect(
      estimateDeepSeekUsageCostUsd({
        model: "deepseek-v4-flash",
        inputTokens: 10,
        outputTokens: 20,
        cacheHitTokens: 2
      })
    ).toBe(0.000006726);
  });

  it("does not estimate unknown models", () => {
    expect(
      withDeepSeekUsageEstimate({
        model: "unpriced-model",
        inputTokens: 100,
        outputTokens: 100,
        measuredAt: "2026-07-31T12:00:00.000Z"
      })
    ).toEqual({
      model: "unpriced-model",
      inputTokens: 100,
      outputTokens: 100,
      measuredAt: "2026-07-31T12:00:00.000Z"
    });
  });

  it("clamps cache hits to input tokens before estimating", () => {
    expect(
      withDeepSeekUsageEstimate({
        model: "deepseek-v4-pro",
        inputTokens: 5,
        outputTokens: 0,
        cacheHitTokens: 50,
        measuredAt: "2026-07-31T12:00:00.000Z"
      })
    ).toMatchObject({
      estimatedCostUsd: 0.000000018,
      pricingVersion: DEEPSEEK_PRICING_VERSION
    });
  });
});
