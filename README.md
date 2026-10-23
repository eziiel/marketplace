# Kurio NFT Marketplace

Marketplace de NFTs construído como desafio técnico para a Jungle Gaming. É uma
aplicação **front-end** (SPA) que simula um backend completo no próprio navegador
usando MSW (Mock Service Worker) com persistência em `localStorage` e eventos de
tempo real via Socket.IO simulado.

> ⚠️ **Importante:** não há servidor real. Autenticação, pedidos, idempotência e
> tempo real são **simulações client-side** para fins de demonstração. Nada aqui
> é um mecanismo de segurança de produção — veja [Limitações conhecidas](#limitações-conhecidas)
> e [ARCHITECTURE.md](./ARCHITECTURE.md).

## Stack

- **React 19** + **TypeScript** + **Vite 8**
- **TanStack Router** (roteamento) e **TanStack Query** (estado de servidor/cache)
- **Axios** (cliente HTTP)
- **Tailwind CSS v4** + componentes utilitários (shadcn / base-ui)
- **MSW** (mock de API HTTP + WebSocket, persistido em `localStorage`)
- **socket.io-client** com servidor Socket.IO simulado na camada de mocks
- **Playwright** (testes E2E)
- Deploy na **Vercel**

## Demo (Vercel)

🔗 **https://marketplace-psi-blond.vercel.app/**

A aplicação é publicada na Vercel como site estático (SPA). O arquivo
[`vercel.json`](./vercel.json) reescreve todas as rotas para `index.html`, e o
MSW roda também em produção (`VITE_ENABLE_MOCKS=true` em `.env.production`), então
a demo funciona sem backend.

## Pré-requisitos

- **Node.js 20.19+ ou 22.12+** (exigência do Vite 8)
- **npm** (o repositório usa `package-lock.json`)

## Como executar

```bash
# 1. Instalar dependências
npm install

# 2. Ambiente de desenvolvimento (http://localhost:5173)
npm run dev

# 3. Build de produção + preview local (http://localhost:4173)
npm run build
npm run preview
```

Na primeira execução o MSW registra o service worker (`public/mockServiceWorker.js`)
e popula o `localStorage` com os dados de exemplo (NFTs, usuários, cupons).

## Variáveis de ambiente

| Variável             | Onde                                    | Valor   | Descrição                                                                 |
| -------------------- | --------------------------------------- | ------- | ------------------------------------------------------------------------- |
| `VITE_ENABLE_MOCKS`  | `.env.development` / `.env.production`  | `true`  | Liga o MSW (mock de API/WebSocket). Sem isso, não há "backend" e a app não carrega dados. |

Os arquivos `.env.*` já vêm versionados com os valores necessários para rodar a
demo. Não há segredos — tudo é simulado no cliente.

## Scripts

| Script                   | Descrição                                               |
| ------------------------ | ------------------------------------------------------- |
| `npm run dev`            | Servidor de desenvolvimento (Vite)                      |
| `npm run build`          | Type-check (`tsc -b`) + build de produção (`vite build`)|
| `npm run preview`        | Serve o build de produção localmente                    |
| `npm run lint`           | ESLint                                                  |
| `npm run test:e2e`       | Testes E2E Playwright (faz build + preview automaticamente) |
| `npm run test:e2e:report`| Abre o último relatório HTML do Playwright              |

## Credenciais de demonstração

| Usuário     | E-mail              | Senha        |
| ----------- | ------------------- | ------------ |
| Ana Silva   | `ana@example.com`   | `Teste@123`  |
| Bruno Costa | `bruno@example.com` | `Teste@456`  |

Também é possível criar uma conta nova pela tela de cadastro (`/signup`); o usuário
fica persistido no `localStorage` do navegador.

## Funcionalidades

- **Cadastro** de usuários com validação (nome, e-mail, senha) e persistência.
- **Autenticação** simulada (login/logout) com token em `localStorage`.
- **Catálogo** com 36 NFTs, busca, filtros por coleção, rede e faixa de preço, abas (novos lançamentos / em alta), ordenação e paginação (9 por página) — tudo no estado da URL.
- **Detalhe do NFT** com galeria, avaliações de colecionadores, edição, quantidade com limite de estoque, favoritos e compartilhamento.
- **Carrinho** por sessão (adicionar, atualizar quantidade, remover), com validação de estoque, cupom e resumo (subtotal, desconto, taxa estimada e total) vindos da cotação.
- **Checkout**: perfil do colecionador com validação, seleção de rede e carteira, cupom de desconto, cotação (quote) e confirmação do pedido.
- **Idempotência** na criação de pedidos (header `Idempotency-Key`), com tratamento de conflito (409).
- **Pedidos**: estados `pending → confirmed/refused`, recibo e link de "explorador".
- **Favoritos** por usuário (persistidos e isolados entre contas).
- **Perfil do colecionador** (`/profile`): nome de exibição, nome de usuário, e-mail,
  nome ENS, apelido da carteira, avatar (PNG/JPEG/WebP até 512 KB) e troca de senha
  com validação da senha atual e confirmação da nova.
- **Carteiras** (`/profile/wallets`): carteira principal e secundária com rede, tipo,
  endereço `0x` verificado, ENS e código de indicação; criar, editar e remover.
- **Tempo real**: atualização de preço/estoque de NFTs e do status do pedido via Socket.IO simulado.
- **Isolamento por usuário**: carrinho, pedidos, favoritos, perfil e carteiras não vazam entre contas.

## Como avaliar o projeto

### Cupons disponíveis

| Código      | Efeito              |
| ----------- | ------------------- |
| `WELCOME10` | 10% de desconto     |
| `EXPIRED10` | Cupom expirado (rejeitado) |

Aplique no carrinho (campo **Código promocional**) ou no checkout (link **Aplique aqui**). O cupom aplicado no carrinho é mantido até o pagamento.

### Cenários de falha (checkout)

O backend simulado expõe um "interruptor de cenário" para exercitar caminhos de erro.
É possível alterná-lo pelo console do navegador (com a app aberta):

```js
await fetch("/api/test/scenario", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ scenario: "payment_refused" }),
});
```

Cenários aceitos:

| Cenário            | Comportamento                                                        |
| ------------------ | -------------------------------------------------------------------- |
| `success`          | Fluxo normal (padrão): pedido confirma de forma assíncrona           |
| `payment_refused`  | Pagamento recusado; o carrinho é preservado                          |
| `timeout`          | Primeira tentativa retorna 504; o retry com a mesma chave não duplica|
| `price_changed`    | Preço muda entre cotação e pedido → 409                              |
| `stock_changed`    | Estoque muda entre cotação e pedido → 409                            |

Para restaurar o estado inicial: `await fetch("/api/test/reset", { method: "POST" })`.

### Roteiro sugerido

1. Abra o catálogo, clique no coração de um NFT como **visitante** → é redirecionado ao login.
2. Faça login como **Ana**, favorite alguns NFTs, recarregue a página (persistem).
3. Adicione itens ao carrinho, vá ao **checkout**, aplique `WELCOME10`, confirme o pedido e veja a **confirmação** em tempo real.
4. Teste um cenário de falha (ex.: `payment_refused`) e confirme que o carrinho é preservado.
5. Abra **Meu perfil** pelo "Olá, Ana" no cabeçalho, complete os dados, cadastre uma
   carteira em **Carteiras** e volte ao checkout: a carteira aparece em "Usar carteira
   cadastrada" e preenche o formulário.
6. Faça logout, entre como **Bruno** e confirme que favoritos, carrinho, pedidos,
   perfil e carteiras são isolados.

## Testes (Playwright)

```bash
npm run test:e2e          # roda toda a suíte (headless)
npm run test:e2e:report   # abre o relatório HTML
```

O Playwright sobe o preview automaticamente (`playwright.config.ts` → `webServer`),
então não é preciso iniciar o servidor manualmente.

Cobertura E2E atual: autenticação, cadastro, catálogo, detalhe do NFT, carrinho,
checkout (incluindo idempotência e recusa), cenários de falha, tempo real,
**favoritos** (`e2e/favorites.spec.ts`), **perfil** (`e2e/profile.spec.ts`) e
**carteiras** (`e2e/wallets.spec.ts`).

## Arquitetura

As decisões técnicas (escolha do Vite, autenticação simulada, persistência por
usuário, favoritos, idempotência e tempo real) estão documentadas em
[ARCHITECTURE.md](./ARCHITECTURE.md).

## Limitações conhecidas

- **Sem backend real.** Toda a API vive no navegador (MSW) e persiste em `localStorage`.
  Limpar o storage do navegador reseta os dados.
- **Autenticação não é segura.** O "token" é um identificador de sessão gerado e
  validado no cliente; não há criptografia, expiração real imposta pelo servidor nem
  proteção contra adulteração. É apenas uma simulação de fluxo de UI.
- **Dados não são compartilhados entre dispositivos/navegadores** — cada navegador
  tem seu próprio estado.
- **Senhas dos usuários de exemplo** ficam em texto puro nos mocks (apenas demo).
  Senhas trocadas pela tela de perfil são gravadas como `SHA-256(salt:senha)`, nunca
  em claro, e o texto puro do usuário cadastrado é apagado na troca.
- **Tempo real é simulado** dentro da própria aba (não há servidor WebSocket real);
  eventos não se propagam entre abas/dispositivos distintos.
- O MSW roda **em produção** por design, para que a demo funcione sem infraestrutura.
