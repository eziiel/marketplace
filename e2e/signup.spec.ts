import { test, expect } from "@playwright/test";

test("cadastra um usuário e permite login", async ({ page }) => {
  const email = `teste-${crypto.randomUUID()}@example.com`;
  const password = "Teste@123456";

  await page.goto("/signup");

  await page.getByLabel("Nome completo").fill("Usuário Teste");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByLabel("Confirmar senha").fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page.getByText("Cadastro realizado!")).toBeVisible();

  await page.getByRole("link", { name: "Ir para o login" }).click();

  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();

  await expect(page.getByText("Usuário Teste")).toBeVisible();
});

test("impede cadastro com e-mail duplicado", async ({ page }) => {
  await page.goto("/signup");

  await page.getByLabel("Nome completo").fill("Outra Ana");
  await page.getByLabel("E-mail").fill("ana@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("Teste@123456");
  await page.getByLabel("Confirmar senha").fill("Teste@123456");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page.getByRole("alert")).toContainText(
    "Este e-mail já está cadastrado",
  );
});
