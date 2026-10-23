import { test, expect, type Page } from "@playwright/test";

const ANA = { email: "ana@example.com", password: "Teste@123", name: "Ana Silva" };
const BRUNO = {
  email: "bruno@example.com",
  password: "Teste@456",
  name: "Bruno Costa",
};

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function login(
  page: Page,
  account: { email: string; password: string; name: string },
) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(account.email);
  await page.getByLabel("Senha", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByText(`Olá, ${account.name}`)).toBeVisible();
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "Sair" }).first().click();
  await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
}

test.describe("Perfil do colecionador", () => {
  test("visitante é redirecionado ao login ao acessar o perfil", async ({
    page,
  }) => {
    await page.goto("/profile");

    await expect(page).toHaveURL(/auth=login/);
    await expect(
      page.getByRole("dialog", { name: "Entrar na Kurio" }),
    ).toBeVisible();
  });

  test("consulta o perfil, atualiza e persiste após refresh", async ({
    page,
  }) => {
    await login(page, ANA);
    await page.goto("/profile");

    await expect(page.getByLabel("Nome de exibição")).toHaveValue(ANA.name);
    await expect(page.getByLabel("E-mail")).toHaveValue(ANA.email);

    await page.getByLabel("Nome de usuário").fill("ana.colecionadora");
    await page.getByLabel("Nome ENS").fill("ana-silva");
    await page.getByLabel("Apelido da carteira").fill("Carteira da Ana");
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText("Perfil atualizado.")).toBeVisible();

    await page.reload();

    await expect(page.getByLabel("Nome de usuário")).toHaveValue(
      "ana.colecionadora",
    );
    await expect(page.getByLabel("Nome ENS")).toHaveValue(
      "ana-silva",
    );
    await expect(page.getByLabel("Apelido da carteira")).toHaveValue(
      "Carteira da Ana",
    );
  });

  test("exibe erros de validação e foca o primeiro campo inválido", async ({
    page,
  }) => {
    await login(page, ANA);
    await page.goto("/profile");

    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText(/Use de 3 a 30 caracteres/)).toBeVisible();
    await expect(page.getByLabel("Nome de usuário")).toBeFocused();

    await page.getByLabel("Nome de usuário").fill("ana.silva");
    await page.getByLabel("E-mail").fill("email-invalido");
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
    await expect(page.getByLabel("E-mail")).toBeFocused();
  });

  test("altera o avatar e remove depois", async ({ page }) => {
    await login(page, ANA);
    await page.goto("/profile");

    await page.setInputFiles('input[type="file"]', {
      name: "avatar.png",
      mimeType: "image/png",
      buffer: Buffer.from(PNG_BASE64, "base64"),
    });

    await expect(
      page.getByRole("img", { name: "Avatar atual do colecionador" }),
    ).toBeVisible();

    await page.getByLabel("Nome de usuário").fill("ana.avatar");
    await page.getByLabel("Nome ENS").fill("ana-avatar");
    await page.getByLabel("Apelido da carteira").fill("Principal");
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText("Perfil atualizado.")).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("img", { name: "Avatar atual do colecionador" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Remover" }).click();
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Perfil atualizado.")).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("img", { name: "Avatar atual do colecionador" }),
    ).toHaveCount(0);
  });

  test("altera a senha e autentica com a nova credencial", async ({ page }) => {
    const novaSenha = "NovaSenha@2026";

    await login(page, ANA);
    await page.goto("/profile");

    await page.getByLabel("Nome de usuário").fill("ana.senha");
    await page.getByLabel("Nome ENS").fill("ana-senha");
    await page.getByLabel("Apelido da carteira").fill("Principal");

    await page.getByLabel("Senha atual").fill(ANA.password);
    await page.getByLabel("Nova senha", { exact: true }).fill(novaSenha);
    await page.getByLabel("Confirmar nova senha").fill(novaSenha);
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText("Perfil e senha atualizados.")).toBeVisible();

    await logout(page);

    await page.goto("/login");
    await page.getByLabel("E-mail").fill(ANA.email);
    await page.getByLabel("Senha", { exact: true }).fill(ANA.password);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page.getByRole("alert")).toBeVisible();

    await page.getByLabel("Senha", { exact: true }).fill(novaSenha);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page.getByText(`Olá, ${ANA.name}`)).toBeVisible();
  });

  test("rejeita senha atual incorreta e confirmação divergente", async ({
    page,
  }) => {
    await login(page, ANA);
    await page.goto("/profile");

    await page.getByLabel("Nome de usuário").fill("ana.erros");
    await page.getByLabel("Nome ENS").fill("ana-erros");
    await page.getByLabel("Apelido da carteira").fill("Principal");

    await page.getByLabel("Senha atual").fill("Teste@123");
    await page.getByLabel("Nova senha", { exact: true }).fill("OutraSenha@1");
    await page.getByLabel("Confirmar nova senha").fill("DiferenteSenha@1");
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText("As senhas não coincidem.")).toBeVisible();
    await expect(page.getByLabel("Confirmar nova senha")).toBeFocused();

    await page.getByLabel("Senha atual").fill("SenhaErrada@1");
    await page.getByLabel("Nova senha", { exact: true }).fill("OutraSenha@1");
    await page.getByLabel("Confirmar nova senha").fill("OutraSenha@1");
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.locator("#profile-currentPassword-error")).toHaveText(
      "A senha atual está incorreta.",
    );
  });

  test("perfis são isolados entre usuários", async ({ page }) => {
    await login(page, ANA);
    await page.goto("/profile");
    await page.getByLabel("Nome de usuário").fill("ana.isolada");
    await page.getByLabel("Nome ENS").fill("ana-isolada");
    await page.getByLabel("Apelido da carteira").fill("Carteira da Ana");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Perfil atualizado.")).toBeVisible();

    await logout(page);
    await login(page, BRUNO);
    await page.goto("/profile");

    await expect(page.getByLabel("Nome de exibição")).toHaveValue(BRUNO.name);
    await expect(page.getByLabel("Nome de usuário")).toHaveValue("");
    await expect(page.getByLabel("Apelido da carteira")).toHaveValue("");
  });
});
