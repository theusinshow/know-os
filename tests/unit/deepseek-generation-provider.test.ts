import { describe, expect, it, vi } from "vitest";

import { DeepSeekGenerationProvider } from "@/features/generation/infrastructure/deepseek-generation-provider.server";
import { compileGenerationPrompt } from "@/features/generation/prompt-compiler";
import type { DeepSeekProviderConfig } from "@/features/generation/infrastructure/deepseek-config.server";
import type { GenerationSpec } from "@/features/generation/contracts";

vi.mock("server-only", () => ({}));

const config: DeepSeekProviderConfig = {
  provider: "deepseek",
  status: "configured",
  apiKey: "test-key",
  baseUrl: "https://api.deepseek.com",
  defaultModel: "deepseek-v4-flash",
  proModel: "deepseek-v4-pro",
  availableModels: ["deepseek-v4-flash", "deepseek-v4-pro"]
};

const spec: GenerationSpec = {
  targetSchema: "caderno.lesson.v1",
  language: "pt-BR",
  audienceLevel: "beginner",
  lessonTitle: "Funções em JavaScript",
  lessonGoal: "Ensinar funções.",
  concepts: [{ id: "js-function", title: "Função" }],
  activityTypes: ["prediction", "code"],
  constraints: ["Retorne JSON."],
  importTarget: {
    packId: "generated.javascript.deepseek",
    version: 1,
    trackId: "generated-javascript",
    trackTitle: "JavaScript gerado",
    moduleId: "generated-basics",
    moduleTitle: "Fundamentos gerados"
  }
};

const request = {
  jobId: "job-1",
  spec,
  compiledPrompt: compileGenerationPrompt(spec),
  model: "deepseek-v4-flash"
};

describe("DeepSeekGenerationProvider", () => {
  it("sends an OpenAI-compatible JSON-only request without exposing retired model aliases", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        choices: [{ message: { content: '{"schema":"caderno.lesson.v1"}' } }],
        usage: { prompt_tokens: 10, completion_tokens: 20, prompt_cache_hit_tokens: 2 }
      })
    );
    const provider = new DeepSeekGenerationProvider(config, fetchImpl);

    await expect(provider.generate(request)).resolves.toMatchObject({
      ok: true,
      rawJson: '{"schema":"caderno.lesson.v1"}',
      usage: {
        model: "deepseek-v4-flash",
        inputTokens: 10,
        outputTokens: 20,
        cacheHitTokens: 2,
        estimatedCostUsd: 0.000006726,
        pricingVersion: "deepseek-api-pricing-2026-07-31"
      }
    });

    const [, init] = fetchImpl.mock.calls[0] as unknown as [RequestInfo | URL, RequestInit];
    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({
      model: "deepseek-v4-flash",
      response_format: { type: "json_object" }
    });
    expect(JSON.stringify(body)).toContain("Thinking Mode is off");
    expect(JSON.stringify(body)).not.toContain("deepseek-chat");
    expect(JSON.stringify(body)).not.toContain("deepseek-reasoner");
  });

  it("retries one empty response and then succeeds", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ choices: [{ message: { content: "" } }] }))
      .mockResolvedValueOnce(Response.json({ choices: [{ message: { content: '{"ok":true}' } }] }));
    const provider = new DeepSeekGenerationProvider(config, fetchImpl);

    await expect(provider.generate(request)).resolves.toMatchObject({ ok: true, rawJson: '{"ok":true}' });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not retry authentication failures", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ error: { message: "bad key" } }, { status: 401 }));
    const provider = new DeepSeekGenerationProvider(config, fetchImpl);

    await expect(provider.generate(request)).resolves.toMatchObject({
      ok: false,
      error: { code: "authentication", retryable: false }
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("does not retry insufficient balance failures", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ error: { message: "insufficient balance" } }, { status: 402 })
    );
    const provider = new DeepSeekGenerationProvider(config, fetchImpl);

    await expect(provider.generate(request)).resolves.toMatchObject({
      ok: false,
      error: { code: "insufficient_balance", retryable: false }
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
