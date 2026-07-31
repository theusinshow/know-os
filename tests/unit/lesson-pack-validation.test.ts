import exampleTrackPack from "../../packs/examples/javascript-fundamentals.track.json";
import { describe, expect, it } from "vitest";

import { validateGeneratedLessonOutput } from "@/features/generation/generated-output-validation";
import { validateLessonPack } from "@/features/import/application/lesson-pack-validation";

const exampleLessonPack = {
  schema: "caderno.lesson.v1",
  language: "pt-BR",
  lesson: exampleTrackPack.track.modules[0].lessons[0]
};

describe("validateLessonPack", () => {
  it("accepts a standalone caderno.lesson.v1 Pack and returns a deterministic content hash", () => {
    const first = validateLessonPack(exampleLessonPack);
    const second = validateLessonPack(exampleLessonPack);

    expect(first).toMatchObject({ ok: true });
    expect(second).toMatchObject({ ok: true });

    if (first.ok && second.ok) {
      expect(first.contentHash).toMatch(/^[a-f0-9]{64}$/);
      expect(first.contentHash).toBe(second.contentHash);
      expect(first.pack.lesson.activities).toHaveLength(2);
    }
  });

  it("rejects unsupported generated schemas before preview or import", () => {
    const result = validateLessonPack({ ...exampleLessonPack, schema: "caderno.track.v1" });

    expect(result).toMatchObject({
      ok: false,
      issues: [expect.objectContaining({ code: "invalid_schema", path: "schema" })]
    });
  });

  it("rejects duplicate stable IDs inside a generated lesson", () => {
    const invalidPack = structuredClone(exampleLessonPack);
    invalidPack.lesson.blocks[0].id = invalidPack.lesson.concepts[0].id;

    const result = validateLessonPack(invalidPack);

    expect(result).toMatchObject({
      ok: false,
      issues: [expect.objectContaining({ code: "duplicate_id", path: "lesson.blocks.0.id" })]
    });
  });

  it("rejects activity concept references not declared in the generated lesson", () => {
    const invalidPack = structuredClone(exampleLessonPack);
    invalidPack.lesson.activities[0].conceptIds = ["missing-concept"];

    const result = validateLessonPack(invalidPack);

    expect(result).toMatchObject({
      ok: false,
      issues: [expect.objectContaining({ code: "missing_concept" })]
    });
  });
});

describe("validateGeneratedLessonOutput", () => {
  it("routes raw generated JSON into validate-only preview metadata", () => {
    const result = validateGeneratedLessonOutput(JSON.stringify(exampleLessonPack));

    expect(result).toMatchObject({
      status: "ready_to_preview",
      operation: "validate_only",
      schema: "caderno.lesson.v1",
      summary: {
        lessonStableId: "js-fundamentals-001",
        activityCount: 2
      }
    });
    expect(JSON.stringify(result)).not.toContain("import");
  });

  it("blocks malformed or Markdown-wrapped model output", () => {
    expect(validateGeneratedLessonOutput("```json\n{}\n```")).toMatchObject({
      status: "invalid",
      operation: "blocked_invalid",
      issues: [expect.objectContaining({ code: "invalid_schema", path: "$" })]
    });
    expect(validateGeneratedLessonOutput("{not-json")).toMatchObject({
      status: "invalid",
      operation: "blocked_invalid",
      issues: [expect.objectContaining({ code: "invalid_schema", path: "$" })]
    });
  });
});
