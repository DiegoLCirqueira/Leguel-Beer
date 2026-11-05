---
status: aceito
data: 2026-10-29
tags:
  - adr
---

# ADR-010: Validação com Zod, sem class-validator

> [!info] Status
> **Aceito.** Registro retroativo (2026-11-04): a decisão foi tomada em 2026-10-29 e ficou só nas notas do diário e nos PRs.

## Contexto

Front e API precisam validar a mesma entrada com as mesmas regras ([[ADR-005-monorepo-camadas]]: `packages/shared` guarda schemas Zod). A base da API ([[api-base]], PR #129; diário [[2026-10-29]]) tinha de escolher como validar na borda HTTP do NestJS, cuja prática comum é `class-validator` com `ValidationPipe`.

## Decisão

A API valida com o schema Zod dos contratos de `@leguele/shared`: `zodDto(schema)` cria a classe do DTO (`apps/api/src/common/validation/zod-dto.ts`) e o `ZodValidationPipe` global (`common/validation/zod-validation.pipe.ts`, registrado como `APP_PIPE` em `apps/api/src/app.module.ts`) valida pelo schema e responde `VALIDATION_ERROR` no contrato de erros da API, com mensagens em pt-BR. Não há `class-validator` nem `ValidationPipe` no projeto.

## Por quê

Um schema só vale nos dois lados e dá o tipo por inferência, sem decorators repetidos e sem regras duplicadas que divergem. Quem conhece NestJS espera `class-validator`, por isso o registro.

## Consequências

O papel do Back ainda manda usar "ValidationPipe global com whitelist, transform e forbidNonWhitelisted"; isso não vale mais. Campo extra é descartado pelo `z.object` (que ignora chaves desconhecidas) e recusado só nos schemas `z.strictObject`, como o de criar perfil em `packages/shared/src/conta/perfil.ts`; não há `whitelist`.
