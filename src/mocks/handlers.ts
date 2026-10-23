import { http, HttpResponse } from "msw";
import {
  NFT_NETWORK_LABELS,
  type NftFacets,
  type NftListResponse,
  type NftNetwork,
} from "@/features/catalog/types/nft";
import { createUser, findUserByEmail } from "./data/user-store";
import { verifyPassword } from "./data/password-store";
import { accountHandlers } from "./account-handlers";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "./data/favorite-store";

import {
  findNft,
  getNft,
  listNfts,
  resetNfts,
  updateNft,
  type StoredNft,
} from "./data/nft-store";
import type { CartItem } from "@/features/cart/types/cart";
import { saveSessionCart } from "./data/cart-store";
import { getRequestCart } from "./utils/get-request-cart";
import { createAuthSession, deleteAuthSession } from "./data/auth-store";
import { getAuthSession } from "./data/auth-store";
import { settleOrder } from "./settle-order";
import { emitNftUpdated } from "./socket/realtime";
import { clearFaults } from "./data/network-faults";
import { networks } from "./data/networks";
import { coupons } from "./data/coupons";
import { reviewsFor } from "./data/reviews";
import { getRequestUser } from "./utils/get-request-user";
import { getStoredQuote, saveQuote } from "./data/quote-store";
import {
  getIdempotencyRecord,
  getOrder,
  listOrders,
  saveIdempotencyRecord,
  saveOrder,
} from "./data/order-store";
import {
  getScenario,
  isScenario,
  resetScenario,
  setScenario,
} from "./data/scenario-store";
import { add, compare, multiply, percentage, subtract, sum } from "@/lib/money";
import type {
  CouponStatus,
  CreateQuoteInput,
  Quote,
  QuoteLineItem,
} from "@/features/checkout/types/quote";
import type {
  CreateOrderInput,
  Order,
  OrderItem,
  OrderTotals,
  OrderWallet,
  Receipt,
} from "@/features/checkout/types/order";
import { findWallet } from "./data/wallet-store";

const NFT_PAGE_SIZE = 9;

const COLLECTION_ORDER = [
  "Arte digital",
  "Fotografia",
  "Música",
  "Arte 3D",
  "Colecionáveis",
  "Generativa",
  "Jogos",
  "Assinaturas",
  "Utilidade",
];

const NETWORK_ORDER: NftNetwork[] = ["ethereum", "polygon", "solana"];

const DECIMAL = /^\d+(\.\d+)?$/;

function collectionRank(name: string): number {
  const index = COLLECTION_ORDER.indexOf(name);

  return index === -1 ? COLLECTION_ORDER.length : index;
}

function buildFacets(all: StoredNft[]): NftFacets {
  const collectionNames = [...new Set(all.map((nft) => nft.collection))].sort(
    (a, b) => collectionRank(a) - collectionRank(b) || a.localeCompare(b),
  );

  const collections = collectionNames.map((name) => ({
    value: name,
    label: name,
    count: all.filter((nft) => nft.collection === name).length,
  }));

  const networks = NETWORK_ORDER.map((id) => ({
    value: id,
    label: NFT_NETWORK_LABELS[id],
    count: all.filter((nft) => nft.network === id).length,
  })).filter((option) => option.count > 0);

  const prices = all.map((nft) => nft.price);
  const first = prices[0] ?? "0";
  const min = prices.reduce((acc, price) => (compare(price, acc) < 0 ? price : acc), first);
  const max = prices.reduce((acc, price) => (compare(price, acc) > 0 ? price : acc), first);

  return { collections, networks, price: { min, max } };
}

