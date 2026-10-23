import { test, expect } from "@playwright/test";

const VALID_EMAIL = "ana@example.com";
const VALID_PASSWORD = "Teste@123";

test.describe("Autenticação", () => {
  test("login com credenciais inválidas exibe erro", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Entrar no Kurio" }),
    ).toBeVisible();

    await page.getByLabel("E-mail").fill("errado@example.com");
    await page.getByLabel("Senha").fill("senha-errada");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("login válido autentica e logout encerra a sessão", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("E-mail").fill(VALID_EMAIL);
    await page.getByLabel("Senha").fill(VALID_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Olá, Ana Silva")).toBeVisible();

    await page.getByRole("button", { name: "Sair" }).click();

    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
  });
});
