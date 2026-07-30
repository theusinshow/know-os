import { expect, test } from "@playwright/test";

test("foundation shell renders on desktop", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "KNOW/OS página inicial" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
  await expect(page.getByRole("main")).toContainText("Próxima ação");
  await expect(page.getByText("Fundação ativa")).toBeVisible();
});

test("skip link targets the main landmark", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Pular para o conteúdo principal" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});
