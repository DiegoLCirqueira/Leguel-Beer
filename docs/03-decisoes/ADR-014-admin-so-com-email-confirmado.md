---
status: aceito
data: 2026-10-30
tags:
  - adr
---

# ADR-014: Admin só com e-mail confirmado, lido pela API no banco

> [!info] Status
> **Aceito.** Registro retroativo (2026-11-04): a decisão foi tomada em 2026-10-30 (PR #154) e listada no diário de [[2026-10-31]].

## Contexto

A conta cujo e-mail é o de `ADMIN_EMAIL` recebe o papel admin ao criar o perfil ([[guards-api]], [[cadastro-login]]). O e-mail vindo do token não basta: quem cadastrar esse e-mail antes de confirmá-lo viraria admin.

## Decisão

A API grava o papel admin só se o e-mail bate com `ADMIN_EMAIL` **e** `auth.users.email_confirmed_at` está preenchido. `PrismaEmailConfirmation` (`apps/api/src/modules/account/infrastructure/prisma-email-confirmation.ts`) lê essa coluna do Supabase Auth, só leitura, com query parametrizada; a regra está em `apps/api/src/modules/account/application/create-profile.ts`. Em execução a API não usa a chave de serviço (`SUPABASE_SERVICE_ROLE_KEY`): só o seed a usa (`infrastructure/seed-admin.ts`; `EnsureAdminAccount` recusa e-mail não confirmado).

## Por quê

A prova de confirmação vem do servidor, não do token, cujo `user_metadata` o usuário edita. Ler o banco evita pôr no processo da API uma chave de serviço que dá poder total sobre o Auth. O custo é o papel do `DATABASE_URL` precisar de `SELECT` em `auth.users` (o `postgres` do Supabase tem) e a API conhecer uma tabela de outro esquema.
