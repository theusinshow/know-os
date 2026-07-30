import { expect, test } from "@playwright/test";

test("custom sign-in surface uses KNOW/OS design language", async ({ page }) => {
  await page.goto("/auth/signin");

  await expect(page.getByRole("main")).toContainText("Escolha a conta Google");
  await expect(page.getByRole("img", { name: "KNOW/OS" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar com Google" })).toBeVisible();
  await expect(page.getByText("Google OAuth com seleção manual.")).toBeVisible();
});
