import { z } from "zod";

const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.url().optional());

export const serverEnvSchema = z.object({
  APP_URL: optionalUrl,
  DATABASE_URL: optionalUrl,
  KNOW_OS_OWNER_ID: z.string().trim().min(1).default("local-owner"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info")
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(source: Record<string, string | undefined> = process.env): ServerEnv {
  return serverEnvSchema.parse({
    APP_URL: source.APP_URL,
    DATABASE_URL: source.DATABASE_URL,
    KNOW_OS_OWNER_ID: source.KNOW_OS_OWNER_ID,
    LOG_LEVEL: source.LOG_LEVEL
  });
}
