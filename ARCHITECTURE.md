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
- Falhas de **transporte** ficam num eixo separado do cenário de negócio: um
  `faultInterceptor` (`http.all("/api/*")`) registrado antes dos demais handlers consulta
  um store de falhas e, quando nenhuma se aplica, devolve `undefined` para o MSW seguir
  para o handler real. Isso permite atrasar, derrubar ou corromper **um endpoint por vez**
  sem tocar nos outros. Controle em `POST/GET/DELETE /api/test/network`; detalhes e tabela
  de modos no [README](./README.md#cenários-de-rede-latência-offline-5xx-401).
- Expiração de sessão é tratada num único ponto: um interceptor de resposta do Axios
  converte qualquer 401 (fora de login/cadastro) em "sessão expirada", limpa o token,
  descarta o cache de `["auth"]` e notifica o `RootLayout`, que leva ao modal de login.
  O carrinho e o catálogo (dados públicos) permanecem no cache.

## Desvios do Figma e decisões de UX (Mercado)

As telas de detalhe do NFT, carrinho e pagamento seguem os frames `public/img/mercado*/`. Pontos em que a implementação diverge ou completa o layout:

- **Breadcrumb do detalhe** inclui o nome do NFT como item atual (o frame mostra só "Início / Mercado"), para manter o padrão das outras duas telas.
- **Galeria**: cada NFT tem `gallery` com 2 a 4 imagens da mesma série; o zoom usa `<dialog>` nativo (foco preso e Esc). O frame mostra 4 miniaturas iguais.
- **Edições**: os chips 1/1, 1/10, 1/50 e Aberta são sempre exibidos; só a edição do NFT fica selecionada e as demais aparecem como indisponíveis (`aria-disabled`), cobrindo o cenário de edição indisponível.
- **Disponibilidade**: "Disponíveis: N" aparece ao lado do seletor de quantidade (não está no frame) para explicar o limite de compra.
- **Avaliações**: `GET /api/nfts/:id/reviews` gera avaliações determinísticas por NFT no MSW; a média e a contagem no cabeçalho vêm desse endpoint.
- **Carrinho**: o resumo (subtotal, desconto, taxa estimada e total) vem de `POST /api/quote`, que passou a aceitar visitantes (carrinho por `X-Session-Id`); a taxa usa a primeira rede como estimativa. O cupom aplicado no carrinho é guardado em `sessionStorage` e reaproveitado no pagamento.
- **Pagamento**: "Rede" já vem preenchida com a primeira rede (o frame mostra placeholder) para que a cotação exista desde o início. "Código de indicação" e "Nome ENS" são opcionais, apesar do asterisco no frame, para não bloquear a compra. "Tipo de carteira" no formulário e as opções de "Carteira e rede" controlam o mesmo estado. Os dados do colecionador são validados no cliente e ainda não são enviados ao pedido.
- **Mobile**: não há frames para essas telas; o layout empilha as colunas e, no carrinho, cada linha vira dois níveis (nome/remover e preço/quantidade/total).
- **Headings globais**: as regras de `h1`, `h2`, `p` e `code` em `src/index.css` passaram para `@layer base` para que as utilities do Tailwind consigam sobrescrevê-las; antes disso, tamanhos e margens definidos nos componentes eram ignorados.

## Perfil do colecionador e carteiras

Duas rotas protegidas (`beforeLoad: requireAuth`) compartilham o mesmo shell
(`features/profile/components/profile-shell.tsx`): cabeçalho, trilha, menu lateral
"Meu perfil" e rodapé.

| Rota | Tela |
| ---- | ---- |
| `/profile` | Dados do perfil, avatar e alteração de senha |
| `/profile/wallets` | Carteira principal e secundária |

### Contratos REST

| Método | Rota | Corpo | Respostas |
| ------ | ---- | ----- | --------- |
| `GET` | `/api/profile` | — | `200 { profile }`, `401` |
| `PUT` | `/api/profile` | `displayName`, `username`, `email`, `ensName`, `ensDomain`, `walletNickname`, `avatar` | `200 { profile }`, `400 { message, errors }`, `401`, `409` (e-mail/usuário em uso) |
| `POST` | `/api/profile/password` | `currentPassword`, `newPassword`, `confirmPassword` | `200 { changedAt }`, `400 { message, errors }`, `401`, `404` |
| `GET` | `/api/wallets` | — | `200 { wallets }`, `401` |
| `POST` | `/api/wallets` | `WalletInput` | `201 { wallet }`, `400 { message, errors }`, `401`, `409` (tipo ou endereço duplicado) |
| `PUT` | `/api/wallets/:id` | `WalletInput` | `200 { wallet }`, `400`, `401`, `404`, `409` |
| `POST` | `/api/wallets/:id/primary` | — | `200 { wallets }`, `401`, `404` |
| `POST` | `/api/wallets/:id/connect` | — | `200 { walletId, status }`, `401`, `404`, `409` (recusada) |
| `POST` | `/api/wallets/:id/disconnect` | — | `200 { walletId, status }`, `401`, `404` |
| `DELETE` | `/api/wallets/:id` | — | `200 { wallets }`, `401`, `404` |

`WalletInput` = `kind` (`primary` \| `secondary`), `displayName`, `walletNickname`,
`networkId`, `profileName`, `address`, `secondaryAddress`, `walletType`,
`referralCode`, `email`, `ensName`, `ensDomain`.

Erros de validação chegam em `400` com `errors` por campo. A interface aplica cada
mensagem ao campo correspondente (`aria-describedby` + `role="alert"`) e move o foco
para o primeiro inválido, na mesma ordem usada pela validação do cliente.

### Validação em uma fonte só

Os handlers MSW importam `validateProfileForm`, `validatePasswordForm` e
`validateWalletForm` de `features/profile/lib`. Cliente e "servidor" aplicam a mesma
regra; o mock acrescenta apenas o que depende de estado global (unicidade de e-mail,
nome de usuário e endereço, existência da rede e do tipo de carteira).

### Senha: hash em vez de texto puro

Senhas alteradas pelo perfil **não** são guardadas em claro. `data/password-store.ts`
gera um salt aleatório por usuário e grava `SHA-256(salt:senha)` em
`marketplace-password-hashes`. `verifyPassword` consulta primeiro esse registro e só
cai no texto puro das fixtures quando o usuário nunca trocou a senha. Ao trocar, o
texto puro do usuário cadastrado é apagado (`clearRegisteredPassword`). As senhas das
contas de exemplo continuam em claro em `data/users.ts` por serem fixtures de demo.

### Persistência e isolamento

`marketplace-profiles` e `marketplace-wallets` são mapas `userId -> dados`, no mesmo
formato dos favoritos. As queries usam `["profile", token]` e `["wallets", token]`,
então trocar de conta troca a chave do cache e nenhum dado vaza entre usuários.
Política: `retry: false` (erro de validação e 401 não devem ser repetidos),
`staleTime` de 30s e invalidação após cada mutation. A remoção de carteira é
otimista, com rollback do snapshot anterior em caso de falha.

### Integração com o checkout

O checkout deixou de montar os dados do colecionador a partir do usuário da sessão e
passou a ler `GET /api/profile`. As carteiras cadastradas aparecem em
`SavedWalletPicker`; escolher uma preenche endereço, rede, tipo, nome do perfil e
código de indicação do formulário existente. Cotação, cupom, idempotência, conflitos
e eventos Socket.IO não foram tocados.

### Decisões e desvios do Figma

- **Um único "Salvar"**: o frame mostra um botão só, abaixo da troca de senha. O
  formulário segue isso: os campos de senha são opcionais e, quando preenchidos,
  disparam a segunda requisição depois que o perfil é salvo. Se o perfil salva e a
  senha falha, a tela diz exatamente isso.
- **Campos obrigatórios**: o asterisco segue o frame, inclusive "Código de indicação"
  e "Nome ENS" na tela de carteiras, que são opcionais no checkout.
- **ENS**: o frame mostra `[.eth ∨]` antes do campo; o seletor aceita `.eth`, `.xyz`
  e `.nft` e o nome é validado como rótulo DNS.
- **"Igual à carteira principal"**: copia os dados do titular, menos o endereço, que
  precisa ser diferente (endereço duplicado responde `409`).
- **Itens fora de escopo**: atividade, lista de interesse, ofertas, arquivos baixados
  e suporte aparecem no menu como desabilitados (`aria-disabled` + texto para leitor
  de tela), nunca como links que simulam sucesso. No mobile ficam ocultos. O rodapé
  segue a mesma regra: "Meu perfil" aponta para `/profile`, "Carteira e segurança"
  para `/profile/wallets`, as coleções filtram o catálogo, o e-mail e o telefone viram
  `mailto:`/`tel:` e o restante fica como texto desabilitado, sem rotas novas.
- **Cabeçalho**: os frames mostram o botão "Entrar" mesmo nas telas de conta; a
  aplicação mostra o estado autenticado real.
- **Avatar**: aceita PNG, JPEG ou WebP até 512 KB, convertido em data URL e guardado
  junto do perfil. Sem frame de upload no Figma.
- **Mobile**: sem frame para essas telas; o menu vira uma faixa horizontal rolável
  com a aba ativa sublinhada e o conteúdo empilha em uma coluna.
- **Marcador de obrigatório**: o asterisco usa `#f0805f` do frame, definido uma única
  vez em `components/ui/field.tsx`.

## ADR-013 — Gerenciamento de carteiras simuladas por usuário

**Contexto.** T9 e R8 exigem que o colecionador cadastre, consulte, edite, remova e
selecione carteiras simuladas, e que a compra use uma carteira cadastrada. O projeto
já tinha autenticação por token, cotação, idempotência e eventos Socket.IO que não
podiam ser comprometidos.

**Decisão.**

1. **Feature própria.** Carteiras saíram de `features/profile` para
   `features/wallets`, com `api/`, `hooks/`, `components/`, `lib/`, `pages/` e
   `types/`. O perfil continua dono do shell e do menu lateral, que as duas telas
   compartilham. Os helpers usados pelas duas features subiram para `src/lib`
   (`form-validation`, `api-error`, `session-token`, `ens`) e `src/components/ui`
   (`ens-field`). `WALLET_PROVIDERS` saiu de `features/checkout` para
   `features/wallets`, invertendo a dependência para a direção correta: o checkout
   depende de carteiras, não o contrário.

2. **Modelo.** Uma carteira é `{ id, kind, displayName, walletNickname, networkId,
   profileName, address, secondaryAddress, walletType, referralCode, email, ensName,
   ensDomain, createdAt, updatedAt }`. Os campos de titular que também existem no
   perfil não são copiados de lá: o formulário sugere os valores do perfil como
   ponto de partida, mas o que vale para a carteira é o que foi salvo nela, porque
   uma carteira secundária pode ter outro titular. O perfil continua sendo a fonte
   da identidade do colecionador; a carteira é a fonte do endereço de recebimento.

3. **Principal e secundária.** `kind` identifica a principal. O invariante "no
   máximo uma principal" é garantido no store, não na interface. A primeira carteira
   cadastrada é sempre a principal. `POST /api/wallets/:id/primary` troca os papéis
   das duas. Remover a principal promove a secundária restante; remover a última
   deixa a lista vazia. A edição nunca muda o `kind` nem o `id`.

4. **Endereço por rede.** `GET /api/networks` passou a devolver `addressFormat`.
   A validação consulta esse campo em vez de assumir `0x`: EVM usa `0x` com 40
   hexadecimais, Solana usa base58 de 32 a 44 caracteres. Cliente e handler usam a
   mesma função. Solana entrou na lista de redes justamente para o caso não-EVM ser
   exercitável.

5. **Conexão simulada.** `POST /api/wallets/:id/connect` e `/disconnect` simulam o
   ciclo da carteira na camada de rede, não na interface. A recusa é determinística
   pelo cenário `wallet_refused`, no mesmo interruptor que já existia para pagamento.
   Não há integração com MetaMask nem com blockchain, e nenhuma chave privada ou seed
   phrase é pedida ou guardada.

6. **Pedido.** `POST /api/orders` passou a exigir `walletId`. O handler confere se a
   carteira é do usuário da sessão e se a rede dela bate com a rede da cotação,
   respondendo `409` quando não bate. O pedido guarda um **snapshot** da carteira
   (`order.wallet`), então remover a carteira depois não altera pedidos nem recibos
   já criados. A chave de idempotência passou a comparar `quoteId:walletId`: repetir
   a mesma chave com a mesma carteira devolve o mesmo pedido, e trocar a carteira com
   a chave antiga responde `409`, como já acontecia ao trocar a cotação.

7. **Autorização.** Todos os handlers usam `getRequestUser()`. Nenhum `userId` vem do
   corpo da requisição. Uma carteira de outro usuário responde `404`, não `403`, para
   não revelar a existência do registro.

**Consequências.**

- O checkout não confirma mais sem carteira selecionada, compatível e conectada. Os
  testes que criavam pedidos direto pela API passaram a cadastrar uma carteira antes;
  as asserções de idempotência, cenários de falha e tempo real continuam as mesmas.
- `POST /api/test/reset` limpa carteiras e perfis, para o cenário conhecido voltar
  íntegro.
- Validação responde `400` com `errors` por campo, alinhando perfil e carteiras ao
  mesmo contrato de erro.

**Alternativas descartadas.** Guardar só o `walletId` no pedido foi descartado porque
remover a carteira apagaria a informação do recibo. Deixar `walletId` opcional foi
descartado porque a seleção deixaria de ser real no servidor simulado.

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
