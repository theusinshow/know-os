export const generationStatuses = [
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
] as const;

export type GenerationStatus = (typeof generationStatuses)[number];

export type GenerationMode = "manual_copy_paste" | "deepseek";

export type GenerationSchemaTarget = "caderno.lesson.v1";

export type GenerationSpec = Readonly<{
  targetSchema: GenerationSchemaTarget;
  language: "pt-BR";
  audienceLevel: "beginner" | "intermediate" | "advanced";
  lessonTitle: string;
  lessonGoal: string;
  concepts: readonly Readonly<{ id: string; title: string; summary?: string }>[];
  activityTypes: readonly ("prediction" | "multiple-choice" | "explain" | "code" | "debug")[];
  constraints: readonly string[];
}>;

export type CompiledGenerationPrompt = Readonly<{
  targetSchema: GenerationSchemaTarget;
  prompt: string;
  jsonExample: string;
}>;

export type GenerationProviderUsage = Readonly<{
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheHitTokens?: number;
  estimatedCostUsd?: number;
  measuredAt: string;
}>;

export type GenerationProviderErrorCode =
  | "invalid_request"
  | "authentication"
  | "rate_limited"
  | "insufficient_balance"
  | "timeout"
  | "empty_response"
  | "transient"
  | "failed";

export type GenerationProviderError = Readonly<{
  code: GenerationProviderErrorCode;
  message: string;
  retryable: boolean;
  technicalDetails?: string;
}>;

export type GenerationProviderRequest = Readonly<{
  jobId: string;
  spec: GenerationSpec;
  compiledPrompt: CompiledGenerationPrompt;
  model: string;
}>;

export type GenerationProviderResult =
  | Readonly<{ ok: true; rawJson: string; usage?: GenerationProviderUsage }>
  | Readonly<{ ok: false; error: GenerationProviderError }>;

export type GenerationProvider = Readonly<{
  id: GenerationMode;
  generate(request: GenerationProviderRequest): Promise<GenerationProviderResult>;
}>;
