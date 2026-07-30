import { z } from "zod";

import type { JavaScriptActivityTest } from "@/runtime/javascript/api";

const codeActivityConfigSchema = z.object({
  starterCode: z.string().default(""),
  tests: z.array(
    z.discriminatedUnion("kind", [
      z.object({
        name: z.string().min(1),
        kind: z.literal("source-contains"),
        value: z.string()
      }),
      z.object({
        name: z.string().min(1),
        kind: z.literal("stdout-equals"),
        value: z.string()
      })
    ])
  )
});

export type CodeActivityConfig = Readonly<{
  starterCode: string;
  tests: JavaScriptActivityTest[];
}>;

export function parseCodeActivityConfig(config: unknown): CodeActivityConfig {
  return codeActivityConfigSchema.parse(config);
}
