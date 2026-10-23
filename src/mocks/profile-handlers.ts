import { http, HttpResponse } from "msw";

import type {
  ChangePasswordInput,
  CollectorProfile,
  UpdateProfileInput,
} from "@/features/profile/types/profile";
import { ENS_DOMAINS } from "@/features/profile/types/profile";
import type { WalletInput } from "@/features/profile/types/wallet";
import { validateProfileForm } from "@/features/profile/lib/profile-form";
import { validatePasswordForm } from "@/features/profile/lib/password-form";
import { validateWalletForm } from "@/features/profile/lib/wallet-form";
import { MIN_PASSWORD_LENGTH } from "@/features/profile/lib/validation";

import { getRequestUser } from "./utils/get-request-user";
import {
  findProfileByUsername,
  getProfile,
  saveProfile,
} from "./data/profile-store";
import {
  createWallet,
  findWallet,
  listWallets,
  removeWallet,
  updateWallet,
} from "./data/wallet-store";
import { findUserByEmail, clearRegisteredPassword } from "./data/user-store";
import { setUserPassword, verifyPassword } from "./data/password-store";
import { networks } from "./data/networks";
import { WALLET_PROVIDERS } from "@/features/checkout/types/wallet";

const AVATAR_DATA_URL = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
const AVATAR_MAX_CHARS = 700_000;

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function invalid(errors: Record<string, string>): Response {
  return HttpResponse.json(
    { message: "Revise os campos destacados.", errors },
    { status: 422 },
  );
}

function badRequest(message: string): Response {
  return HttpResponse.json({ message }, { status: 400 });
}

function asObject(body: unknown): Record<string, unknown> | null {
  return typeof body === "object" && body !== null && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : null;
}

function readProfileInput(body: Record<string, unknown>): UpdateProfileInput {
  const avatar = body.avatar;

  return {
    displayName: text(body.displayName).trim(),
    username: text(body.username).trim(),
    email: text(body.email).trim().toLowerCase(),
    ensName: text(body.ensName).trim().toLowerCase(),
    ensDomain: ENS_DOMAINS.includes(text(body.ensDomain) as ".eth")
      ? text(body.ensDomain)
      : ".eth",
    walletNickname: text(body.walletNickname).trim(),
    avatar: typeof avatar === "string" && avatar.length > 0 ? avatar : null,
  };
}

function readWalletInput(body: Record<string, unknown>): WalletInput {
  return {
    kind: body.kind === "secondary" ? "secondary" : "primary",
    displayName: text(body.displayName).trim(),
    walletNickname: text(body.walletNickname).trim(),
    networkId: text(body.networkId),
    profileName: text(body.profileName).trim(),
    address: text(body.address).trim(),
    secondaryAddress: text(body.secondaryAddress).trim(),
    walletType: text(body.walletType),
    referralCode: text(body.referralCode).trim(),
    email: text(body.email).trim().toLowerCase(),
    ensName: text(body.ensName).trim().toLowerCase(),
    ensDomain: ENS_DOMAINS.includes(text(body.ensDomain) as ".eth")
      ? text(body.ensDomain)
      : ".eth",
  };
}

