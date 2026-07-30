import { expect, test } from "@playwright/test";

test("application responses include baseline security headers", async ({ request }) => {
  const response = await request.get("/");

  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["permissions-policy"]).toContain("camera=()");
  const contentSecurityPolicy = response.headers()["content-security-policy"];

  expect(contentSecurityPolicy).toContain("default-src 'self'");
  expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
  expect(contentSecurityPolicy).toContain("object-src 'none'");
  expect(contentSecurityPolicy).toContain("script-src 'self' 'nonce-");
  expect(contentSecurityPolicy).toContain("'strict-dynamic'");
  expect(contentSecurityPolicy).not.toContain("'unsafe-inline'");
  expect(contentSecurityPolicy).toContain("https://accounts.google.com");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
});
