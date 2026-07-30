import { describe, expect, it } from "vitest";

import {
  DEFAULT_JAVASCRIPT_OUTPUT_LIMIT,
  DEFAULT_JAVASCRIPT_TIMEOUT_MS,
  evaluateJavaScriptActivity,
  JAVASCRIPT_RUNTIME_CAPABILITIES,
  JAVASCRIPT_RUNTIME_VERSION,
  runJavaScript
} from "@/runtime/javascript/api";

describe("QuickJS JavaScript runtime", () => {
  it("captures stdout without executing in the browser main context", async () => {
    await expect(runJavaScript({ source: "console.log(1 + 2); 42" })).resolves.toMatchObject({
      status: "completed",
      stdout: ["3"],
      result: 42,
      runtimeVersion: JAVASCRIPT_RUNTIME_VERSION,
      limits: {
        timeoutMs: DEFAULT_JAVASCRIPT_TIMEOUT_MS,
        outputLimit: DEFAULT_JAVASCRIPT_OUTPUT_LIMIT
      },
      capabilities: JAVASCRIPT_RUNTIME_CAPABILITIES
    });
  });

  it("enforces execution timeout", async () => {
    await expect(runJavaScript({ source: "while (true) {}", timeoutMs: 10 })).resolves.toMatchObject({
      status: "timeout",
      limits: {
        timeoutMs: 10
      },
      capabilities: {
        dom: false,
        network: false,
        ambientSecrets: false
      }
    });
  });

  it("captures stderr separately from stdout", async () => {
    await expect(runJavaScript({ source: "console.log('ok'); console.error('bad');" })).resolves.toMatchObject({
      status: "completed",
      stdout: ["ok"],
      stderr: ["bad"]
    });
  });

  it("returns runtime errors as execution output instead of application exceptions", async () => {
    const result = await runJavaScript({ source: "throw new Error('boom');" });

    expect(result).toMatchObject({
      status: "runtime_error",
      stdout: [],
      result: null
    });
    expect(result.stderr.join("\n")).toContain("boom");
  });

  it("enforces the output limit across stdout and stderr", async () => {
    await expect(
      runJavaScript({ source: "console.log('abc'); console.error('def');", outputLimit: 5 })
    ).resolves.toMatchObject({
      status: "output_limit_exceeded",
      stdout: ["abc"],
      stderr: [],
      limits: {
        outputLimit: 5
      }
    });
  });

  it("does not expose DOM, network or ambient process capabilities", async () => {
    await expect(
      runJavaScript({
        source:
          "console.log(typeof document); console.log(typeof fetch); console.log(typeof process); console.log(typeof window);"
      })
    ).resolves.toMatchObject({
      status: "completed",
      stdout: ["undefined", "undefined", "undefined", "undefined"],
      capabilities: {
        dom: false,
        network: false,
        ambientSecrets: false
      }
    });
  });

  it("evaluates the initial fixture test kinds deterministically", async () => {
    await expect(
      evaluateJavaScriptActivity(
        "const documentExists = true;\nconst userAuthorized = false;\nconst canOpen = documentExists && userAuthorized;\nconsole.log(canOpen);",
        [
          { name: "uses both conditions", kind: "source-contains", value: "&&" },
          { name: "current example is false", kind: "stdout-equals", value: "false" }
        ]
      )
    ).resolves.toMatchObject({
      outcome: "passed",
      tests: [
        { name: "uses both conditions", status: "passed" },
        { name: "current example is false", status: "passed" }
      ]
    });
  });
});
