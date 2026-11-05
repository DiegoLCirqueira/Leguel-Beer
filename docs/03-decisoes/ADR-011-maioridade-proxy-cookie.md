---
status: aceito
data: 2026-10-30
tags:
  - adr
---

# ADR-011: Maioridade pelo proxy, com cookie de 30 dias e robôs de busca liberados

> [!info] Status
> **Aceito.** Registro retroativo (2026-11-04): a decisão foi tomada em 2026-10-30 e ficou só nas notas do diário e nos PRs.

## Contexto

O site só pode ser exibido a quem confirmou ter 18 anos ou mais, sem validar documento ([[maioridade-entrada]], LB-19, PR #143; diário [[2026-10-30]]).

## Decisão

- **Onde:** `apps/web/src/proxy.ts` aplica `decidirAcesso` (`apps/web/src/lib/acesso-maioridade.ts`) a toda página; a API e os estáticos ficam de fora. Sem confirmação, a pessoa vai para `/maioridade` com o retorno só interno (`retornoSeguro`, `lib/maioridade.ts`).
- **Cookie:** `leguele_maioridade`, `HttpOnly`, `SameSite=Lax`, `Secure` em produção, guarda a data em ms e vale 30 dias (`MAIORIDADE_VALIDADE_DIAS`; `app/maioridade/actions.ts`). "Não" não é lembrado.
- **Robôs:** `googlebot`, `bingbot`, `duckduckbot`, `baiduspider`, `yandexbot` e `slurp` (pelo user-agent) passam sem a pergunta. `/termos` e `/privacidade` também passam.

## Por quê

Barrar no proxy cobre todas as rotas num ponto só, antes de renderizar. Sem liberar os robôs, nada seria indexado. O user-agent é declarado pelo cliente, então qualquer pessoa pode se passar por robô e pular a pergunta; o risco é aceito porque a confirmação é só declaratória e a compra continua exigindo conta e a confirmação do checkout (LB-20).
