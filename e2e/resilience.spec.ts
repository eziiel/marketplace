import { test, expect, type Page } from "@playwright/test";

import { chooseOption } from "./select";
import { clearFaults, listFaults, resetApi, setFaults } from "./faults";

const ANA = { email: "ana@example.com", password: "Teste@123" };
const ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(ANA.email);
  await page.getByLabel("Senha").fill(ANA.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Olá, Ana Silva")).toBeVisible();
}

async function registerWallet(page: Page) {
  await page.evaluate(async (address) => {
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
        address,
        secondaryAddress: "",
        walletType: "metamask",
        referralCode: "KURIO-2026",
        email: "ana@example.com",
        ensName: "ana-silva",
        ensDomain: ".eth",
      }),
    });
  }, ADDRESS);
}

async function addToCart(page: Page) {
  await page.goto("/nfts/1");
  await page.getByRole("button", { name: "Comprar" }).click();
  await expect(page.getByText("Item adicionado ao carrinho!")).toBeVisible();
}

async function prepareCheckout(page: Page) {
  await page.goto("/checkout");
  await page.getByRole("radio", { name: /Principal/ }).check();
  await page.getByRole("button", { name: "Conectar carteira" }).click();
  await expect(page.getByText("Carteira conectada.")).toBeVisible();

  await page.getByLabel("Nome de usuário").fill("ana.silva");
  await page.getByLabel("Nome do perfil").fill("Ana Colecionadora");
  await page.getByLabel("Endereço da carteira").fill(ADDRESS);
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

async function orderCount(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const token = localStorage.getItem("marketplace-auth-token");
    const sessionId = localStorage.getItem("marketplace-session-id");

    const orders = await fetch("/api/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Session-Id": sessionId ?? "",
      },
    }).then((response) => response.json());

    return orders.length as number;
  });
}

