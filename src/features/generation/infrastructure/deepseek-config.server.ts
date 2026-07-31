import "server-only";

import { getServerEnv, type ServerEnv } from "@/lib/env";

export const deepSeekGenerationDefaults = {
  baseUrl: "https://api.deepseek.com",
  defaultModel: "deepseek-v4-flash",
  proModel: "deepseek-v4-pro"
} as const;

export type DeepSeekGenerationConfig = Readonly<{
  provider: "deepseek";
  status: "configured" | "unconfigured";
  baseUrl: string;
  defaultModel: "deepseek-v4-flash" | "deepseek-v4-pro";
  proModel: "deepseek-v4-flash" | "deepseek-v4-pro";
  availableModels: readonly ["deepseek-v4-flash", "deepseek-v4-pro"];
}>;

export function getDeepSeekGenerationConfig(env: ServerEnv = getServerEnv()): DeepSeekGenerationConfig {
  return {
    provider: "deepseek",
    status: env.DEEPSEEK_API_KEY ? "configured" : "unconfigured",
    baseUrl: env.DEEPSEEK_BASE_URL,
    defaultModel: env.DEEPSEEK_DEFAULT_MODEL,
    proModel: env.DEEPSEEK_PRO_MODEL,
    availableModels: ["deepseek-v4-flash", "deepseek-v4-pro"]
  };
}
