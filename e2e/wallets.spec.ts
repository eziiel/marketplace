import { test, expect, type Page } from "@playwright/test";
import { chooseNetwork, chooseOption } from "./select";

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

async function setScenario(page: Page, scenario: string) {
  await page.evaluate(async (value) => {
    await fetch("/api/test/scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: value }),
    });
  }, scenario);
}

async function fillWallet(
  page: Page,
  kind: "primary" | "secondary",
  overrides: { address?: string; nickname?: string; network?: string } = {},
) {
  const form = page.locator(`#wallet-${kind}-form`);

  await form.getByLabel("Nome de exibição").fill("Ana Silva");
  await form
    .getByLabel("Apelido da carteira")
    .fill(overrides.nickname ?? "Carteira principal");
  await chooseNetwork(form, overrides.network ?? "ethereum");
  await form.getByLabel("Nome do perfil").fill("Ana Colecionadora");
  await form
    .getByLabel("Endereço da carteira")
    .fill(overrides.address ?? PRIMARY_ADDRESS);
  await chooseOption(form, "Tipo de carteira", "MetaMask");
  await form.getByLabel("Código de indicação").fill("KURIO-2026");
  await form.getByLabel("E-mail").fill(ANA.email);
  await form.getByLabel("Nome ENS").fill("ana-silva");
}

async function createPrimary(page: Page) {
  await page.goto("/profile/wallets");
  await fillWallet(page, "primary");
  await page.getByRole("button", { name: "Adicionar carteira" }).click();
  await expect(page.getByText("Carteira cadastrada.")).toBeVisible();
}

