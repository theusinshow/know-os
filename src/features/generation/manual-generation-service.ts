import { generationSpecSchema, type GenerationImportTarget, type GenerationSpec } from "@/features/generation/contracts";
import { compileGenerationPrompt } from "@/features/generation/prompt-compiler";
import { parseGeneratedJson } from "@/features/generation/json-parser";
import type { LessonPack } from "@/features/import/application/lesson-pack-schema";
import { validateLessonPack } from "@/features/import/application/lesson-pack-validation";
import { validateTrackPack } from "@/features/import/application/track-pack-validation";
import type { TrackPack } from "@/features/import/application/track-pack-schema";

export type ManualGenerationCompileResult =
  | Readonly<{ ok: true; spec: GenerationSpec; compiledPrompt: ReturnType<typeof compileGenerationPrompt> }>
  | Readonly<{ ok: false; issues: readonly { path: string; message: string }[] }>;

export function compileManualGenerationSpec(input: unknown): ManualGenerationCompileResult {
  const parsed = generationSpecSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }))
    };
  }

  return {
    ok: true,
    spec: parsed.data,
    compiledPrompt: compileGenerationPrompt(parsed.data)
  };
}

export type GeneratedLessonTrackPackResult =
  | Readonly<{ ok: true; lessonPack: LessonPack; trackPack: TrackPack; contentHash: string }>
  | Readonly<{ ok: false; issues: readonly { path: string; message: string; code: string }[] }>;

export function buildTrackPackFromGeneratedLesson(
  rawJson: string,
  target: GenerationImportTarget
): GeneratedLessonTrackPackResult {
  const parsed = parseGeneratedJson(rawJson);

  if (!parsed.ok) {
    return { ok: false, issues: [{ path: "$", message: parsed.message, code: parsed.code }] };
  }

  const lessonValidation = validateLessonPack(parsed.value);

  if (!lessonValidation.ok) {
    return { ok: false, issues: lessonValidation.issues };
  }

  const trackPack: TrackPack = {
    schema: "caderno.track.v1",
    packId: target.packId,
    version: target.version,
    language: lessonValidation.pack.language,
    track: {
      id: target.trackId,
      title: target.trackTitle,
      modules: [
        {
          id: target.moduleId,
          title: target.moduleTitle,
          lessons: [lessonValidation.pack.lesson]
        }
      ]
    }
  };
  const trackValidation = validateTrackPack(trackPack);

  if (!trackValidation.ok) {
    return { ok: false, issues: trackValidation.issues };
  }

  return {
    ok: true,
    lessonPack: lessonValidation.pack,
    trackPack: trackValidation.pack,
    contentHash: trackValidation.contentHash
  };
}
