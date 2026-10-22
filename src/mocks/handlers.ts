import { http, HttpResponse } from "msw";
import type { NftListResponse } from "@/features/catalog/types/nft";
import { nfts } from "./data/nfts";
import type { CartItem } from "@/features/cart/types/cart";
import { saveSessionCart } from "./data/cart-store";
import { getRequestCart } from "./utils/get-request-cart";
import { users } from "./data/users";
import { createAuthSession, deleteAuthSession } from "./data/auth-store";
import { getAuthSession } from "./data/auth-store";

export const handlers = [
  http.get("/api/nfts", ({ request }) => {
    const url = new URL(request.url);

    const search = url.searchParams.get("search")?.toLowerCase();
    const sort = url.searchParams.get("sort");
    const pageParam = Number(url.searchParams.get("page") ?? 1);

    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

    const pageSize = 10;

    let filteredNfts = [...nfts];

    if (search) {
      filteredNfts = filteredNfts.filter((nft) =>
        nft.name.toLowerCase().includes(search),
      );
    }

    if (sort === "price_asc") {
      filteredNfts.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sort === "price_desc") {
      filteredNfts.sort((a, b) => Number(b.price) - Number(a.price));
    }

    const total = filteredNfts.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;

    const response: NftListResponse = {
      items: filteredNfts.slice(start, start + pageSize),
      page,
      total,
      totalPages,
    };

    return HttpResponse.json(response);
  }),
  http.get("/api/nfts/:id", ({ params }) => {
    const { id } = params;

    const nft = nfts.find((item) => item.id === id);

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT não encontrado" },
        { status: 404 },
      );
    }

    return HttpResponse.json(nft);
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

    const nft = nfts.find((item) => item.id === nftId);

    if (!nft || nft.edition !== edition) {
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

    const nft = nfts.find((item) => item.id === nftId);

    if (!nft || nft.edition !== edition) {
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

    const account = users.find(
      (account) =>
        account.user.email.toLowerCase() === email.toLowerCase() &&
        account.password === password,
    );

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
];
