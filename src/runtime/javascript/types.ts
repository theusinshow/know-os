import type { JavaScriptRuntimeCapabilities, JavaScriptRuntimeLimits } from "@/runtime/javascript/contract";

export type JavaScriptExecutionRequest = Readonly<{
  source: string;
  timeoutMs?: number;
  outputLimit?: number;
}>;

export type JavaScriptExecutionResult = Readonly<{
  status: "completed" | "runtime_error" | "timeout" | "output_limit_exceeded";
  stdout: string[];
  stderr: string[];
  result: unknown;
  runtimeVersion: string;
  limits: JavaScriptRuntimeLimits;
  capabilities: JavaScriptRuntimeCapabilities;
}>;

export type JavaScriptActivityTest = Readonly<
  | {
      name: string;
      kind: "source-contains";
      value: string;
    }
  | {
      name: string;
      kind: "stdout-equals";
      value: string;
    }
>;

export type JavaScriptTestResult = Readonly<{
  name: string;
  status: "passed" | "failed";
  message: string;
}>;

export type JavaScriptEvaluationResult = Readonly<{
  execution: JavaScriptExecutionResult;
  tests: JavaScriptTestResult[];
  outcome: "passed" | "failed";
}>;