test.describe("Resiliência de rede", () => {
  test("catálogo exibe carregamento sob latência e conclui", async ({
    page,
  }) => {
    await page.goto("/");
    await setFaults(page, [
      { path: "/api/nfts", method: "GET", mode: "latency", delayMs: 1500 },
    ]);

    await page.reload();

    await expect(
      page.getByRole("list", { name: "Carregando catálogo" }),
    ).toBeVisible();
    await expect(page.getByText("Carregando NFTs...")).toBeVisible();

    await expect(page.getByText("36 NFTs encontrados")).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Resultados do catálogo" }),
    ).toBeVisible();
  });

  test("erro 500 no catálogo mostra mensagem e recupera no retry", async ({
    page,
  }) => {
    await page.goto("/");
    await setFaults(page, [
      { path: "/api/nfts", method: "GET", mode: "error500", times: 2 },
    ]);

    await page.reload();

    await expect(
      page.getByText("Não foi possível carregar os NFTs"),
    ).toBeVisible();
    await expect(page.getByText("Erro interno do servidor")).toBeVisible();

    await page.getByRole("button", { name: "Tentar novamente" }).click();

    await expect(page.getByText("36 NFTs encontrados")).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Resultados do catálogo" }),
    ).toBeVisible();
  });

  test("erro 503 mantém o estado recuperável sem tela vazia", async ({
    page,
  }) => {
    await page.goto("/?collection=M%C3%BAsica");
    await expect(page.getByText("7 NFTs encontrados")).toBeVisible();

    await setFaults(page, [
      { path: "/api/nfts", method: "GET", mode: "error503", times: 2 },
    ]);

    await page.reload();

    await expect(
      page.getByText("Serviço temporariamente indisponível"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Tentar novamente" }),
    ).toBeVisible();
    await expect(page).toHaveURL(/collection=/);

    await page.getByRole("button", { name: "Tentar novamente" }).click();

    await expect(page.getByText("7 NFTs encontrados")).toBeVisible();
  });

  test("conexão indisponível dá feedback e recupera ao voltar", async ({
    page,
  }) => {
    await page.goto("/");
    await setFaults(page, [
      { path: "/api/nfts", method: "GET", mode: "offline" },
    ]);

    await page.reload();

    await expect(
      page.getByText("Não foi possível carregar os NFTs"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Tentar novamente" }),
    ).toBeVisible();

    await clearFaults(page);
    await page.getByRole("button", { name: "Tentar novamente" }).click();

    await expect(page.getByText("36 NFTs encontrados")).toBeVisible();
  });

  test("erro no pedido preserva formulário, carrinho e seleção", async ({
    page,
  }) => {
    await login(page);
    await registerWallet(page);
    await addToCart(page);
    await prepareCheckout(page);

    await setFaults(page, [
      { path: "/api/orders", method: "POST", mode: "error500", times: 1 },
    ]);

    await page.getByRole("button", { name: "Confirmar compra" }).click();

    await expect(page.getByText("Erro interno do servidor")).toBeVisible();
    await expect(page).toHaveURL(/checkout/);

    await expect(page.getByLabel("Nome de usuário")).toHaveValue("ana.silva");
    await expect(page.getByLabel("Nome do perfil")).toHaveValue(
      "Ana Colecionadora",
    );
    await expect(page.getByLabel("Endereço da carteira")).toHaveValue(ADDRESS);
    await expect(page.getByText("Carteira conectada.")).toBeVisible();
    await expect(page.getByText("Emerald Ape #042")).toBeVisible();
    expect(await orderCount(page)).toBe(0);
  });

  test("sessão expirada derruba o usuário e permite reautenticar", async ({
    page,
  }) => {
    await login(page);

    await setFaults(page, [{ path: "/api/profile", mode: "unauthorized" }]);

    await page.goto("/profile");

    await expect(
      page.getByRole("dialog", { name: "Entrar na Kurio" }),
    ).toBeVisible();
    await expect(page.getByText("Olá, Ana Silva")).toHaveCount(0);

    const token = await page.evaluate(() =>
      localStorage.getItem("marketplace-auth-token"),
    );
    expect(token).toBeNull();

    await clearFaults(page);

    await page.getByLabel("E-mail").fill(ANA.email);
    await page.getByLabel("Senha").fill(ANA.password);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    await expect(page.getByText("Olá, Ana Silva")).toBeVisible();

    await page.goto("/profile");
    await expect(
      page.getByRole("heading", { name: "Perfil do colecionador" }),
    ).toBeVisible();
  });

  test("sessão expirada preserva o carrinho do catálogo", async ({ page }) => {
    await login(page);
    await addToCart(page);

    await setFaults(page, [{ path: "/api/profile", mode: "unauthorized" }]);
    await page.goto("/profile");

    await expect(
      page.getByRole("dialog", { name: "Entrar na Kurio" }),
    ).toBeVisible();

    await clearFaults(page);
    await page.goto("/cart");

    await expect(page.getByText("Emerald Ape #042")).toBeVisible();
  });

  test("timeout após o servidor persistir o pedido permite consultar a situação", async ({
    page,
  }) => {
    await login(page);
    await registerWallet(page);
    await addToCart(page);
    await setScenario(page, "timeout");
    await prepareCheckout(page);

    await page.getByRole("button", { name: "Confirmar compra" }).click();

    await expect(
      page.getByText(/a confirmação não chegou a tempo/i),
    ).toBeVisible();

    const link = page.getByRole("link", { name: "Ver situação do pedido" });
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL(/\/orders\//);
    await expect(
      page.getByRole("heading", { name: "Pedido confirmado" }),
    ).toBeVisible();

    expect(await orderCount(page)).toBe(1);
  });

  test("falha sem resposta reenvia com a mesma chave e não duplica o pedido", async ({
    page,
  }) => {
    await login(page);
    await registerWallet(page);
    await addToCart(page);
    await prepareCheckout(page);

    await setFaults(page, [
      { path: "/api/orders", method: "POST", mode: "offline", times: 1 },
    ]);

    await page.getByRole("button", { name: "Confirmar compra" }).click();

    await expect(page.getByText(/não houve resposta do servidor/i)).toBeVisible();
    expect(await orderCount(page)).toBe(0);

    await page.getByRole("button", { name: "Tentar novamente" }).click();

    await expect(page).toHaveURL(/\/orders\//);
    await expect(
      page.getByRole("heading", { name: "Pedido confirmado" }),
    ).toBeVisible();

    expect(await orderCount(page)).toBe(1);
  });

  test("timeout de requisição aborta no cliente e permite nova tentativa", async ({
    page,
  }) => {
    test.setTimeout(45_000);

    await page.goto("/");
    await setFaults(page, [
      {
        path: "/api/nfts",
        method: "GET",
        mode: "timeout",
        delayMs: 12_000,
        times: 2,
      },
    ]);

    await page.reload();

    await expect(
      page.getByRole("list", { name: "Carregando catálogo" }),
    ).toBeVisible();

    await expect(
      page.getByText("O servidor demorou demais para responder. Tente novamente."),
    ).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: "Tentar novamente" }).click();

    await expect(page.getByText("36 NFTs encontrados")).toBeVisible();
  });

  test("cenários de rede são isolados e o reset restaura a API", async ({
    page,
  }) => {
    await page.goto("/");

    expect(await listFaults(page)).toEqual([]);

    await setFaults(page, [
      { path: "/api/nfts", mode: "error503" },
      { path: "/api/profile", mode: "unauthorized" },
    ]);

    expect(await listFaults(page)).toHaveLength(2);

    await resetApi(page);

    expect(await listFaults(page)).toEqual([]);

    await page.reload();
    await expect(page.getByText("36 NFTs encontrados")).toBeVisible();
  });

  test("falhas não configuradas não afetam outros endpoints", async ({
    page,
  }) => {
    await login(page);
    await setFaults(page, [
      { path: "/api/orders", method: "POST", mode: "error500" },
    ]);

    await page.goto("/");
    await expect(page.getByText("36 NFTs encontrados")).toBeVisible();
    await expect(page.getByText("Olá, Ana Silva")).toBeVisible();

    await page.goto("/profile");
    await expect(
      page.getByRole("heading", { name: "Perfil do colecionador" }),
    ).toBeVisible();
  });
});
