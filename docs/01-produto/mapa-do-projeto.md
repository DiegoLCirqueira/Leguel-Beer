---
tipo: produto
atualizado: 2026-10-28
tags:
  - produto
  - mapa
---

# Mapa do projeto

Nota de entrada do vault da Leguelé Beer: por onde começar e onde está cada coisa.

## Produto

- [[visao]]: o que é a Leguelé Beer, público, escopo do MVP e restrições.
- [[mvp-corte]]: épicos que entram no MVP, no MVP+ e no Pós-MVP.
- [[GLOSSARY]]: termos oficiais (por exemplo, Geladeira em vez de carrinho).

## Features (specs BDD)

- [[catalogo]]: listagem, filtros, ordenação, faixa de categorias e esgotadas.
- [[destaques-home]]: seção "Cervejas em destaque" da home.
- [[adicionar-do-card]]: colocar uma cerveja na Geladeira direto do card.
- [[geladeira]]: o carrinho em prateleiras por categoria.
- [[checkout]]: Entrega → Pagamento → Revisão, com Pix e cartão.

## Decisões (ADRs)

- [[ADR-001-stack]]: Next.js + NestJS + Prisma + Supabase + Vercel.
- [[ADR-002-hospedagem-api]]: hospedagem gratuita da API no MVP.
- [[ADR-003-pwa-mobile-first]]: site mobile-first em Next.js.
- [[ADR-004-mercado-pago]]: Mercado Pago em sandbox para pagamentos.
- [[ADR-005-monorepo-camadas]]: monorepo com arquitetura em camadas (com a seção Complemento).
- [[ADR-006-merge-por-agentes]]: merge de PRs pelo Orchestrator e pelo Devops.

## Arquitetura

- [[visao-geral]]: visão geral da arquitetura.

## Diário

- As daily notes ficam em `docs/05-diario/`, uma por dia (`AAAA-MM-DD.md`); a mais recente é a de data maior. Exemplo: [[2026-10-28]], o primeiro dia registrado.

## Rascunhos e apoio

- [[LEIA-ME]]: estrutura do vault.
- [[backlog-snapshot]]: retrato do backlog do Notion antes da migração para o GitHub Issues.
- [[maestri-banda]]: a banda de agentes do Maestri e o modelo de cada um.
- [[licoes-aprendidas]]: erros da banda e a regra que cada um gerou (todo agente lê no início de cada ordem).
