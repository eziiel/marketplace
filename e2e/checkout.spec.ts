import { test, expect, type Page } from "@playwright/test";
import { chooseOption } from "./select";

const EMAIL = "ana@example.com";
const PASSWORD = "Teste@123";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(EMAIL);
  await page.getByLabel("Senha").fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Olá, Ana Silva")).toBeVisible();
}

async function addGenesisToCart(page: Page) {
  await page.goto("/nfts/1");
  await page.getByRole("button", { name: "Comprar" }).click();
  await expect(page.getByText("Item adicionado ao carrinho!")).toBeVisible();
}

async function registerWallet(page: Page) {
  await page.evaluate(async () => {
    const token = localStorage.getItem("marketplace-auth-token");
    const sessionId = localStorage.getItem("marketplace-session-id");

    await fetch("/api/wallets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Session-Id": sessionId ?? "",
      },
      body: JSON.stringify({
        kind: "primary",
        displayName: "Ana Silva",
        walletNickname: "Carteira principal",
        networkId: "ethereum",
        profileName: "Ana Colecionadora",
        address: "0x1234567890abcdef1234567890abcdef12345678",
        secondaryAddress: "",
        walletType: "metamask",
        referralCode: "KURIO-2026",
        email: "ana@example.com",
        ensName: "ana-silva",
        ensDomain: ".eth",
      }),
    });
  });
}

async function selectAndConnectWallet(page: Page) {
  await page.getByRole("radio", { name: /Principal/ }).check();
  await page.getByRole("button", { name: "Conectar carteira" }).click();
  await expect(page.getByText("Carteira conectada.")).toBeVisible();
}

async function fillCollectorForm(page: Page) {
  await page.getByLabel("Nome de usuário").fill("ana.silva");
  await page.getByLabel("Nome do perfil").fill("Ana Colecionadora");
  await page
    .getByLabel("Endereço da carteira")
    .fill("0x1234567890abcdef1234567890abcdef12345678");
  await chooseOption(page, "Tipo de carteira", "MetaMask");
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

async function getCartItemCount(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const token = localStorage.getItem("marketplace-auth-token");
    const sessionId = localStorage.getItem("marketplace-session-id");
    const cart = await fetch("/api/cart", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Session-Id": sessionId ?? "",
      },
    }).then((response) => response.json());

    return cart.items.length as number;
  });
}

test.describe("Checkout", () => {
  test("compra completa do catálogo ao recibo confirmado", async ({ page }) => {
    await login(page);
    await registerWallet(page);
    await addGenesisToCart(page);

    await page.goto("/checkout");

    await expect(
      page.getByRole("heading", { name: "Perfil do colecionador" }),
    ).toBeVisible();
    await expect(page.getByText("1.1921 ETH")).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Confirmar compra" }),
    ).toBeDisabled();

    await selectAndConnectWallet(page);

    await page.getByRole("button", { name: "Confirmar compra" }).click();
    await expect(page.getByText("Informe um nome de usuário")).toBeVisible();
    await expect(page.getByLabel("Nome de usuário")).toBeFocused();

    await fillCollectorForm(page);
    await page.getByRole("button", { name: "Confirmar compra" }).click();

    await expect(
      page.getByRole("heading", { name: "Pedido confirmado" }),
    ).toBeVisible();
    await expect(page.getByText(/Total: 1\.1921 ETH/)).toBeVisible();
    await expect(page.getByText(/Transação: 0x/)).toBeVisible();

    expect(await getCartItemCount(page)).toBe(0);
  });

  test("pagamento recusado (cenário MSW) preserva o carrinho", async ({
    page,
  }) => {
    await login(page);
    await registerWallet(page);
    await addGenesisToCart(page);
    await setScenario(page, "payment_refused");

    await page.goto("/checkout");
    await expect(
      page.getByRole("heading", { name: "Perfil do colecionador" }),
    ).toBeVisible();
    await expect(page.getByText("Total", { exact: true })).toBeVisible();

    await selectAndConnectWallet(page);
    await fillCollectorForm(page);
    await page.getByRole("button", { name: "Confirmar compra" }).click();

    await expect(
      page.getByRole("heading", { name: "Pagamento recusado" }),
    ).toBeVisible();

    expect(await getCartItemCount(page)).toBeGreaterThan(0);
  });

  test("idempotência: mesma chave reusa o pedido e payload diferente gera 409", async ({
    page,
  }) => {
    await login(page);
    await addGenesisToCart(page);
    await setScenario(page, "payment_refused");

    const result = await page.evaluate(async () => {
      const token = localStorage.getItem("marketplace-auth-token");
      const sessionId = localStorage.getItem("marketplace-session-id");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Session-Id": sessionId ?? "",
      };

      const walletId = await fetch("/api/wallets", {
        method: "POST",
        headers,
        body: JSON.stringify({
          kind: "primary",
          displayName: "Ana Silva",
          walletNickname: "Carteira principal",
          networkId: "ethereum",
          profileName: "Ana Colecionadora",
          address: "0x1234567890abcdef1234567890abcdef12345678",
          secondaryAddress: "",
          walletType: "metamask",
          referralCode: "KURIO-2026",
          email: "ana@example.com",
          ensName: "ana-silva",
          ensDomain: ".eth",
        }),
      })
        .then((response) => response.json())
        .then((data) => data.wallet.id as string);

      const quoteOne = await fetch("/api/quote", {
        method: "POST",
        headers,
        body: JSON.stringify({ networkId: "ethereum" }),
      }).then((response) => response.json());

      const key = crypto.randomUUID();

      const first = await fetch("/api/orders", {
        method: "POST",
        headers: { ...headers, "Idempotency-Key": key },
        body: JSON.stringify({ quoteId: quoteOne.id, walletId }),
      }).then((response) => response.json());

      const secondResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { ...headers, "Idempotency-Key": key },
        body: JSON.stringify({ quoteId: quoteOne.id, walletId }),
      });
      const second = await secondResponse.json();

      const quoteTwo = await fetch("/api/quote", {
        method: "POST",
        headers,
        body: JSON.stringify({ networkId: "ethereum" }),
      }).then((response) => response.json());

      const conflictResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { ...headers, "Idempotency-Key": key },
        body: JSON.stringify({ quoteId: quoteTwo.id, walletId }),
      });

      return {
        firstId: first.id as string,
        secondId: second.id as string,
        secondStatus: secondResponse.status,
        conflictStatus: conflictResponse.status,
      };
    });

    expect(result.firstId).toBeTruthy();
    expect(result.secondId).toBe(result.firstId);
    expect(result.secondStatus).toBe(200);
    expect(result.conflictStatus).toBe(409);
  });
});
