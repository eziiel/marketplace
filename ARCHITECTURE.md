# Arquitetura — Kurio NFT Marketplace

Este documento registra as decisões técnicas do projeto. O objetivo do desafio é
demonstrar um fluxo de e-commerce de NFTs (catálogo → carrinho → checkout →
pedido → tempo real) **sem um backend real**, mantendo o código organizado,
testável e próximo do que seria uma integração com API de verdade.

> ⚠️ Todas as "garantias de servidor" descritas aqui (autenticação, idempotência,
> isolamento por usuário, tempo real) são **simuladas no navegador**. Elas replicam
> o _contrato_ de um backend para exercitar a UI e os testes, mas **não** são
> mecanismos de segurança de produção.

## Visão geral

```
Browser
├── React 19 (UI) ── TanStack Router (rotas) ── TanStack Query (cache)
│        │
│        └── Axios ──► /api/* ─┐
│                              │  interceptado por
│        socket.io-client ─────┤
│                              ▼
└── MSW (Mock Service Worker)
     ├── handlers HTTP  → leem/escrevem em localStorage
     └── handler WebSocket (SocketIoExtension) → emite eventos nft.updated / order.updated
```

O cliente faz chamadas HTTP normais (Axios) e abre uma conexão Socket.IO normal.
O MSW intercepta ambos no navegador e responde a partir de "stores" persistidos em
`localStorage`. Nenhuma requisição sai da máquina.

## Por que Vite (e não Next.js / CRA)

- **SPA estática é suficiente.** O produto é client-side; não há necessidade de SSR,
  rotas de servidor ou API routes — o "servidor" é o MSW no navegador.
- **DX e velocidade.** Dev server com HMR quase instantâneo e build de produção rápido.
- **Deploy trivial na Vercel** como site estático, com `vercel.json` reescrevendo
  todas as rotas para `index.html` (necessário para o roteamento client-side).
- **MSW em dev e em produção.** Por ser estático, o mesmo bundle com MSW roda local
  e na Vercel, mantendo a demo funcional sem infraestrutura.
- CRA está descontinuado; Next.js traria SSR/infra que não agregam a um mock front-end.

## Organização do código

Estrutura **por feature** (`src/features/<feature>`), cada uma com suas camadas:

```
src/
├── app/            # router (TanStack Router) e árvore de rotas
├── components/     # UI compartilhada (layout, botões, inputs)
├── lib/            # axios, query-client, money, session, utils
├── features/
│   ├── auth/       # login, signup, logout, token
│   ├── catalog/    # listagem, detalhe, busca/ordenação/paginação
│   ├── cart/       # carrinho por sessão
│   ├── checkout/   # redes, cotação, pedido, recibo, confirmação
│   ├── favorites/  # favoritos por usuário
│   └── realtime/   # cliente Socket.IO + hook de sincronização
└── mocks/          # MSW: handlers, stores (localStorage) e socket simulado
    ├── handlers.ts
    ├── data/       # stores: auth, cart, nfts, orders, quotes, favorites, users...
    └── socket/     # extensão Socket.IO sobre o WebSocket do MSW
```

Cada feature segue o padrão `api/` (funções Axios) → `hooks/` (TanStack Query) →
`pages/`/`components/` (UI), o que mantém a troca por um backend real praticamente
restrita à camada `api/`.

## Autenticação simulada

- No **login** (`POST /api/auth/login`), o mock valida e-mail/senha contra a lista de
  usuários e cria uma sessão (`auth-store`), devolvendo um `token`.
- O cliente guarda o token em `localStorage` (`marketplace-auth-token`) e o envia como
  `Authorization: Bearer <token>` nas requisições (interceptor do Axios).
- Rotas protegidas (`/checkout`, `/orders/:id`) usam `beforeLoad` do TanStack Router
  para exigir token; sem token, redireciona para `/login`.
- No **logout**, o token é removido, o cache do React Query é limpo e a app recarrega.

**Por que assim:** replica o contrato "Bearer token + 401" para exercitar
guardas de rota, estados autenticados e isolamento — sem precisar de servidor.

**Limite explícito:** o token é apenas um identificador validado no cliente. Não há
hashing de senha, assinatura, expiração imposta pelo servidor nem proteção contra
adulteração. **Não é autenticação segura.**

## Persistência por usuário

Os dados vivem em `localStorage`, segmentados por identidade para garantir
isolamento entre contas:

- **Carrinho:** chaveado por sessão/usuário (`user:<id>`) no `cart-store`.
- **Pedidos e idempotência:** chaveados por `userId` no `order-store`; buscar o pedido
  de outro usuário resulta em 404 (verificado em `e2e/scenarios.spec.ts`).
- **Favoritos:** `favorite-store` mantém um mapa `Record<userId, nftId[]>`.
- **NFTs/estoque:** `nft-store` guarda o catálogo com `version` para o tempo real.

Toda leitura/escrita passa por funções puras nos "stores", o que centraliza a lógica
e facilita o reset (`POST /api/test/reset`) e os testes.

