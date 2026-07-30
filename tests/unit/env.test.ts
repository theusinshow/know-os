import { describe, expect, it } from "vitest";

import { getServerEnv } from "@/lib/env";

describe("server environment contract", () => {
  it("keeps auth variables optional for local development", () => {
    expect(getServerEnv({})).toMatchObject({
      AUTH_GOOGLE_ID: undefined,
      AUTH_GOOGLE_SECRET: undefined,
      AUTH_SECRET: undefined,
      AUTH_TRUST_HOST: undefined,
      KNOW_OS_ALLOWED_GOOGLE_EMAILS: [],
      KNOW_OS_OWNER_ID: "local-owner"
    });
  });

  it("parses the Google e-mail allowlist", () => {
    expect(
      getServerEnv({
        KNOW_OS_ALLOWED_GOOGLE_EMAILS: " Owner@Example.com,second@example.com "
      }).KNOW_OS_ALLOWED_GOOGLE_EMAILS
    ).toEqual(["owner@example.com", "second@example.com"]);
  });

  it("treats blank optional production variables as absent", () => {
    expect(
      getServerEnv({
        APP_URL: "",
        AUTH_GOOGLE_ID: "",
        AUTH_GOOGLE_SECRET: "",
        AUTH_SECRET: "",
        AUTH_TRUST_HOST: "",
        DATABASE_URL: "",
        KNOW_OS_ALLOWED_GOOGLE_EMAILS: ""
      })
    ).toMatchObject({
      APP_URL: undefined,
      AUTH_GOOGLE_ID: undefined,
      AUTH_GOOGLE_SECRET: undefined,
      AUTH_SECRET: undefined,
      AUTH_TRUST_HOST: undefined,
      DATABASE_URL: undefined,
      KNOW_OS_ALLOWED_GOOGLE_EMAILS: []
    });
  });

  it("rejects invalid allowed Google e-mail entries", () => {
    expect(() => getServerEnv({ KNOW_OS_ALLOWED_GOOGLE_EMAILS: "not-an-email" })).toThrow();
  });

  it("parses Auth.js trusted-host setting for hosted reverse proxies", () => {
    expect(getServerEnv({ AUTH_TRUST_HOST: "true" }).AUTH_TRUST_HOST).toBe("true");
    expect(() => getServerEnv({ AUTH_TRUST_HOST: "yes" })).toThrow();
  });
});
