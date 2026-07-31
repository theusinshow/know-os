import { compileManualGenerationSpec, type ManualGenerationCompileResult } from "@/features/generation/manual-generation-service";

export class ManualGenerationProvider {
  readonly id = "manual_copy_paste" as const;

  compile(input: unknown): ManualGenerationCompileResult {
    return compileManualGenerationSpec(input);
  }
}
