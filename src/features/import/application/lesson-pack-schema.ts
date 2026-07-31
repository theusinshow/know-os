import { z } from "zod";

import { lessonSchema } from "@/features/import/application/track-pack-schema";

export const lessonPackSchema = z.object({
  schema: z.literal("caderno.lesson.v1"),
  language: z.string().default("pt-BR"),
  lesson: lessonSchema
});

export type LessonPack = z.infer<typeof lessonPackSchema>;
