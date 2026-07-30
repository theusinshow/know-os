import { z } from "zod";

const stableId = z.string().trim().min(1);

const conceptSchema = z.object({
  id: stableId,
  title: z.string().trim().min(1),
  summary: z.string().optional()
});

const blockSchema = z
  .object({
    id: stableId,
    type: z.enum(["text", "concept", "note", "warning", "code", "example", "prediction", "summary"])
  })
  .passthrough();

const activitySchema = z
  .object({
    id: stableId,
    type: z.enum(["prediction", "multiple-choice", "explain", "code", "debug"]),
    conceptIds: z.array(stableId).min(1),
    prompt: z.string().trim().min(1)
  })
  .passthrough();

const lessonSchema = z.object({
  id: stableId,
  version: z.number().int().min(1),
  title: z.string().trim().min(1),
  concepts: z.array(conceptSchema),
  blocks: z.array(blockSchema),
  activities: z.array(activitySchema)
});

const moduleSchema = z.object({
  id: stableId,
  title: z.string().trim().min(1),
  lessons: z.array(lessonSchema)
});

export const trackPackSchema = z.object({
  schema: z.literal("caderno.track.v1"),
  packId: z.string().regex(/^[a-z0-9][a-z0-9._-]{2,127}$/),
  version: z.number().int().min(1),
  language: z.string().default("pt-BR"),
  track: z.object({
    id: stableId,
    title: z.string().trim().min(1),
    description: z.string().optional(),
    modules: z.array(moduleSchema)
  })
});

export type TrackPack = z.infer<typeof trackPackSchema>;
export type TrackPackLesson = TrackPack["track"]["modules"][number]["lessons"][number];
export type TrackPackActivity = TrackPackLesson["activities"][number];