export const handlers = [
  http.get("/api/nfts/featured", () => {
    const featured = listNfts().find((nft) => nft.featured);

    if (!featured) {
      return HttpResponse.json(
        { message: "Nenhum NFT em destaque" },
        { status: 404 },
      );
    }

    return HttpResponse.json(featured);
  }),
  http.get("/api/nfts", ({ request }) => {
    const query = new URL(request.url).searchParams;

    const search = query.get("search")?.trim().toLowerCase();
    const collection = query.get("collection");
    const network = query.get("network");
    const rawMin = query.get("minPrice");
    const rawMax = query.get("maxPrice");
    const tab = query.get("tab");
    const sort = query.get("sort") ?? "recent";
    const pageParam = Number(query.get("page") ?? 1);

    const requestedPage =
      Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

    const validMin = rawMin && DECIMAL.test(rawMin) ? rawMin : null;
    const validMax = rawMax && DECIMAL.test(rawMax) ? rawMax : null;
    const inverted =
      validMin !== null && validMax !== null && compare(validMin, validMax) > 0;

    const minPrice = inverted ? validMax : validMin;
    const maxPrice = inverted ? validMin : validMax;

    const all = listNfts();
    let filtered = all;

    if (search) {
      filtered = filtered.filter(
        (nft) =>
          nft.name.toLowerCase().includes(search) ||
          nft.collection.toLowerCase().includes(search),
      );
    }

    if (collection) {
      filtered = filtered.filter((nft) => nft.collection === collection);
    }

    if (network) {
      filtered = filtered.filter((nft) => nft.network === network);
    }

    if (minPrice !== null) {
      filtered = filtered.filter((nft) => compare(nft.price, minPrice) >= 0);
    }

    if (maxPrice !== null) {
      filtered = filtered.filter((nft) => compare(nft.price, maxPrice) <= 0);
    }

    if (tab === "new" || tab === "trending") {
      filtered = filtered.filter((nft) => nft.tags?.includes(tab));
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "price_asc") {
        return compare(a.price, b.price) || a.id.localeCompare(b.id);
      }

      if (sort === "price_desc") {
        return compare(b.price, a.price) || a.id.localeCompare(b.id);
      }

      return b.listedAt.localeCompare(a.listedAt) || a.id.localeCompare(b.id);
    });

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / NFT_PAGE_SIZE));
    const page = Math.min(requestedPage, totalPages);
    const startIndex = (page - 1) * NFT_PAGE_SIZE;

    const response: NftListResponse = {
      items: sorted.slice(startIndex, startIndex + NFT_PAGE_SIZE),
      page,
      pageSize: NFT_PAGE_SIZE,
      total,
      totalPages,
      facets: buildFacets(all),
    };

    return HttpResponse.json(response);
  }),
  http.get("/api/nfts/:id", ({ params }) => {
    const { id } = params;

    const nft = getNft(String(id));

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT não encontrado" },
        { status: 404 },
      );
    }

    return HttpResponse.json(nft);
  }),
  http.get("/api/nfts/:id/reviews", ({ params }) => {
    const nft = getNft(String(params.id));

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT não encontrado" },
        { status: 404 },
      );
    }

    return HttpResponse.json(reviewsFor(nft.id));
  }),
  http.get("/api/cart", ({ request }) => {
    const result = getRequestCart(request);

    if (!result.ok) {
      return result.response;
    }

    return HttpResponse.json(result.cart);
  }),
  http.post("/api/cart/items", async ({ request }) => {
    const result = getRequestCart(request);

    if (!result.ok) {
      return result.response;
    }

    const { sessionId, cart } = result;

    const body = (await request.json()) as Partial<CartItem>;

    const { nftId, edition, quantity } = body;

    if (
      typeof nftId !== "string" ||
      typeof edition !== "string" ||
      !Number.isSafeInteger(quantity) ||
      (quantity ?? 0) <= 0
    ) {
      return HttpResponse.json(
        { message: "Dados do item inválidos" },
        { status: 400 },
      );
    }

    const nft = findNft(nftId, edition);

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT ou edição não encontrada" },
        { status: 404 },
      );
    }

    const existingItem = cart.items.find(
      (item) => item.nftId === nftId && item.edition === edition,
    );

    const requestedQuantity = (existingItem?.quantity ?? 0) + quantity!;

    if (requestedQuantity > nft.available) {
      return HttpResponse.json(
        { message: "Quantidade indisponível em estoque" },
        { status: 409 },
      );
    }

    if (existingItem) {
      existingItem.quantity = requestedQuantity;
    } else {
      cart.items.push({
        nftId,
        edition,
        quantity: quantity!,
      });
    }
    saveSessionCart(sessionId, cart);
    return HttpResponse.json(cart, { status: 200 });
  }),
  http.patch("/api/cart/items/:nftId", async ({ params, request }) => {
    const result = getRequestCart(request);

    if (!result.ok) {
      return result.response;
    }

    const { sessionId, cart } = result;
    const { nftId } = params;
    const body = (await request.json()) as {
      edition?: string;
      quantity?: number;
    };

    const { edition, quantity } = body;

    if (
      typeof edition !== "string" ||
      !Number.isSafeInteger(quantity) ||
      quantity === undefined ||
      quantity < 1
    ) {
      return HttpResponse.json(
        { message: "Quantidade ou edição inválida" },
        { status: 400 },
      );
    }

    const nft = findNft(String(nftId), edition);

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT ou edição não encontrada" },
        { status: 404 },
      );
    }

    const cartItem = cart.items.find(
      (item) => item.nftId === nftId && item.edition === edition,
    );

    if (!cartItem) {
      return HttpResponse.json(
        { message: "Item não encontrado no carrinho" },
        { status: 404 },
      );
    }

    if (quantity > nft.available) {
      return HttpResponse.json(
        { message: "Quantidade indisponível em estoque" },
        { status: 409 },
      );
    }

    cartItem.quantity = quantity;
    saveSessionCart(sessionId, cart);
    return HttpResponse.json(cart);
  }),
  http.delete("/api/cart/items/:nftId", ({ params, request }) => {
    const result = getRequestCart(request);

    if (!result.ok) {
      return result.response;
    }

    const { sessionId, cart } = result;
    const { nftId } = params;
    const edition = new URL(request.url).searchParams.get("edition");

    if (!edition) {
      return HttpResponse.json(
        { message: "Edição obrigatória" },
        { status: 400 },
      );
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.nftId === nftId && item.edition === edition,
    );

    if (itemIndex === -1) {
      return HttpResponse.json(
        { message: "Item não encontrado no carrinho" },
        { status: 404 },
      );
    }

    cart.items.splice(itemIndex, 1);
    saveSessionCart(sessionId, cart);
    return HttpResponse.json(cart);
  }),
  http.post("/api/auth/login", async ({ request }) => {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("email" in body) ||
      !("password" in body) ||
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    ) {
      return HttpResponse.json(
        { message: "E-mail e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const email = body.email.trim();
    const password = body.password;

    if (!email || !password) {
      return HttpResponse.json(
        { message: "E-mail e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const account = findUserByEmail(email);

    if (!account || !(await verifyPassword(account, password))) {
      return HttpResponse.json(
        { message: "Credenciais inválidas" },
        { status: 401 },
      );
    }

    if (!account) {
      return HttpResponse.json(
        { message: "Credenciais inválidas" },
        { status: 401 },
      );
    }

    const session = createAuthSession(account.user);

    return HttpResponse.json(session, { status: 200 });
  }),
  http.get("/api/auth/me", ({ request }) => {
    const authorization = request.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return HttpResponse.json(
        { message: "Token de autenticação ausente" },
        { status: 401 },
      );
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      return HttpResponse.json(
        { message: "Token de autenticação inválido" },
        { status: 401 },
      );
    }

    const session = getAuthSession(token);

    if (!session) {
      return HttpResponse.json(
        { message: "Sessão inválida ou expirada" },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      user: session.user,
      expiresAt: session.expiresAt,
    });
  }),
  http.post("/api/auth/logout", ({ request }) => {
    const authorization = request.headers.get("Authorization");
    const token = authorization?.replace(/^Bearer\s+/, "").trim();

    if (!token || !getAuthSession(token)) {
      return HttpResponse.json({ message: "Sessão inválida" }, { status: 401 });
    }

    deleteAuthSession(token);

    return HttpResponse.json({ success: true });
  }),
  http.get("/api/networks", () => {
    return HttpResponse.json(
      networks.map((network) => ({
        id: network.id,
        label: network.label,
        fee: network.fee,
        addressFormat: network.addressFormat,
      })),
    );
  }),
  http.post("/api/quote", async ({ request }) => {
    const cartResult = getRequestCart(request);

    if (!cartResult.ok) {
      return cartResult.response;
    }

    const body = (await request
      .json()
      .catch(() => null)) as CreateQuoteInput | null;

    const network = networks.find((item) => item.id === body?.networkId);

    if (!network) {
      return HttpResponse.json({ message: "Rede inválida" }, { status: 400 });
    }

    const couponCode = body?.couponCode?.trim() || null;
    const { sessionId, cart } = cartResult;

    if (cart.items.length === 0) {
      return HttpResponse.json({ message: "Carrinho vazio" }, { status: 400 });
    }

    const items: QuoteLineItem[] = [];

    for (const cartItem of cart.items) {
      const nft = findNft(cartItem.nftId, cartItem.edition);

      if (!nft) {
        return HttpResponse.json(
          { message: "Item do carrinho não encontrado" },
          { status: 409 },
        );
      }

      items.push({
        nftId: nft.id,
        edition: nft.edition,
        name: nft.name,
        tokenId: nft.tokenId,
        image: nft.image,
        unitPrice: nft.price,
        quantity: cartItem.quantity,
        lineTotal: multiply(nft.price, cartItem.quantity),
        available: nft.available,
        availabilityOk: cartItem.quantity <= nft.available,
      });
    }

    const subtotal = sum(items.map((item) => item.lineTotal));

    let couponStatus: CouponStatus = "none";
    let discount = "0";

    if (couponCode) {
      const coupon = coupons.find(
        (item) => item.code.toLowerCase() === couponCode.toLowerCase(),
      );

      if (!coupon) {
        couponStatus = "invalid";
      } else if (coupon.expired) {
        couponStatus = "expired";
      } else {
        couponStatus = "applied";
        discount = percentage(subtotal, coupon.percentOff);
      }
    }

    const total = add(subtract(subtotal, discount), network.fee);

    const quote: Quote = {
      id: crypto.randomUUID(),
      currency: "ETH",
      items,
      subtotal,
      discount,
      networkId: network.id,
      networkFee: network.fee,
      total,
      couponCode,
      couponStatus,
      hasAvailabilityIssue: items.some((item) => !item.availabilityOk),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };

    saveQuote(sessionId, quote);

    return HttpResponse.json(quote, { status: 200 });
  }),
  http.post("/api/orders", async ({ request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) {
      return auth.response;
    }

    const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();

    if (!idempotencyKey) {
      return HttpResponse.json(
        { message: "Idempotency-Key obrigatória" },
        { status: 400 },
      );
    }

    const body = (await request
      .json()
      .catch(() => null)) as CreateOrderInput | null;
    const quoteId = body?.quoteId;

    if (typeof quoteId !== "string" || quoteId.length === 0) {
      return HttpResponse.json(
        { message: "quoteId obrigatório" },
        { status: 400 },
      );
    }

    const walletId = body?.walletId;

    if (typeof walletId !== "string" || walletId.length === 0) {
      return HttpResponse.json(
        { message: "Selecione uma carteira cadastrada para pagar" },
        { status: 400 },
      );
    }

    const wallet = findWallet(auth.user.id, walletId);

    if (!wallet) {
      return HttpResponse.json(
        { message: "Carteira não encontrada" },
        { status: 404 },
      );
    }

    const requestHash = `${quoteId}:${walletId}`;
    const existing = getIdempotencyRecord(auth.user.id, idempotencyKey);

    if (existing) {
      if (existing.requestHash !== requestHash) {
        return HttpResponse.json(
          { message: "Idempotency-Key já utilizada com outro conteúdo" },
          { status: 409 },
        );
      }

      const existingOrder = getOrder(auth.user.id, existing.orderId);

      if (existingOrder) {
        return HttpResponse.json(existingOrder, { status: 200 });
      }
    }

    const stored = getStoredQuote(quoteId);

    if (!stored || stored.userId !== `user:${auth.user.id}`) {
      return HttpResponse.json(
        { message: "Cotação não encontrada" },
        { status: 404 },
      );
    }

    if (new Date(stored.quote.expiresAt).getTime() <= Date.now()) {
      return HttpResponse.json(
        { message: "Cotação expirada, refaça a cotação" },
        { status: 409 },
      );
    }

    if (wallet.networkId !== stored.quote.networkId) {
      return HttpResponse.json(
        {
          message:
            "A carteira selecionada não é compatível com a rede da cotação",
        },
        { status: 409 },
      );
    }

    const scenario = getScenario();

    if (scenario === "price_changed" || scenario === "stock_changed") {
      for (const line of stored.quote.items) {
        const nft = findNft(line.nftId, line.edition);

        if (!nft) {
          continue;
        }

        const patch =
          scenario === "price_changed"
            ? { price: add(line.unitPrice, "0.1"), version: nft.version + 1 }
            : {
                available: Math.max(0, line.quantity - 1),
                version: nft.version + 1,
              };

        const updated = updateNft(line.nftId, patch);

        if (updated) {
          emitNftUpdated({
            id: updated.id,
            version: updated.version,
            price: updated.price,
            available: updated.available,
          });
        }
      }
    }

    for (const line of stored.quote.items) {
      const nft = findNft(line.nftId, line.edition);

      if (!nft) {
        return HttpResponse.json(
          { message: "Item indisponível" },
          { status: 409 },
        );
      }

      if (nft.price !== line.unitPrice) {
        return HttpResponse.json(
          { message: "Preço alterado, refaça a cotação" },
          { status: 409 },
        );
      }

      if (line.quantity > nft.available) {
        return HttpResponse.json(
          { message: "Estoque insuficiente" },
          { status: 409 },
        );
      }
    }

    const now = new Date().toISOString();

    const orderWallet: OrderWallet = {
      id: wallet.id,
      kind: wallet.kind,
      nickname: wallet.walletNickname,
      address: wallet.address,
      networkId: wallet.networkId,
      walletType: wallet.walletType,
    };

    const orderItems: OrderItem[] = stored.quote.items.map((line) => ({
      nftId: line.nftId,
      edition: line.edition,
      name: line.name,
      image: line.image,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      lineTotal: line.lineTotal,
    }));

    const totals: OrderTotals = {
      subtotal: stored.quote.subtotal,
      discount: stored.quote.discount,
      networkFee: stored.quote.networkFee,
      total: stored.quote.total,
      currency: "ETH",
    };

    const order: Order = {
      id: crypto.randomUUID(),
      status: "pending",
      version: 1,
      items: orderItems,
      totals,
      networkId: stored.quote.networkId,
      wallet: orderWallet,
      couponCode:
        stored.quote.couponStatus === "applied"
          ? stored.quote.couponCode
          : null,
      createdAt: now,
      confirmedAt: null,
      transactionHash: null,
      explorerUrl: null,
      refusalReason: null,
    };

    saveOrder(auth.user.id, order);
    saveIdempotencyRecord(auth.user.id, idempotencyKey, {
      orderId: order.id,
      requestHash,
    });

    const userId = auth.user.id;
    const orderId = order.id;

    setTimeout(() => {
      settleOrder(userId, orderId);
    }, 400);

    if (scenario === "timeout") {
      return HttpResponse.json(
        { message: "Tempo limite da transação excedido", orderId: order.id },
        { status: 504 },
      );
    }

    return HttpResponse.json(order, { status: 201 });
  }),
  http.get("/api/orders", ({ request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) {
      return auth.response;
    }

    return HttpResponse.json(listOrders(auth.user.id));
  }),
  http.get("/api/orders/:id", ({ params, request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) {
      return auth.response;
    }

    const order = getOrder(auth.user.id, String(params.id));

    if (!order) {
      return HttpResponse.json(
        { message: "Pedido não encontrado" },
        { status: 404 },
      );
    }

    return HttpResponse.json(order);
  }),
  http.get("/api/orders/:id/receipt", ({ params, request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) {
      return auth.response;
    }

    const order = getOrder(auth.user.id, String(params.id));

    if (!order) {
      return HttpResponse.json(
        { message: "Recibo não encontrado" },
        { status: 404 },
      );
    }

    const receipt: Receipt = {
      orderId: order.id,
      status: order.status,
      items: order.items,
      totals: order.totals,
      networkId: order.networkId,
      wallet: order.wallet,
      transactionHash: order.transactionHash,
      explorerUrl: order.explorerUrl,
      confirmedAt: order.confirmedAt,
    };

    return HttpResponse.json(receipt);
  }),
  http.post("/api/test/reset", () => {
    clearFaults();
    localStorage.removeItem("marketplace-carts");
    localStorage.removeItem("marketplace-orders");
    localStorage.removeItem("marketplace-quotes");
    localStorage.removeItem("marketplace-wallets");
    localStorage.removeItem("marketplace-profiles");
    resetNfts();
    resetScenario();

    return HttpResponse.json({ ok: true, scenario: getScenario() });
  }),
  http.get("/api/test/scenario", () => {
    return HttpResponse.json({ scenario: getScenario() });
  }),
  http.post("/api/test/scenario", async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      scenario?: unknown;
    } | null;

    if (!isScenario(body?.scenario)) {
      return HttpResponse.json(
        { message: "Cenário inválido" },
        { status: 400 },
      );
    }

    setScenario(body.scenario);

    return HttpResponse.json({ ok: true, scenario: body.scenario });
  }),
  http.post("/api/test/nft-updated", async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      id?: string;
      version?: number;
      price?: string;
      available?: number;
    } | null;

    if (
      typeof body?.id !== "string" ||
      typeof body.version !== "number" ||
      !Number.isInteger(body.version)
    ) {
      return HttpResponse.json(
        { message: "Payload inválido" },
        { status: 400 },
      );
    }

    const current = getNft(body.id);

    if (!current) {
      return HttpResponse.json(
        { message: "NFT não encontrado" },
        { status: 404 },
      );
    }

    const price = body.price ?? current.price;
    const available = body.available ?? current.available;

    if (body.version > current.version) {
      updateNft(body.id, { price, available, version: body.version });
    }

    emitNftUpdated({ id: body.id, version: body.version, price, available });

    return HttpResponse.json({ ok: true });
  }),
  http.post("/api/auth/signup", async ({ request }) => {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("name" in body) ||
      !("email" in body) ||
      !("password" in body) ||
      typeof body.name !== "string" ||
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    ) {
      return HttpResponse.json(
        { message: "Nome, e-mail e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const name = body.name.trim();
    const email = body.email.trim().toLowerCase();
    const password = body.password;

    if (name.length < 2) {
      return HttpResponse.json(
        { message: "O nome deve ter pelo menos 2 caracteres" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return HttpResponse.json(
        { message: "Informe um e-mail válido" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return HttpResponse.json(
        { message: "A senha deve ter pelo menos 8 caracteres" },
        { status: 400 },
      );
    }

    try {
      const account = createUser(name, email, password);

      return HttpResponse.json(account.user, {
        status: 201,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Este e-mail já está cadastrado"
      ) {
        return HttpResponse.json({ message: error.message }, { status: 409 });
      }

      return HttpResponse.json(
        { message: "Não foi possível realizar o cadastro" },
        { status: 500 },
      );
    }
  }),
  http.get("/api/favorites", ({ request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) return auth.response;

    const favorites = getFavorites(auth.user.id);

    return HttpResponse.json({ nftIds: favorites });
  }),

  http.post("/api/favorites", async ({ request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) return auth.response;

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("nftId" in body) ||
      typeof body.nftId !== "string" ||
      !body.nftId.trim()
    ) {
      return HttpResponse.json({ message: "NFT inválido" }, { status: 400 });
    }

    const nftId = body.nftId;

    const nft = getNft(nftId);

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT não encontrado" },
        { status: 404 },
      );
    }

    const favorites = addFavorite(auth.user.id, nftId);

    return HttpResponse.json({ nftIds: favorites }, { status: 200 });
  }),

  http.delete("/api/favorites/:nftId", ({ request, params }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) return auth.response;

    const nftId = params.nftId;

    if (typeof nftId !== "string") {
      return HttpResponse.json({ message: "NFT inválido" }, { status: 400 });
    }

    const favorites = removeFavorite(auth.user.id, nftId);

    return HttpResponse.json({ nftIds: favorites });
  }),
  ...accountHandlers,
];
