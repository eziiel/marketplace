import { test, expect, type Page } from "@playwright/test";

const EMAIL = "ana@example.com";
const PASSWORD = "Teste@123";

async function resetData(page: Page) {
  await page.evaluate(async () => {
    await fetch("/api/test/reset", { method: "POST" });
  });
}

async function waitForRealtime(page: Page) {
  await page.waitForFunction(
    () =>
      (window as unknown as { __realtimeReady?: boolean }).__realtimeReady ===
      true,
    undefined,
    { timeout: 10000 },
  );
}

async function emitNftUpdated(
  page: Page,
  payload: { id: string; version: number; price?: string; available?: number },
) {
  await page.evaluate(async (body) => {
    await fetch("/api/test/nft-updated", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }, payload);
}

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(EMAIL);
  await page.getByLabel("Senha").fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Olá, Ana Silva")).toBeVisible();
}

test.describe("Tempo real", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForRealtime(page);
    await resetData(page);
  });

  test("nft.updated atualiza preço e estoque no detalhe em tempo real", async ({
    page,
  }) => {
    await page.goto("/nfts/1");
    await expect(page.getByText(/Preço: 1\.19 ETH/)).toBeVisible();
    await expect(page.getByText("Disponíveis: 5")).toBeVisible();

    await waitForRealtime(page);
    await emitNftUpdated(page, {
      id: "1",
      version: 5,
      price: "9.9",
      available: 4,
    });

    await expect(page.getByText(/Preço: 9\.9 ETH/)).toBeVisible();
    await expect(page.getByText("Disponíveis: 4")).toBeVisible();
  });

  test("nft.updated com versão antiga é ignorado", async ({ page }) => {
    await page.goto("/nfts/1");
    await expect(page.getByText(/Preço: 1\.19 ETH/)).toBeVisible();

    await waitForRealtime(page);

    await emitNftUpdated(page, {
      id: "1",
      version: 5,
      price: "7.7",
      available: 3,
    });
    await expect(page.getByText(/Preço: 7\.7 ETH/)).toBeVisible();

    await emitNftUpdated(page, {
      id: "1",
      version: 3,
      price: "1.1",
      available: 9,
    });

    await expect(page.getByText(/Preço: 7\.7 ETH/)).toBeVisible();
    await expect(page.getByText(/Preço: 1\.1 ETH/)).toHaveCount(0);
  });

  test("pedido confirma de forma assíncrona (pending → confirmed)", async ({
    page,
  }) => {
    await login(page);

    await page.goto("/nfts/1");
    await page.getByRole("button", { name: "Comprar" }).click();
    await expect(page.getByText("Item adicionado ao carrinho!")).toBeVisible();

    await page.goto("/checkout");
    await expect(
      page.getByRole("heading", { name: "Perfil do colecionador" }),
    ).toBeVisible();
    await expect(page.getByText("Total", { exact: true })).toBeVisible();

    await page.getByLabel("Nome de usuário").fill("ana.silva");
    await page.getByLabel("Nome do perfil").fill("Ana Colecionadora");
    await page
      .getByLabel("Endereço da carteira")
      .fill("0x1234567890abcdef1234567890abcdef12345678");
    await page.getByLabel("Tipo de carteira").selectOption("metamask");
    await page.getByRole("button", { name: "Confirmar compra" }).click();

    await expect(
      page.getByRole("heading", { name: "Pedido pendente" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Pedido confirmado" }),
    ).toBeVisible();
  });
});
