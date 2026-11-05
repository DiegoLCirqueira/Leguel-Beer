---
status: aceito
data: 2026-10-30
tags:
  - adr
---

# ADR-008: Validação do token da API só com chave assimétrica (JWKS)

> [!info] Status
> **Aceito.** Registro retroativo (2026-11-04): a decisão foi tomada em 2026-10-30 e ficou só nas notas do diário e nos PRs.

## Contexto

A API recebe o JWT do Supabase Auth ([[ADR-001-stack]]: "a API valida o JWT via JWKS"). O Supabase também oferece o segredo compartilhado (HS256), que qualquer serviço que o conheça usa para forjar tokens. Decisão tomada no LB-28 ([[guards-api]], PR #150; diário [[2026-10-30]]).

## Decisão

`JwksTokenVerifier` (`apps/api/src/modules/account/infrastructure/jwks-token-verifier.ts`) valida a assinatura pelas chaves públicas do JWKS, em cache de memória, e aceita só `ES256` e `RS256`. Qualquer outro `alg`, inclusive `HS256`, é recusado, e a chave também tem de servir ao algoritmo do header. Para isso o Supabase local assina com ES256 (`pnpm db:signing-key`, `scripts/db-signing-key.mjs`; o arquivo `supabase/signing_keys.json` fica fora do git).

## Por quê

Com chave pública a API só consegue verificar, nunca emitir: não existe segredo da API que, vazado, permita forjar sessões. Aceitar HS256 junto reabriria esse risco (confusão de algoritmo). O custo é cada ambiente precisar de uma chave de assinatura assimétrica configurada.

## Alternativas consideradas

HS256 com o segredo do projeto: mais simples de configurar, recusado pelo risco acima.
