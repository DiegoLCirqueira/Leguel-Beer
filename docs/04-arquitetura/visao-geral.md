---
tipo: arquitetura
atualizado: 2026-10-28
tags:
  - arquitetura
---

# Visão geral da arquitetura

Decisão de stack registrada em [[ADR-001-stack]].

```mermaid
flowchart LR
    U[Cliente no celular] --> W

    subgraph Vercel
        W[Next.js<br/>front-end]
        A[NestJS<br/>API serverless]
        C[Cron diário]
    end

    W -->|HTTP / JSON| A
    C -->|limpeza + keep-alive| A
    W -->|login| AUTH

    subgraph Supabase
        DB[(Postgres)]
        AUTH[Auth]
        ST[Storage<br/>fotos]
    end

    A --> P[Prisma]
    P --> DB
    A -->|valida JWT| AUTH
    A --> ST
```

- O front fala com a API; a regra de negócio fica toda no NestJS.
- O Supabase serve apenas Postgres, autenticação e arquivos. A Data API pública fica desligada.

- A API roda como função serverless na Vercel, em projeto separado do front, e o cron diário da plataforma cancela pedidos expirados e mantém o Supabase ativo (ver [[ADR-002-hospedagem-api]]).
- Estrutura do monorepo e camadas: [[ADR-005-monorepo-camadas]].

## Ver também

- [[visao]]