## Favoritos

- Endpoints: `GET/POST /api/favorites` e `DELETE /api/favorites/:nftId`, **todos exigem
  autenticação** (401 sem token) — ver `getRequestUser` e `e2e/favorites.spec.ts`.
- No cliente, `useFavorites` só é habilitado quando há token; a chave de query inclui o
  token para que a troca de usuário invalide automaticamente a lista.
- As mutações (`useAddFavorite`/`useRemoveFavorite`) invalidam `["favorites"]` após o
  sucesso, mantendo UI e servidor em sincronia.
- O coração aparece no catálogo: para **visitantes**, clicar redireciona ao login;
  autenticado, alterna o favorito (refletido em `aria-pressed`).

## Idempotência no checkout

Fluxo em duas etapas, espelhando um gateway real:

1. **Cotação** (`POST /api/quote`): calcula subtotal, desconto (cupom), taxa de rede e
   total, e **congela os preços** num `quote` com `expiresAt`.
2. **Pedido** (`POST /api/orders`): exige header `Idempotency-Key` e um `quoteId`.

Regras de idempotência (por usuário):

- Mesma `Idempotency-Key` + mesmo conteúdo → **reusa** o pedido já criado (200), sem
  duplicar.
- Mesma `Idempotency-Key` + conteúdo diferente → **409 Conflict**.
- Antes de confirmar, o mock revalida preço e estoque contra o `nft-store`; divergências
  retornam 409 (`price_changed` / `stock_changed`), preservando o carrinho.
- Cotação expirada → 409.

Isso cobre o caso clássico de retry de rede (ex.: cenário `timeout`, em que a primeira
resposta é 504 mas o pedido já foi registrado, e o retry não duplica). Verificado em
`e2e/checkout.spec.ts` e `e2e/scenarios.spec.ts`.

### Valores monetários

Preços são `string` e toda a aritmética (soma, multiplicação, desconto) é feita em
**inteiros de 18 casas (wei) com `BigInt`** (`src/lib/money.ts`), evitando erros de
ponto flutuante — importante num contexto de pagamentos.

## Tempo real (Socket.IO simulado)

- O cliente usa **socket.io-client** de verdade e um hook `useRealtime` que escuta
  `nft.updated` e `order.updated`.
- O "servidor" é simulado: o MSW intercepta o WebSocket (`msw/ws`) e uma
  `SocketIoExtension` implementa o enquadramento do protocolo Socket.IO. A camada de
  mocks emite eventos via `emitNftUpdated` / `emitOrderUpdated`.
- **Quem dispara os eventos:** a liquidação assíncrona do pedido (`settle-order.ts`,
  após ~400ms) muda o status para `confirmed`/`refused` e decrementa estoque, emitindo
  os eventos correspondentes; alterações de preço/estoque também emitem `nft.updated`.
- **Consistência (last-write-wins por versão):** cada payload traz `version`; o cliente
  ignora eventos com versão menor ou igual à última vista (`applyIfNewer`), evitando
  regressões por ordem de chegada. Atualiza o cache do React Query diretamente
  (`setQueryData` para o NFT) e invalida listas/pedido/recibo conforme necessário —
  **sem chamar setters de componentes** diretamente.

A confirmação do pedido (`pending → confirmed`) na UI é dirigida por esses eventos
(com `refetchInterval` como rede de segurança), exercitada em `e2e/realtime.spec.ts`.

## Simulação de cenários e testes

- Um `scenario-store` com endpoints `POST /api/test/scenario` e `POST /api/test/reset`
  permite alternar caminhos de erro (recusa, timeout, divergência de preço/estoque) de
  forma determinística — útil tanto para avaliação manual quanto para E2E.
- **Playwright** cobre os fluxos ponta a ponta. Os testes usam `page.evaluate` com
  `fetch` para falar com o MSW quando precisam exercitar a API diretamente (o MSW vive no
  navegador, então requisições do processo Node não seriam interceptadas).

## Principais trade-offs

| Decisão | Ganho | Custo / limite |
| ------- | ----- | -------------- |
| Backend em MSW + `localStorage` | Zero infra, demo sempre disponível, fácil reset | Não é seguro; dados presos ao navegador |
| Vite/SPA estática | Build e deploy simples na Vercel | Sem SSR/SEO avançado |
| Token no cliente | Simula fluxo de auth e guardas de rota | Não é um limite de segurança real |
| Socket.IO simulado no MSW | Tempo real realista sem servidor | Eventos não cruzam abas/dispositivos |
| Dinheiro em `BigInt`/wei | Precisão em pagamentos | Pequeno overhead de conversão string↔bigint |

## Evoluções naturais (se virasse produção)

- Trocar os mocks por um backend real mantendo o contrato das funções em `features/*/api`.
- Autenticação real (hash de senha, tokens assinados/expiráveis, refresh, HttpOnly cookies).
- Idempotência e estoque persistidos de forma transacional no servidor.
- Servidor WebSocket real (Socket.IO) para eventos multiusuário.
