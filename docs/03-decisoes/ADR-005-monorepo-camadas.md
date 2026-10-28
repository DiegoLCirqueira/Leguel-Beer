---
status: aceito
data: 2026-10-28
notion-adr: ADR-004
fonte-notion: https://app.notion.com/p/3fd490a7ac7d81489b71fd1051140e49
tags:
  - adr
---

# ADR-005: Monorepo com arquitetura em camadas

> [!info] Status
> **Aceito.** Migrado do ADR-004 do Notion ("Organizar em monorepo com arquitetura em camadas"). Ver "Ajustes na migração".

## Contexto

Com front e back separados ([[ADR-001-stack]]), validações e tipos precisam ser os mesmos dos dois lados. O recrutador deve encontrar tudo num só repositório.

## Decisão

Um único repositório com **Turborepo e pnpm**:

```txt
apps/
  web/      Next.js (front)
  api/      NestJS (back)
    src/modules/<contexto>/
      domain/          entidades, value objects, regras puras, portas
      application/     casos de uso
      infrastructure/  repositórios Prisma, adaptadores externos
      presentation/    controllers e DTOs
packages/
  shared/   schemas Zod, tipos de contrato, formatBRL, regras puras reutilizáveis
  config/   eslint, tsconfig, prettier
```

- **Regra de dependência:** `domain` não importa nada de framework, e isso é verificado no CI com dependency-cruiser.
- **Cliente da API tipado**, gerado a partir do OpenAPI (Swagger) ou dos schemas compartilhados.
- **Deploy:** `apps/web` e `apps/api` viram dois projetos na Vercel a partir do mesmo repositório. A API roda como função serverless, conforme o [[ADR-002-hospedagem-api]].

## Alternativas consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **Monorepo Turborepo + pnpm** (escolhida) | Tipos e schemas compartilhados, um CI, cache de build, um link no portfólio | Configuração inicial maior |
| Dois repositórios | Independência total | Tipos duplicados ou pacote publicado, dois CIs |
| Nx | Muito completo | Mais complexo do que o projeto precisa |

## Consequências

- **Positivas:** uma única fonte de verdade para validação, testes de domínio rápidos, arquitetura fácil de explicar.
- **Negativas:** curva inicial de configuração do monorepo e dos dois deploys.

## Pós-MVP

- **Tempo real** (status do pedido ao vivo, card LB-69) fica para o Pós-MVP.
- No MVP não há processos de longa duração ([[ADR-002-hospedagem-api]]): a camada `presentation` só tem controllers e DTOs HTTP.
- Ao retomar o tempo real, rever este ADR e o ADR-002 juntos.

## Ajustes na migração

| No Notion | Aqui | Por quê |
| --- | --- | --- |
| `presentation/` com "controllers, DTOs, **gateways WebSocket**" | `presentation/` com controllers e DTOs; tempo real em "Pós-MVP" | Decisão de hospedagem do MVP sem processos de longa duração ([[ADR-002-hospedagem-api]]); LB-69 é Pós-MVP no [[mvp-corte]] |
| Consequência "curva dos deploys separados" | Deploy explícito: dois projetos Vercel, API serverless | Alinhado ao ADR-002 |
| Numerado como ADR-004 | ADR-005 | O ADR-002 do repositório é o de hospedagem |

> [!todo] Revisar e completar este ADR antes de iniciar o card LB-1 (criar o monorepo).
