import type { PackValidationIssue } from "@/features/import/application/lesson-pack-validation";
import { validateLessonPack } from "@/features/import/application/lesson-pack-validation";
import { parseGeneratedJson } from "@/features/generation/json-parser";

export type GeneratedLessonPreviewSummary = Readonly<{
  lessonStableId: string;
  lessonTitle: string;
  conceptCount: number;
  blockCount: number;
  activityCount: number;
}>;

export type GeneratedLessonOutputValidationResult =
  | Readonly<{
      status: "ready_to_preview";
      operation: "validate_only";
      schema: "caderno.lesson.v1";
      contentHash: string;
      summary: GeneratedLessonPreviewSummary;
    }>
  | Readonly<{
      status: "invalid";
      operation: "blocked_invalid";
      issues: PackValidationIssue[];
    }>;

export function validateGeneratedLessonOutput(rawJson: string): GeneratedLessonOutputValidationResult {
  const parsed = parseGeneratedJson(rawJson);

  if (!parsed.ok) {
    return {
      status: "invalid",
      operation: "blocked_invalid",
      issues: [{ code: "invalid_schema", message: parsed.message, path: "$" }]
    };
  }

  const validation = validateLessonPack(parsed.value);

  if (!validation.ok) {
    return {
      status: "invalid",
      operation: "blocked_invalid",
      issues: validation.issues
    };
  }

  return {
    status: "ready_to_preview",
    operation: "validate_only",
    schema: "caderno.lesson.v1",
    contentHash: validation.contentHash,
    summary: {
      lessonStableId: validation.pack.lesson.id,
      lessonTitle: validation.pack.lesson.title,
      conceptCount: validation.pack.lesson.concepts.length,
      blockCount: validation.pack.lesson.blocks.length,
      activityCount: validation.pack.lesson.activities.length
    }
  };
}
