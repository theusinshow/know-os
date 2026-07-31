import type { GenerationProviderUsage } from "@/features/generation/contracts";

export const DEEPSEEK_PRICING_VERSION = "deepseek-api-pricing-2026-07-31" as const;

export const deepSeekPricingPerMillionTokensUsd = {
  "deepseek-v4-flash": {
    inputCacheHit: 0.0028,
    inputCacheMiss: 0.14,
    output: 0.28
  },
  "deepseek-v4-pro": {
    inputCacheHit: 0.003625,
    inputCacheMiss: 0.435,
    output: 0.87
  }
} as const;

type DeepSeekPricedModel = keyof typeof deepSeekPricingPerMillionTokensUsd;

export function estimateDeepSeekUsageCostUsd({
  model,
  inputTokens = 0,
  outputTokens = 0,
  cacheHitTokens = 0
}: Readonly<{
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheHitTokens?: number;
}>) {
  if (!isDeepSeekPricedModel(model)) {
    return undefined;
  }

  const prices = deepSeekPricingPerMillionTokensUsd[model];
  const normalizedInputTokens = Math.max(inputTokens, 0);
  const normalizedOutputTokens = Math.max(outputTokens, 0);
  const normalizedCacheHitTokens = Math.min(Math.max(cacheHitTokens, 0), normalizedInputTokens);
  const cacheMissInputTokens = normalizedInputTokens - normalizedCacheHitTokens;
  const cost =
    (normalizedCacheHitTokens / 1_000_000) * prices.inputCacheHit +
    (cacheMissInputTokens / 1_000_000) * prices.inputCacheMiss +
    (normalizedOutputTokens / 1_000_000) * prices.output;

  return roundUsd(cost);
}

export function withDeepSeekUsageEstimate(usage: GenerationProviderUsage): GenerationProviderUsage {
  const estimatedCostUsd = estimateDeepSeekUsageCostUsd(usage);

  return {
    ...usage,
    ...(estimatedCostUsd === undefined ? {} : { estimatedCostUsd, pricingVersion: DEEPSEEK_PRICING_VERSION })
  };
}

function isDeepSeekPricedModel(model: string): model is DeepSeekPricedModel {
  return model in deepSeekPricingPerMillionTokensUsd;
}

function roundUsd(value: number) {
  return Math.round(value * 1_000_000_000) / 1_000_000_000;
}
