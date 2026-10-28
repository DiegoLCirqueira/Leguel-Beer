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
    end

    W -->|HTTP / JSON| A[NestJS<br/>API]
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

> [!todo] Preencher: onde a API NestJS será hospedada (spike pendente). O diagrama mostra só o front dentro da Vercel.

## Ver também

- [[visao]]
