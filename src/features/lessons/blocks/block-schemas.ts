import { z } from "zod";

const baseBlockSchema = z.object({
  id: z.string().optional(),
  type: z.string()
});

export const textBlockSchema = baseBlockSchema.extend({
  content: z.string().min(1)
});

export const codeBlockSchema = baseBlockSchema.extend({
  language: z.string().default("text"),
  code: z.string().min(1)
});

export const titledTextBlockSchema = baseBlockSchema.extend({
  title: z.string().optional(),
  content: z.string().min(1)
});

export const conceptBlockSchema = baseBlockSchema.extend({
  conceptId: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional()
});

export type TextBlockPayload = z.infer<typeof textBlockSchema>;
export type CodeBlockPayload = z.infer<typeof codeBlockSchema>;
export type TitledTextBlockPayload = z.infer<typeof titledTextBlockSchema>;
export type ConceptBlockPayload = z.infer<typeof conceptBlockSchema>;
