---
status: aceito
data: 2026-10-30
tags:
  - adr
---

# ADR-009: Rotas da API fechadas por padrão, papel lido do banco e 404 na posse

> [!info] Status
> **Aceito.** Registro retroativo (2026-11-04): a decisão foi tomada em 2026-10-30 e ficou só nas notas do diário e nos PRs.

## Contexto

Todas as rotas da API precisam de autenticação e, em algumas, de papel e de posse do recurso. Decisão do LB-28 ([[guards-api]], PR #150; diário [[2026-10-30]]).

## Decisão

- **Fechado por padrão:** `AccessGuard` é `APP_GUARD` global (`apps/api/src/modules/account/account.module.ts`, `presentation/access.guard.ts`). Toda rota exige token válido; só abre quem leva `@Public()` (hoje, `/health`). `@Roles("admin")` exige o papel.
- **Papel lido do banco:** o papel vem de `ProfileRepository.findRole` a cada requisição (`application/authorize-request.ts`); quem não tem perfil é `customer`. O papel nunca vem do token.
- **Posse com 404:** `ownedOrNotFound` (`apps/api/src/common/authorization/owned-or-not-found.ts`) lança `NotFoundError` quando o recurso é de outra conta, igual ao de um id inexistente.

## Por quê

Rota nova esquecida fica protegida, não exposta: o erro seguro é o padrão. Papel no token seria editável pelo cliente (`user_metadata`) e só mudaria quando o token vencesse. O 404 igual impede descobrir, pelo código de erro, que um id existe na conta de outra pessoa.

## Consequências

Cada requisição autenticada faz uma consulta de papel ao banco. Rotas públicas novas precisam de `@Public()` explícito.
