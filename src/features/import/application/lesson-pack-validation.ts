import type { TrackPackLesson } from "@/features/import/application/track-pack-schema";
import { lessonPackSchema, type LessonPack } from "@/features/import/application/lesson-pack-schema";
import { hashCanonicalJson } from "@/lib/canonical-json";

export type PackValidationIssue = Readonly<{
  code: "invalid_schema" | "duplicate_id" | "missing_concept";
  message: string;
  path: string;
}>;

export type LessonPackValidationResult =
  | Readonly<{ ok: true; pack: LessonPack; contentHash: string }>
  | Readonly<{ ok: false; issues: PackValidationIssue[] }>;

export function validateLessonPack(input: unknown): LessonPackValidationResult {
  const parsed = lessonPackSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => ({
        code: "invalid_schema",
        message: issue.message,
        path: issue.path.join(".")
      }))
    };
  }

  const semanticIssues = validateLessonSemantics(parsed.data.lesson, "lesson");

  if (semanticIssues.length > 0) {
    return { ok: false, issues: semanticIssues };
  }

  return {
    ok: true,
    pack: parsed.data,
    contentHash: hashLessonPack(parsed.data)
  };
}

export function hashLessonPack(pack: LessonPack) {
  return hashCanonicalJson(pack);
}

export function validateLessonSemantics(lesson: TrackPackLesson, lessonPath: string): PackValidationIssue[] {
  const issues: PackValidationIssue[] = [];
  const ids = new Map<string, string>();

  addUnique(ids, issues, lesson.id, `${lessonPath}.id`);
  validateLessonChildren(lesson, lessonPath, ids, issues);

  return issues;
}

export function validateLessonChildren(
  lesson: TrackPackLesson,
  lessonPath: string,
  ids: Map<string, string>,
  issues: PackValidationIssue[]
) {
  const conceptIds = new Set<string>();

  lesson.concepts.forEach((concept, conceptIndex) => {
    conceptIds.add(concept.id);
    addUnique(ids, issues, concept.id, `${lessonPath}.concepts.${conceptIndex}.id`);
  });

  lesson.blocks.forEach((block, blockIndex) => {
    addUnique(ids, issues, block.id, `${lessonPath}.blocks.${blockIndex}.id`);
  });

  lesson.activities.forEach((activity, activityIndex) => {
    addUnique(ids, issues, activity.id, `${lessonPath}.activities.${activityIndex}.id`);

    activity.conceptIds.forEach((conceptId, conceptIndex) => {
      if (!conceptIds.has(conceptId)) {
        issues.push({
          code: "missing_concept",
          message: `Activity references unknown concept '${conceptId}'.`,
          path: `${lessonPath}.activities.${activityIndex}.conceptIds.${conceptIndex}`
        });
      }
    });
  });
}

function addUnique(ids: Map<string, string>, issues: PackValidationIssue[], id: string, path: string) {
  const existingPath = ids.get(id);

  if (existingPath) {
    issues.push({
      code: "duplicate_id",
      message: `Stable ID '${id}' is already used at ${existingPath}.`,
      path
    });
    return;
  }

  ids.set(id, path);
}
