---
status: aceito
data: 2026-10-28
fonte-notion: https://app.notion.com/p/3fd490a7ac7d817c877fc63add29a959
tags:
  - adr
---

# ADR-001: Stack Next.js + NestJS + Prisma + Supabase + Vercel

> [!info] Origem
> Migrado do ADR-001 do Notion ("Usar NestJS como API e Supabase como banco, login e arquivos"). Substitui a versão anterior da decisão, que usava o Supabase como backend único.

## Contexto

Projeto de portfólio feito por uma pessoa, com custo zero e foco em mostrar engenharia de back-end, clean code e BDD/TDD (ver [[visao]]). Na versão anterior, a regra de negócio ficava em funções SQL e Edge Functions espalhadas, o que é difícil de testar isoladamente e de apresentar numa entrevista. O prazo deixou de ser restrição, e o objetivo de portfólio pede um back-end visível, em camadas e testável com TDD.

## Decisão

- **Front-end:** Next.js (App Router) + TypeScript, publicado na **Vercel**.
- **Back-end:** API em **NestJS** (TypeScript) que concentra toda a regra de negócio, em camadas por módulo: `domain`, `application`, `infrastructure`, `presentation`. O domínio não depende de framework.
- **Dados:** **Prisma** para schema, migrations e seed, sobre PostgreSQL.
- **Supabase apenas para:** PostgreSQL gerenciado, autenticação (Supabase Auth; a API valida o JWT via JWKS) e armazenamento de arquivos (Storage). A Data API pública do Supabase fica desligada; só a API acessa o banco.
- **Custo:** tudo em planos gratuitos.

> [!todo] Hospedagem da API: proposta no [[ADR-002-hospedagem-api]] (spike LB-121), aguardando aprovação.

## Alternativas consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **Next.js + NestJS + Prisma, Supabase como banco/login/arquivos** (escolhida) | Back-end em camadas e visível; regra de negócio em TypeScript puro e testável; Swagger; aproveita o melhor do Supabase | Dois apps para publicar; hospedagem gratuita da API pode "dormir" |
| Supabase como backend único (descartada; versão anterior) | Menos peças, tudo gratuito, RLS nativo | Regra de negócio em SQL e funções soltas, pouco visível no portfólio |
| Next.js full-stack com Prisma | Um só deploy | Back-end misturado ao front, menos claro como arquitetura |
| Angular + Spring Boot | Robusto, comum em empresas grandes | Stacks secundárias, deploy gratuito difícil |

## Consequências

- **Positivas:** regra de negócio testável sem banco; arquitetura clara para recrutadores; Swagger como documentação viva; o Supabase fica com o que faz melhor.
- **Negativas / dívidas assumidas:** dois deploys (web e API); a hospedagem gratuita da API pode ter partida a frio; mais código de infraestrutura que na versão anterior.

## Relacionados

- [[visao-geral]]
- [[ADR-002-hospedagem-api]]: hospedagem da API
- [[ADR-003-pwa-mobile-first]]: site mobile-first em Next.js (Notion ADR-002)
- [[ADR-004-mercado-pago]]: pagamentos (Notion ADR-003)
- [[ADR-005-monorepo-camadas]]: monorepo e camadas (Notion ADR-004)