async function addToCart(page: Page) {
  await page.goto("/nfts/1");
  await page.getByRole("button", { name: "Comprar" }).click();
  await expect(page.getByText("Item adicionado ao carrinho!")).toBeVisible();
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
    await createPrimary(page);

    await expect(
      page.getByRole("list", { name: "Carteiras cadastradas" }),
    ).toContainText("Principal");

    await page.reload();

    const form = page.locator("#wallet-primary-form");
    await expect(form.getByLabel("Endereço da carteira")).toHaveValue(
      PRIMARY_ADDRESS,
    );
    await expect(
      page.getByRole("list", { name: "Carteiras cadastradas" }),
    ).toContainText("Carteira principal");
  });

  test("edita uma carteira existente sem duplicar o registro", async ({
    page,
  }) => {
    await login(page, ANA);
    await createPrimary(page);

    const form = page.locator("#wallet-primary-form");
    await form.getByLabel("Apelido da carteira").fill("Carteira editada");
    await page.getByRole("button", { name: "Salvar carteira" }).click();

    await expect(page.getByText("Carteira atualizada.")).toBeVisible();

    await page.reload();

    await expect(
      page.getByRole("list", { name: "Carteiras cadastradas" }),
    ).toContainText("Carteira editada");
    await expect(
      page.getByRole("list", { name: "Carteiras cadastradas" }).getByRole("listitem"),
    ).toHaveCount(1);
  });

  test("valida apelido vazio e endereço fora do formato da rede", async ({
    page,
  }) => {
    await login(page, ANA);
    await page.goto("/profile/wallets");

    await page.getByRole("button", { name: "Adicionar carteira" }).click();
    await expect(
      page.locator("#wallet-primary-walletNickname-error"),
    ).toHaveText("Informe um apelido com ao menos 2 caracteres.");

    await fillWallet(page, "primary", { address: "0x123" });
    await page.getByRole("button", { name: "Adicionar carteira" }).click();

    await expect(page.locator("#wallet-primary-address-error")).toHaveText(
      "Informe um endereço 0x válido com 40 caracteres hexadecimais.",
    );
    await expect(
      page.locator("#wallet-primary-form").getByLabel("Endereço da carteira"),
    ).toBeFocused();
  });

  test("rede Solana exige endereço base58 em vez de 0x", async ({ page }) => {
    await login(page, ANA);
    await page.goto("/profile/wallets");

    await fillWallet(page, "primary", {
      network: "solana",
      address: PRIMARY_ADDRESS,
    });
    await page.getByRole("button", { name: "Adicionar carteira" }).click();

    await expect(page.locator("#wallet-primary-address-error")).toHaveText(
      "Informe um endereço base58 válido com 32 a 44 caracteres.",
    );

    await page
      .locator("#wallet-primary-form")
      .getByLabel("Endereço da carteira")
      .fill("7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK");
    await page.getByRole("button", { name: "Adicionar carteira" }).click();

    await expect(page.getByText("Carteira cadastrada.")).toBeVisible();
  });

  test("secundária herda dados da principal e pode virar principal", async ({
    page,
  }) => {
    await login(page, ANA);
    await createPrimary(page);

    await page
      .getByRole("radio", { name: "Igual à carteira principal" })
      .check();
    await page
      .getByRole("button", { name: "Adicionar", exact: true })
      .last()
      .click();

    const secondary = page.locator("#wallet-secondary-form");
    await expect(secondary.getByLabel("Apelido da carteira")).toHaveValue(
      "Carteira principal",
    );
    await expect(secondary.getByLabel("Endereço da carteira")).toHaveValue("");

    await secondary.getByLabel("Apelido da carteira").fill("Carteira reserva");
    await secondary.getByLabel("Endereço da carteira").fill(SECONDARY_ADDRESS);
    await secondary.getByRole("button", { name: "Adicionar carteira" }).click();
    await expect(secondary.getByText("Carteira cadastrada.")).toBeVisible();

    await page
      .getByRole("button", { name: "Tornar carteira principal" })
      .click();
    await expect(
      page.getByText("Carteira definida como principal."),
    ).toBeVisible();

    await page.reload();

    const items = page
      .getByRole("list", { name: "Carteiras cadastradas" })
      .getByRole("listitem");

    await expect(items).toHaveCount(2);
    await expect(items.first()).toContainText("Principal");
    await expect(items.first()).toContainText("Carteira reserva");
  });

  test("remoção pede confirmação e promove a secundária", async ({ page }) => {
    await login(page, ANA);
    await createPrimary(page);

    await page
      .getByRole("button", { name: "Adicionar", exact: true })
      .last()
      .click();

    const secondary = page.locator("#wallet-secondary-form");
    await secondary.getByLabel("Nome de exibição").fill("Ana Silva");
    await secondary.getByLabel("Apelido da carteira").fill("Carteira reserva");
    await chooseNetwork(secondary, "polygon");
    await secondary.getByLabel("Nome do perfil").fill("Ana Colecionadora");
    await secondary.getByLabel("Endereço da carteira").fill(SECONDARY_ADDRESS);
    await chooseOption(secondary, "Tipo de carteira", "MetaMask");
    await secondary.getByLabel("Código de indicação").fill("KURIO-2026");
    await secondary.getByLabel("E-mail").fill(ANA.email);
    await secondary.getByLabel("Nome ENS").fill("ana-reserva");
    await secondary.getByRole("button", { name: "Adicionar carteira" }).click();
    await expect(secondary.getByText("Carteira cadastrada.")).toBeVisible();

    await page
      .locator("#wallet-primary-form")
      .getByRole("button", { name: "Remover carteira" })
      .click();

    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(dialog).toBeHidden();

    await page
      .locator("#wallet-primary-form")
      .getByRole("button", { name: "Remover carteira" })
      .click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Confirmar remoção" })
      .click();

    await page.reload();

    const items = page
      .getByRole("list", { name: "Carteiras cadastradas" })
      .getByRole("listitem");

    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText("Principal");
    await expect(items.first()).toContainText("Carteira reserva");
  });

  test("rejeita endereço duplicado entre carteiras", async ({ page }) => {
    await login(page, ANA);
    await createPrimary(page);

    await page
      .getByRole("button", { name: "Adicionar", exact: true })
      .last()
      .click();

    const secondary = page.locator("#wallet-secondary-form");
    await secondary.getByLabel("Nome de exibição").fill("Ana Silva");
    await secondary.getByLabel("Apelido da carteira").fill("Reserva");
    await chooseNetwork(secondary, "polygon");
    await secondary.getByLabel("Nome do perfil").fill("Ana Reserva");
    await secondary.getByLabel("Endereço da carteira").fill(PRIMARY_ADDRESS);
    await chooseOption(secondary, "Tipo de carteira", "MetaMask");
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
    await createPrimary(page);

    await logout(page);
    await login(page, BRUNO);
    await page.goto("/profile/wallets");

    await expect(
      page.locator("#wallet-primary-form").getByLabel("Endereço da carteira"),
    ).toHaveValue("");
    await expect(
      page.getByRole("list", { name: "Carteiras cadastradas" }),
    ).toHaveCount(0);
  });

  test("checkout exige carteira conectada e conclui a compra", async ({
    page,
  }) => {
    await login(page, ANA);
    await createPrimary(page);
    await addToCart(page);

    await page.goto("/checkout");
    await expect(
      page.getByRole("heading", { name: "Perfil do colecionador" }),
    ).toBeVisible();

    const confirm = page.getByRole("button", { name: "Confirmar compra" });
    await expect(confirm).toBeDisabled();

    await page.getByRole("radio", { name: /Principal/ }).check();
    await expect(page.getByLabel("Endereço da carteira")).toHaveValue(
      PRIMARY_ADDRESS,
    );
    await expect(confirm).toBeDisabled();

    await page.getByRole("button", { name: "Conectar carteira" }).click();
    await expect(page.getByText("Carteira conectada.")).toBeVisible();
    await expect(confirm).toBeEnabled();

    await page.getByLabel("Nome de usuário").fill("ana.silva");
    await confirm.click();

    await expect(
      page.getByRole("heading", { name: "Pedido confirmado" }),
    ).toBeVisible();
    await expect(page.getByText("Carteira principal")).toBeVisible();
  });

  test("conexão recusada impede a confirmação", async ({ page }) => {
    await login(page, ANA);
    await createPrimary(page);
    await addToCart(page);
    await setScenario(page, "wallet_refused");

    await page.goto("/checkout");
    await page.getByRole("radio", { name: /Principal/ }).check();
    await page.getByRole("button", { name: "Conectar carteira" }).click();

    await expect(
      page.getByText("Conexão recusada pela carteira."),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Confirmar compra" }),
    ).toBeDisabled();

    await setScenario(page, "success");
  });

  test("troca de rede incompatível bloqueia a compra", async ({ page }) => {
    await login(page, ANA);
    await createPrimary(page);
    await addToCart(page);

    await page.goto("/checkout");
    await page.getByRole("radio", { name: /Principal/ }).check();
    await page.getByRole("button", { name: "Conectar carteira" }).click();
    await expect(page.getByText("Carteira conectada.")).toBeVisible();

    await chooseNetwork(page, "polygon");

    await expect(page.getByText(/Esta carteira é da rede Ethereum/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Confirmar compra" }),
    ).toBeDisabled();
  });

  test("checkout sem carteira oferece cadastro e volta ao pagamento", async ({
    page,
  }) => {
    await login(page, ANA);
    await addToCart(page);

    await page.goto("/checkout");

    await expect(
      page.getByText("Você ainda não cadastrou uma carteira"),
    ).toBeVisible();

    await page.getByRole("link", { name: "Cadastrar carteira" }).click();
    await expect(page).toHaveURL(/profile\/wallets\?from=checkout/);

    await page.getByRole("link", { name: "Voltar ao pagamento" }).click();
    await expect(page).toHaveURL(/checkout/);
  });
});
