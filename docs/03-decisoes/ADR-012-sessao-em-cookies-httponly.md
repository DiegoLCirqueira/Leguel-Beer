---
status: aceito
data: 2026-10-30
tags:
  - adr
---

# ADR-012: Sessão em cookies HttpOnly, com a API chamada pelo servidor do site

> [!info] Status
> **Aceito.** Registro retroativo (2026-11-04): a decisão foi tomada em 2026-10-30 e ficou só nas notas do diário e nos PRs.

## Contexto

O login usa o Supabase Auth, mas o token não pode ficar legível pelo JavaScript da página ([[cadastro-login]], "Sessão e cookies"; LB-25, PR #162; diário [[2026-10-30]]).

## Decisão

O token de acesso e o de renovação ficam só em cookies `lb_acesso`, `lb_renovacao` e `lb_manter`, com `HttpOnly`, `SameSite=Lax`, `Path=/` e `Secure` fora do desenvolvimento (`apps/web/src/lib/auth/cookies.ts`). O navegador nunca os lê: login, renovação (no `proxy.ts`) e chamadas à API saem do servidor do site, que repassa `Authorization: Bearer` (`apps/web/src/lib/auth/servidor.ts`). "Manter-me conectado" marcado dá 30 dias; desmarcado, o cookie some ao fechar o navegador. Os 30 dias valem no site porque o limite de inatividade nativo do Supabase exige o plano Pro, contra a restrição "tudo gratuito" ([[ADR-001-stack]]).

## Por quê

Um XSS não consegue roubar um token que o JavaScript não alcança. O preço é todo acesso autenticado passar por Server Components, Server Actions ou rotas do Next, sem chamar a API direto do navegador.

## Consequências

O refresh token não vence no Supabase: um cookie copiado antes dos 30 dias vale até a sessão ser renovada ou encerrada (risco aceito, registrado em [[cadastro-login]]).
