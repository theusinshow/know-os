import exampleTrackPack from "../../packs/examples/javascript-fundamentals.track.json";
import { describe, expect, it } from "vitest";

import {
  buildTrackPackFromGeneratedLesson,
  compileManualGenerationSpec
} from "@/features/generation/manual-generation-service";

const importTarget = {
  packId: "generated.javascript.manual",
  version: 1,
  trackId: "generated-javascript",
  trackTitle: "JavaScript gerado",
  moduleId: "generated-basics",
  moduleTitle: "Fundamentos gerados"
};

const validSpec = {
  targetSchema: "caderno.lesson.v1",
  language: "pt-BR",
  audienceLevel: "beginner",
  lessonTitle: "Variaveis em JavaScript",
  lessonGoal: "Ensinar declaracao de variaveis.",
  concepts: [{ id: "js-variable", title: "Variavel" }],
  activityTypes: ["prediction", "code"],
  constraints: ["Comece com previsao."]
};

const lessonPack = {
  schema: "caderno.lesson.v1",
  language: "pt-BR",
  lesson: exampleTrackPack.track.modules[0].lessons[0]
};

describe("manual generation service", () => {
  it("compiles a valid manual generation spec with import target metadata", () => {
    const result = compileManualGenerationSpec({ ...validSpec, importTarget });

    expect(result).toMatchObject({
      ok: true,
      spec: { importTarget },
      compiledPrompt: { targetSchema: "caderno.lesson.v1" }
    });
  });

  it("rejects invalid generation specs before creating a job", () => {
    const result = compileManualGenerationSpec({ ...validSpec, concepts: [], importTarget });

    expect(result).toMatchObject({
      ok: false,
      issues: [expect.objectContaining({ path: "concepts" })]
    });
  });

  it("wraps only validated Lesson Pack JSON into a Track Pack import boundary", () => {
    const result = buildTrackPackFromGeneratedLesson(JSON.stringify(lessonPack), importTarget);

    expect(result).toMatchObject({
      ok: true,
      trackPack: {
        schema: "caderno.track.v1",
        packId: "generated.javascript.manual",
        track: {
          id: "generated-javascript",
          modules: [{ id: "generated-basics" }]
        }
      }
    });
  });

  it("blocks raw malformed output before Track Pack construction", () => {
    const result = buildTrackPackFromGeneratedLesson("```json\n{}\n```", importTarget);

    expect(result).toMatchObject({
      ok: false,
      issues: [expect.objectContaining({ path: "$", code: "markdown_wrapped" })]
    });
  });
});
