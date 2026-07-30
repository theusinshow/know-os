export const JAVASCRIPT_RUNTIME_VERSION = "quickjs-emscripten@0.32.0";
export const DEFAULT_JAVASCRIPT_TIMEOUT_MS = 1000;
export const DEFAULT_JAVASCRIPT_OUTPUT_LIMIT = 4000;

export const JAVASCRIPT_RUNTIME_CAPABILITIES = {
  dom: false,
  network: false,
  ambientSecrets: false
} as const;

export type JavaScriptRuntimeCapabilities = typeof JAVASCRIPT_RUNTIME_CAPABILITIES;

export type JavaScriptRuntimeLimits = Readonly<{
  timeoutMs: number;
  outputLimit: number;
}>;
