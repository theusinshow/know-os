import type { JavaScriptEvaluationResult } from "@/runtime/javascript/api";

export type MistakeCategory = "failed_check" | "runtime_error" | "timeout" | "output_limit";

export type CategorizedMistake = Readonly<{
  category: MistakeCategory;
  summary: string;
}>;

export function categorizeSubmissionMistake(evaluation: JavaScriptEvaluationResult): CategorizedMistake | null {
  if (evaluation.outcome === "passed") {
    return null;
  }

  if (evaluation.execution.status === "timeout") {
    return {
      category: "timeout",
      summary: "A execução excedeu o limite de tempo."
    };
  }

  if (evaluation.execution.status === "output_limit_exceeded") {
    return {
      category: "output_limit",
      summary: "A execução excedeu o limite de saída."
    };
  }

  if (evaluation.execution.status === "runtime_error") {
    return {
      category: "runtime_error",
      summary: evaluation.execution.stderr[0] ?? "Erro de execução registrado."
    };
  }

  const failedTest = evaluation.tests.find((test) => test.status === "failed");

  return {
    category: "failed_check",
    summary: failedTest?.message || failedTest?.name || "A tentativa falhou em uma verificação."
  };
}
