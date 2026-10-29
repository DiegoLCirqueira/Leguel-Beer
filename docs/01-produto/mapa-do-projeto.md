---
tipo: produto
atualizado: 2026-10-29
tags:
  - produto
  - mapa
---

# Mapa do projeto

Nota de entrada do vault da Leguelé Beer: por onde começar e onde está cada coisa.

## Produto

- [[visao]]: o que é a Leguelé Beer, público, escopo do MVP e restrições.
- [[mvp-corte]]: épicos que entram no MVP, no MVP+ e no Pós-MVP.
- [[roteiro-mvp]]: ordem de trabalho do MVP, começando pelo acesso.
- [[GLOSSARY]]: termos oficiais (por exemplo, Geladeira em vez de carrinho).

## Features (specs BDD)

- [[base-monorepo]]: monorepo, apps web e api, pacotes, testes, lint e CI (LB-1).
- [[identidade-visual]]: tokens de cor, tipografia e espaçamento; botão, badge e chip (LB-11, LB-12).
- [[api-base]]: Supabase local, Prisma, erros padronizados, Swagger e camadas da API (LB-3, LB-117, LB-118).
- [[maioridade-entrada]]: confirmação de maioridade na entrada do site (LB-19).
- [[boas-vindas]]: tela inicial com entrar, criar conta e convidado (LB-24).
- [[cadastro-login]]: cadastro e login com e-mail e senha (LB-25).
- [[recuperacao-senha]]: link por e-mail e nova senha (LB-27).
- [[guards-api]]: proteção da API e do site por autenticação e papéis (LB-28).
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
- [[ADR-007-banco-de-teste]]: banco separado no Postgres local e service container no CI para os testes de integração.

## Arquitetura

- [[visao-geral]]: visão geral da arquitetura.

## Diário

- As daily notes ficam em `docs/05-diario/`, uma por dia (`AAAA-MM-DD.md`); a mais recente é a de data maior. Exemplo: [[2026-10-28]], o primeiro dia registrado.

## Rascunhos e apoio

- [[LEIA-ME]]: estrutura do vault.
- [[backlog-snapshot]]: retrato do backlog do Notion antes da migração para o GitHub Issues.
- [[maestri-banda]]: a banda de agentes do Maestri e o modelo de cada um.
- [[licoes-aprendidas]]: erros da banda e a regra que cada um gerou (todo agente lê no início de cada ordem).
