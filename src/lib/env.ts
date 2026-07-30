import { z } from "zod";

const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.url().optional());
const optionalSecret = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().min(1).optional()
);
const optionalBooleanString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.enum(["true", "false"]).optional()
);
const emailAllowlist = z.preprocess((value) => {
  if (value === "" || value === undefined) {
    return [];
  }

  if (typeof value !== "string") {
    return value;
  }

  return value
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}, z.array(z.email()).default([]));

export const serverEnvSchema = z.object({
  APP_URL: optionalUrl,
  AUTH_GOOGLE_ID: optionalSecret,
  AUTH_GOOGLE_SECRET: optionalSecret,
  AUTH_SECRET: optionalSecret,
  AUTH_TRUST_HOST: optionalBooleanString,
  DATABASE_URL: optionalUrl,
  KNOW_OS_ALLOWED_GOOGLE_EMAILS: emailAllowlist,
  KNOW_OS_OWNER_ID: z.string().trim().min(1).default("local-owner"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info")
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(source: Record<string, string | undefined> = process.env): ServerEnv {
  return serverEnvSchema.parse({
    APP_URL: source.APP_URL,
    AUTH_GOOGLE_ID: source.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: source.AUTH_GOOGLE_SECRET,
    AUTH_SECRET: source.AUTH_SECRET,
    AUTH_TRUST_HOST: source.AUTH_TRUST_HOST,
    DATABASE_URL: source.DATABASE_URL,
    KNOW_OS_ALLOWED_GOOGLE_EMAILS: source.KNOW_OS_ALLOWED_GOOGLE_EMAILS,
    KNOW_OS_OWNER_ID: source.KNOW_OS_OWNER_ID,
    LOG_LEVEL: source.LOG_LEVEL
  });
}