export const profileHandlers = [
  http.get("/api/profile", ({ request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) return auth.response;

    return HttpResponse.json({ profile: getProfile(auth.user) });
  }),

  http.put("/api/profile", async ({ request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) return auth.response;

    const body = asObject(await request.json());

    if (!body) return badRequest("Corpo da requisição inválido");

    const input = readProfileInput(body);
    const errors = validateProfileForm(input);

    if (input.avatar !== null) {
      if (!AVATAR_DATA_URL.test(input.avatar)) {
        errors.avatar = "Use uma imagem PNG, JPEG ou WebP.";
      } else if (input.avatar.length > AVATAR_MAX_CHARS) {
        errors.avatar = "A imagem deve ter no máximo 512 KB.";
      }
    }

    if (Object.keys(errors).length > 0) {
      return invalid(errors as Record<string, string>);
    }

    const emailOwner = findUserByEmail(input.email);

    if (emailOwner && emailOwner.user.id !== auth.user.id) {
      return HttpResponse.json(
        {
          message: "Este e-mail já está cadastrado.",
          errors: { email: "Este e-mail já está cadastrado." },
        },
        { status: 409 },
      );
    }

    const usernameOwner = findProfileByUsername(input.username);

    if (usernameOwner && usernameOwner.userId !== auth.user.id) {
      return HttpResponse.json(
        {
          message: "Este nome de usuário já está em uso.",
          errors: { username: "Este nome de usuário já está em uso." },
        },
        { status: 409 },
      );
    }

    const profile: CollectorProfile = {
      ...input,
      userId: auth.user.id,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ profile: saveProfile(profile) });
  }),

  http.post("/api/profile/password", async ({ request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) return auth.response;

    const body = asObject(await request.json());

    if (!body) return badRequest("Corpo da requisição inválido");

    const input: ChangePasswordInput = {
      currentPassword: text(body.currentPassword),
      newPassword: text(body.newPassword),
      confirmPassword: text(body.confirmPassword),
    };

    const errors = validatePasswordForm(input);

    if (Object.keys(errors).length > 0) {
      return invalid(errors as Record<string, string>);
    }

    const account = findUserByEmail(auth.user.email);

    if (!account) {
      return HttpResponse.json(
        { message: "Conta não encontrada." },
        { status: 404 },
      );
    }

    if (!(await verifyPassword(account, input.currentPassword))) {
      return HttpResponse.json(
        {
          message: "A senha atual está incorreta.",
          errors: { currentPassword: "A senha atual está incorreta." },
        },
        { status: 422 },
      );
    }

    if (input.newPassword.length < MIN_PASSWORD_LENGTH) {
      return invalid({
        newPassword: `A nova senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      });
    }

    await setUserPassword(auth.user.id, input.newPassword);
    clearRegisteredPassword(auth.user.id);

    return HttpResponse.json({ changedAt: new Date().toISOString() });
  }),

  http.get("/api/wallets", ({ request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) return auth.response;

    return HttpResponse.json({ wallets: listWallets(auth.user.id) });
  }),

  http.post("/api/wallets", async ({ request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) return auth.response;

    const body = asObject(await request.json());

    if (!body) return badRequest("Corpo da requisição inválido");

    const input = readWalletInput(body);
    const errors = validateWalletForm(input);

    if (!networks.some((network) => network.id === input.networkId)) {
      errors.networkId = "Selecione uma rede disponível.";
    }

    if (!WALLET_PROVIDERS.some((wallet) => wallet.id === input.walletType)) {
      errors.walletType = "Selecione um tipo de carteira disponível.";
    }

    if (Object.keys(errors).length > 0) {
      return invalid(errors as Record<string, string>);
    }

    const existing = listWallets(auth.user.id);

    if (existing.some((wallet) => wallet.kind === input.kind)) {
      return HttpResponse.json(
        {
          message:
            input.kind === "primary"
              ? "Você já possui uma carteira principal."
              : "Você já possui uma carteira secundária.",
        },
        { status: 409 },
      );
    }

    if (
      existing.some(
        (wallet) =>
          wallet.address.toLowerCase() === input.address.toLowerCase(),
      )
    ) {
      return HttpResponse.json(
        {
          message: "Este endereço já está cadastrado.",
          errors: { address: "Este endereço já está cadastrado." },
        },
        { status: 409 },
      );
    }

    return HttpResponse.json(
      { wallet: createWallet(auth.user.id, input) },
      { status: 201 },
    );
  }),

  http.put("/api/wallets/:id", async ({ request, params }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) return auth.response;

    const walletId = typeof params.id === "string" ? params.id : "";

    if (!findWallet(auth.user.id, walletId)) {
      return HttpResponse.json(
        { message: "Carteira não encontrada." },
        { status: 404 },
      );
    }

    const body = asObject(await request.json());

    if (!body) return badRequest("Corpo da requisição inválido");

    const input = readWalletInput(body);
    const errors = validateWalletForm(input);

    if (!networks.some((network) => network.id === input.networkId)) {
      errors.networkId = "Selecione uma rede disponível.";
    }

    if (!WALLET_PROVIDERS.some((wallet) => wallet.id === input.walletType)) {
      errors.walletType = "Selecione um tipo de carteira disponível.";
    }

    if (Object.keys(errors).length > 0) {
      return invalid(errors as Record<string, string>);
    }

    const duplicated = listWallets(auth.user.id).find(
      (wallet) =>
        wallet.id !== walletId &&
        wallet.address.toLowerCase() === input.address.toLowerCase(),
    );

    if (duplicated) {
      return HttpResponse.json(
        {
          message: "Este endereço já está cadastrado.",
          errors: { address: "Este endereço já está cadastrado." },
        },
        { status: 409 },
      );
    }

    const wallet = updateWallet(auth.user.id, walletId, input);

    if (!wallet) {
      return HttpResponse.json(
        { message: "Carteira não encontrada." },
        { status: 404 },
      );
    }

    return HttpResponse.json({ wallet });
  }),

  http.delete("/api/wallets/:id", ({ request, params }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) return auth.response;

    const walletId = typeof params.id === "string" ? params.id : "";

    if (!removeWallet(auth.user.id, walletId)) {
      return HttpResponse.json(
        { message: "Carteira não encontrada." },
        { status: 404 },
      );
    }

    return HttpResponse.json({ wallets: listWallets(auth.user.id) });
  }),
];
