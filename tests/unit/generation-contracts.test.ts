import { describe, expect, it, vi } from "vitest";

import { generationStatuses, type GenerationSpec } from "@/features/generation/contracts";
import { parseGeneratedJson } from "@/features/generation/json-parser";
import { compileGenerationPrompt } from "@/features/generation/prompt-compiler";
import { getServerEnv } from "@/lib/env";

vi.mock("server-only", () => ({}));

const spec: GenerationSpec = {
  targetSchema: "caderno.lesson.v1",
  language: "pt-BR",
  audienceLevel: "beginner",
  lessonTitle: "Variaveis em JavaScript",
  lessonGoal: "Ensinar declaracao e leitura de variaveis.",
  concepts: [{ id: "js-variable", title: "Variavel" }],
  activityTypes: ["prediction", "code"],
  constraints: ["Inclua uma atividade de previsao antes de codigo."]
};

describe("generation contracts", () => {
  it("keeps the complete Step 14 status vocabulary stable", () => {
    expect(generationStatuses).toEqual([
      "draft",
      "compiled",
      "waiting_external_response",
      "ready",
      "generating",
      "receiving",
      "validating",
      "repairing",
      "ready_to_import",
      "invalid",
      "rate_limited",
      "insufficient_balance",
      "timeout",
      "failed",
      "imported"
    ]);
  });

  it("compiles a provider-independent prompt that requires raw caderno.lesson.v1 JSON", () => {
    const compiled = compileGenerationPrompt(spec);

    expect(compiled.targetSchema).toBe("caderno.lesson.v1");
    expect(compiled.prompt).toContain("Responda somente com JSON valido no schema caderno.lesson.v1.");
    expect(compiled.prompt).toContain("Nao use Markdown");
    expect(compiled.prompt.toLowerCase()).not.toContain("deepseek");
    expect(JSON.parse(compiled.jsonExample)).toMatchObject({ schema: "caderno.lesson.v1" });
  });

  it("parses raw JSON and rejects empty or Markdown-wrapped responses", () => {
    expect(parseGeneratedJson('{"schema":"caderno.lesson.v1"}')).toMatchObject({
      ok: true,
      value: { schema: "caderno.lesson.v1" }
    });
    expect(parseGeneratedJson("")).toMatchObject({ ok: false, code: "empty_response" });
    expect(parseGeneratedJson("```json\n{}\n```")).toMatchObject({ ok: false, code: "markdown_wrapped" });
  });

  it("reports DeepSeek readiness without exposing API keys", async () => {
    const { getDeepSeekGenerationConfig } = await import(
      "@/features/generation/infrastructure/deepseek-config.server"
    );
    const unconfigured = getDeepSeekGenerationConfig(getServerEnv({}));
    const configured = getDeepSeekGenerationConfig(getServerEnv({ DEEPSEEK_API_KEY: "secret-key" }));

    expect(unconfigured).toMatchObject({
      provider: "deepseek",
      status: "unconfigured",
      baseUrl: "https://api.deepseek.com",
      defaultModel: "deepseek-v4-flash",
      proModel: "deepseek-v4-pro"
    });
    expect(configured.status).toBe("configured");
    expect(JSON.stringify(configured)).not.toContain("secret-key");
  });
});
