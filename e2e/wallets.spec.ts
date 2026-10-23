import { test, expect, type Page } from "@playwright/test";

const ANA = { email: "ana@example.com", password: "Teste@123", name: "Ana Silva" };
const BRUNO = {
  email: "bruno@example.com",
  password: "Teste@456",
  name: "Bruno Costa",
};

const PRIMARY_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";
const SECONDARY_ADDRESS = "0xabcdef1234567890abcdef1234567890abcdef12";

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

async function fillPrimaryWallet(page: Page, address = PRIMARY_ADDRESS) {
  const form = page.locator("#wallet-primary-form");

  await form.getByLabel("Nome de exibição").fill("Ana Silva");
  await form.getByLabel("Apelido da carteira").fill("Carteira principal");
  await form.getByLabel("Rede").selectOption("ethereum");
  await form.getByLabel("Nome do perfil").fill("Ana Colecionadora");
  await form.getByLabel("Endereço da carteira").fill(address);
  await form.getByLabel("Tipo de carteira").selectOption("metamask");
  await form.getByLabel("Código de indicação").fill("KURIO-2026");
  await form.getByLabel("E-mail").fill(ANA.email);
  await form.getByLabel("Nome ENS").fill("ana-silva");
}

test.describe("Carteiras", () => {
  test("visitante é redirecionado ao login ao acessar carteiras", async ({
    page,
  }) => {
    await page.goto("/profile/wallets");

    await expect(page).toHaveURL(/auth=login/);
    await expect(
      page.getByRole("dialog", { name: "Entrar na Kurio" }),
    ).toBeVisible();
  });

  test("cadastra a carteira principal e persiste após refresh", async ({
    page,
  }) => {
    await login(page, ANA);
    await page.goto("/profile/wallets");

    await fillPrimaryWallet(page);
    await page.getByRole("button", { name: "Adicionar carteira" }).click();

    await expect(page.getByText("Carteira cadastrada.")).toBeVisible();

    await page.reload();

    const form = page.locator("#wallet-primary-form");
    await expect(form.getByLabel("Endereço da carteira")).toHaveValue(
      PRIMARY_ADDRESS,
    );
    await expect(form.getByLabel("Apelido da carteira")).toHaveValue(
      "Carteira principal",
    );
    await expect(
      page.getByRole("button", { name: "Salvar carteira" }),
    ).toBeVisible();
  });

  test("valida endereço inválido e rede obrigatória", async ({ page }) => {
    await login(page, ANA);
    await page.goto("/profile/wallets");

    await page.getByRole("button", { name: "Adicionar carteira" }).click();

    await expect(
      page.locator("#wallet-primary-walletNickname-error"),
    ).toHaveText("Informe um apelido com ao menos 2 caracteres.");

    await fillPrimaryWallet(page, "0x123");
    await page.getByRole("button", { name: "Adicionar carteira" }).click();

    await expect(
      page.getByText("Informe um endereço 0x válido com 40 caracteres."),
    ).toBeVisible();
    await expect(
      page.locator("#wallet-primary-form").getByLabel("Endereço da carteira"),
    ).toBeFocused();
  });

  test("cadastra carteira secundária igual à principal e remove", async ({
    page,
  }) => {
    await login(page, ANA);
    await page.goto("/profile/wallets");

    await fillPrimaryWallet(page);
    await page.getByRole("button", { name: "Adicionar carteira" }).click();
    await expect(page.getByText("Carteira cadastrada.")).toBeVisible();

    await page.getByLabel("Igual à carteira principal").check();
    await page
      .getByRole("button", { name: "Adicionar", exact: true })
      .last()
      .click();

    const secondary = page.locator("#wallet-secondary-form");

    await expect(secondary.getByLabel("Apelido da carteira")).toHaveValue(
      "Carteira principal",
    );
    await expect(secondary.getByLabel("Endereço da carteira")).toHaveValue("");

    await secondary.getByLabel("Endereço da carteira").fill(SECONDARY_ADDRESS);
    await secondary
      .getByRole("button", { name: "Adicionar carteira" })
      .click();

    await expect(page.getByText("Carteira cadastrada.")).toBeVisible();

    await page.reload();
    await expect(
      page.locator("#wallet-secondary-form").getByLabel("Endereço da carteira"),
    ).toHaveValue(SECONDARY_ADDRESS);

    await page.getByRole("button", { name: "Remover carteira" }).click();

    await expect(
      page.getByText("Você ainda não adicionou uma carteira secundária."),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByText("Você ainda não adicionou uma carteira secundária."),
    ).toBeVisible();
  });

  test("rejeita endereço duplicado entre carteiras", async ({ page }) => {
    await login(page, ANA);
    await page.goto("/profile/wallets");

    await fillPrimaryWallet(page);
    await page.getByRole("button", { name: "Adicionar carteira" }).click();
    await expect(page.getByText("Carteira cadastrada.")).toBeVisible();

    await page
      .getByRole("button", { name: "Adicionar", exact: true })
      .last()
      .click();

    const secondary = page.locator("#wallet-secondary-form");

    await secondary.getByLabel("Nome de exibição").fill("Ana Silva");
    await secondary.getByLabel("Apelido da carteira").fill("Reserva");
    await secondary.getByLabel("Rede").selectOption("polygon");
    await secondary.getByLabel("Nome do perfil").fill("Ana Reserva");
    await secondary.getByLabel("Endereço da carteira").fill(PRIMARY_ADDRESS);
    await secondary.getByLabel("Tipo de carteira").selectOption("metamask");
    await secondary.getByLabel("Código de indicação").fill("KURIO-2026");
    await secondary.getByLabel("E-mail").fill(ANA.email);
    await secondary.getByLabel("Nome ENS").fill("ana-reserva");

    await secondary.getByRole("button", { name: "Adicionar carteira" }).click();

    await expect(page.locator("#wallet-secondary-address-error")).toHaveText(
      "Este endereço já está cadastrado.",
    );
  });

  test("carteiras são isoladas entre usuários", async ({ page }) => {
    await login(page, ANA);
    await page.goto("/profile/wallets");
    await fillPrimaryWallet(page);
    await page.getByRole("button", { name: "Adicionar carteira" }).click();
    await expect(page.getByText("Carteira cadastrada.")).toBeVisible();

    await logout(page);
    await login(page, BRUNO);
    await page.goto("/profile/wallets");

    await expect(
      page.locator("#wallet-primary-form").getByLabel("Endereço da carteira"),
    ).toHaveValue("");
    await expect(
      page.getByRole("button", { name: "Adicionar carteira" }),
    ).toBeVisible();
  });

  test("carteira cadastrada preenche o checkout", async ({ page }) => {
    await login(page, ANA);
    await page.goto("/profile/wallets");
    await fillPrimaryWallet(page);
    await page.getByRole("button", { name: "Adicionar carteira" }).click();
    await expect(page.getByText("Carteira cadastrada.")).toBeVisible();

    await page.goto("/nfts/1");
    await page.getByRole("button", { name: "Comprar" }).click();
    await expect(page.getByText("Item adicionado ao carrinho!")).toBeVisible();

    await page.goto("/checkout");
    await expect(
      page.getByRole("heading", { name: "Perfil do colecionador" }),
    ).toBeVisible();

    await page.getByRole("radio", { name: /Principal/ }).check();

    await expect(page.getByLabel("Endereço da carteira")).toHaveValue(
      PRIMARY_ADDRESS,
    );
    await expect(page.getByLabel("Nome do perfil")).toHaveValue(
      "Ana Colecionadora",
    );
    await expect(page.getByLabel("Tipo de carteira")).toHaveValue("metamask");

    await page.getByLabel("Nome de usuário").fill("ana.silva");
    await page.getByRole("button", { name: "Confirmar compra" }).click();

    await expect(
      page.getByRole("heading", { name: "Pedido confirmado" }),
    ).toBeVisible();
  });
});
