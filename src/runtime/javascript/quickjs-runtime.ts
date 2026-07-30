import { spawn } from "node:child_process";
import path from "node:path";

import type {
  JavaScriptActivityTest,
  JavaScriptEvaluationResult,
  JavaScriptExecutionRequest,
  JavaScriptExecutionResult
} from "@/runtime/javascript/types";
import { DEFAULT_JAVASCRIPT_OUTPUT_LIMIT, DEFAULT_JAVASCRIPT_TIMEOUT_MS } from "@/runtime/javascript/contract";

export async function runJavaScript(request: JavaScriptExecutionRequest): Promise<JavaScriptExecutionResult> {
  const timeoutMs = request.timeoutMs ?? DEFAULT_JAVASCRIPT_TIMEOUT_MS;
  const outputLimit = request.outputLimit ?? DEFAULT_JAVASCRIPT_OUTPUT_LIMIT;
  const runnerPath = path.join(process.cwd(), "scripts", "quickjs-runner.mjs");
  const stdout = await runQuickJsProcess(
    runnerPath,
    JSON.stringify({
      source: request.source,
      timeoutMs,
      outputLimit
    }),
    Math.max(timeoutMs + 5000, 6000),
    Math.max(outputLimit * 2 + 2048, 4096)
  );

  return JSON.parse(stdout) as JavaScriptExecutionResult;
}

async function runQuickJsProcess(runnerPath: string, input: string, timeoutMs: number, maxBuffer: number) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(process.execPath, [runnerPath], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"]
    });
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("QuickJS runner host timeout"));
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      stdoutChunks.push(chunk);

      if (Buffer.concat(stdoutChunks).length > maxBuffer) {
        child.kill("SIGTERM");
        reject(new Error("QuickJS runner exceeded output buffer"));
      }
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderrChunks.push(chunk);
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timeout);

      if (code === 0) {
        resolve(Buffer.concat(stdoutChunks).toString("utf8"));
        return;
      }

      reject(new Error(Buffer.concat(stderrChunks).toString("utf8") || `QuickJS runner exited with ${code}`));
    });
    child.stdin.end(input);
  });
}

export async function evaluateJavaScriptActivity(
  source: string,
  tests: JavaScriptActivityTest[]
): Promise<JavaScriptEvaluationResult> {
  const execution = await runJavaScript({ source });
  const testResults = tests.map((test) => evaluateTest(test, source, execution));

  return {
    execution,
    tests: testResults,
    outcome:
      execution.status === "completed" && testResults.every((test) => test.status === "passed") ? "passed" : "failed"
  };
}

function evaluateTest(
  test: JavaScriptActivityTest,
  source: string,
  execution: JavaScriptExecutionResult
) {
  if (execution.status !== "completed") {
    return {
      name: test.name,
      status: "failed" as const,
      message: `Execution status was ${execution.status}.`
    };
  }

  if (test.kind === "source-contains") {
    const passed = source.includes(test.value);

    return {
      name: test.name,
      status: passed ? ("passed" as const) : ("failed" as const),
      message: passed ? "Source contains the required token." : `Source must contain '${test.value}'.`
    };
  }

  const actual = execution.stdout.at(-1) ?? "";
  const passed = actual === test.value;

  return {
    name: test.name,
    status: passed ? ("passed" as const) : ("failed" as const),
    message: passed ? "stdout matched." : `Expected stdout '${test.value}' but received '${actual}'.`
  };
}
