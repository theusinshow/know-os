import { stdin, stdout } from "node:process";

import { getQuickJS } from "quickjs-emscripten";

const RUNTIME_VERSION = "quickjs-emscripten@0.32.0";
const RUNTIME_CAPABILITIES = {
  dom: false,
  network: false,
  ambientSecrets: false
};

const input = await readStdin();
const request = JSON.parse(input);
const result = await runQuickJs(request);
stdout.write(JSON.stringify(result));

async function runQuickJs(request) {
  const QuickJS = await getQuickJS();
  const vm = QuickJS.newContext();
  const stdoutLines = [];
  const stderrLines = [];
  const timeoutMs = request.timeoutMs ?? 1000;
  const outputLimit = request.outputLimit ?? 4000;
  const limits = { timeoutMs, outputLimit };
  const outputState = { size: 0, exceeded: false };
  const startedAt = Date.now();

  vm.runtime.setInterruptHandler(() => Date.now() - startedAt > timeoutMs);

  try {
    installConsole(vm, stdoutLines, stderrLines, outputLimit, outputState);
    const result = vm.evalCode(request.source);

    if (result.error) {
      const errorText = stringifyHandle(vm, result.error);
      result.error.dispose();

      return {
        status: errorText.toLowerCase().includes("interrupted") ? "timeout" : "runtime_error",
        stdout: stdoutLines,
        stderr: [...stderrLines, errorText],
        result: null,
        runtimeVersion: RUNTIME_VERSION,
        limits,
        capabilities: RUNTIME_CAPABILITIES
      };
    }

    const value = vm.dump(result.value);
    result.value.dispose();

    return {
      status: outputState.exceeded ? "output_limit_exceeded" : "completed",
      stdout: stdoutLines,
      stderr: stderrLines,
      result: value,
      runtimeVersion: RUNTIME_VERSION,
      limits,
      capabilities: RUNTIME_CAPABILITIES
    };
  } finally {
    vm.dispose();
  }
}

function installConsole(vm, stdoutLines, stderrLines, outputLimit, outputState) {
  const consoleHandle = vm.newObject();
  const log = createConsoleMethod(vm, stdoutLines, outputLimit, outputState);
  const error = createConsoleMethod(vm, stderrLines, outputLimit, outputState);

  vm.setProp(consoleHandle, "log", log);
  vm.setProp(consoleHandle, "error", error);
  vm.setProp(vm.global, "console", consoleHandle);

  log.dispose();
  error.dispose();
  consoleHandle.dispose();
}

function createConsoleMethod(vm, target, outputLimit, outputState) {
  return vm.newFunction("write", (...args) => {
    const line = args.map((arg) => stringifyHandle(vm, arg)).join(" ");
    args.forEach((arg) => arg.dispose());

    if (outputState.size + line.length <= outputLimit) {
      target.push(line);
      outputState.size += line.length;
      return;
    }

    outputState.exceeded = true;
  });
}

function stringifyHandle(vm, handle) {
  const dumped = vm.dump(handle);

  if (typeof dumped === "string") {
    return dumped;
  }

  if (dumped === null || dumped === undefined) {
    return String(dumped);
  }

  if (typeof dumped === "object") {
    return JSON.stringify(dumped);
  }

  return String(dumped);
}

async function readStdin() {
  const chunks = [];

  for await (const chunk of stdin) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}
