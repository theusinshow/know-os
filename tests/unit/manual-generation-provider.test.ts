import { describe, expect, it } from "vitest";

import { ManualGenerationProvider } from "@/features/generation/infrastructure/manual-generation-provider";
import type { GenerationSpec } from "@/features/generation/contracts";

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
    packId: "generated.javascript.manual",
    version: 1,
    trackId: "generated-javascript",
    trackTitle: "JavaScript gerado",
    moduleId: "generated-basics",
    moduleTitle: "Fundamentos gerados"
  }
};

describe("ManualGenerationProvider", () => {
  it("compiles manual generation specs through the provider abstraction", () => {
    const provider = new ManualGenerationProvider();

    expect(provider.id).toBe("manual_copy_paste");
    expect(provider.compile(spec)).toMatchObject({
      ok: true,
      spec,
      compiledPrompt: {
        targetSchema: "caderno.lesson.v1"
      }
    });
  });
});
