import { describe, expect, it } from "vitest";

import { googleAuthorizationParams } from "@/features/auth/google-oauth";

describe("Google OAuth parameters", () => {
  it("forces account selection instead of silently reusing the active Google session", () => {
    expect(googleAuthorizationParams).toEqual({
      prompt: "select_account"
    });
  });
});
