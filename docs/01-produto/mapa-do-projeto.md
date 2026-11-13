---
tipo: produto
atualizado: 2026-11-10
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
- [[testes-api]]: testes da API em unidade, integração com banco real e HTTP (LB-119).
- [[contratos-compartilhados]]: schemas Zod compartilhados e cliente tipado da API (LB-120).
- [[maioridade-entrada]]: confirmação de maioridade na entrada do site (LB-19).
- [[boas-vindas]]: tela inicial com entrar, criar conta e convidado (LB-24).
- [[termos-privacidade]]: Termos de Uso, Política de Privacidade e Entregas (LB-22).
- [[cadastro-login]]: cadastro e login com e-mail e senha (LB-25).
- [[recuperacao-senha]]: link por e-mail e nova senha (LB-27).
- [[guards-api]]: proteção da API e do site por autenticação e papéis (LB-28).
- [[catalogo]]: listagem, filtros, ordenação, faixa de categorias e esgotadas.
- [[destaques-home]]: seção "Cervejas em destaque" da home.
- [[produto]]: página de produto com ficha, desconto, estoque baixo e quantidade (LB-40, LB-41, LB-42).
- [[adicionar-do-card]]: colocar uma cerveja na Geladeira direto do card (LB-35).
- [[geladeira]]: o carrinho em prateleiras por categoria, com resumo, revalidação no servidor e persistência no navegador e na conta (LB-124, LB-47, LB-49, LB-50, LB-51, LB-52).
- [[dados-pessoais]]: editar o perfil com data de nascimento, maioridade no pedido e login ao finalizar (LB-29, LB-20, LB-31).
- [[enderecos-entrega]]: endereços com busca por CEP, área de entrega e frete por distância com frete grátis (LB-30, LB-62, LB-63, LB-64, LB-66).
- [[checkout]]: Entrega → Pagamento → Revisão, com Pix e cartão.
- [[pedidos-cliente]]: pedido confirmado e "Meus pedidos" com o status de cada pedido (LB-61, LB-67; e-mail LB-81 em aberto).
- [[admin]]: área admin com cervejas e foto, estoque com mínimo, pedidos e status, e regras de entrega (LB-72, LB-73, LB-75, LB-76, LB-77).

## Decisões (ADRs)

- [[ADR-001-stack]]: Next.js + NestJS + Prisma + Supabase + Vercel.
- [[ADR-002-hospedagem-api]]: hospedagem gratuita da API no MVP.
- [[ADR-003-pwa-mobile-first]]: site mobile-first em Next.js.
- [[ADR-004-mercado-pago]]: Mercado Pago em sandbox para pagamentos.
- [[ADR-005-monorepo-camadas]]: monorepo com arquitetura em camadas (com a seção Complemento).
- [[ADR-006-merge-por-agentes]]: merge de PRs pelo Orchestrator e pelo Devops.
- [[ADR-007-banco-de-teste]]: banco separado no Postgres local e service container no CI para os testes de integração.
- [[ADR-008-token-jwks-assimetrico]]: token da API validado só com chave assimétrica (JWKS), HS256 recusado.
- [[ADR-009-guard-global-fechado]]: rotas fechadas por padrão, papel lido do banco e 404 na posse.
- [[ADR-010-validacao-com-zod]]: validação com Zod em vez de class-validator.
- [[ADR-011-maioridade-proxy-cookie]]: maioridade pelo proxy, cookie de 30 dias e robôs de busca liberados.
- [[ADR-012-sessao-em-cookies-httponly]]: sessão em cookies HttpOnly, API chamada pelo servidor do site.
- [[ADR-013-link-gasto-so-no-post]]: link do e-mail só é gasto no POST.
- [[ADR-014-admin-so-com-email-confirmado]]: admin só com e-mail confirmado, lido pela API no banco.
- [[ADR-015-ferramentas-monorepo]]: pnpm + Turborepo, `@leguele/shared` compilado com `tsc`, Vitest em todos os pacotes e dependency-cruiser no CI.
- [[ADR-016-ciclo-continuo-da-banda]]: a ordem vira ciclo contínuo; decisão do Diego vai ao cartão de pendências e a banda segue; recomendada é aplicada e vetável.
- [[ADR-017-fotos-com-sessao-do-admin]] (proposto, aceite do Diego antes da fatia 3 do LB-73): fotos das cervejas enviadas pelo servidor do site com a sessão do admin e política do armazenamento pelo papel admin, sem chave de serviço.

## Arquitetura

- [[visao-geral]]: visão geral da arquitetura.

## Diário

- As daily notes ficam em `docs/05-diario/`, uma por dia (`AAAA-MM-DD.md`); a mais recente é a de data maior. Exemplo: [[2026-10-28]], o primeiro dia registrado.

## Rascunhos e apoio

- [[LEIA-ME]]: estrutura do vault.
- [[backlog-snapshot]]: retrato do backlog do Notion antes da migração para o GitHub Issues.
- [[sequencia-telas]]: ordem de implementação das telas (1 a 9) e divergências do design que seguem a spec.
- [[maestri-banda]]: a banda de agentes do Maestri e o modelo de cada um.
- [[licoes-aprendidas]]: erros da banda e a regra que cada um gerou (todo agente lê no início de cada ordem).
