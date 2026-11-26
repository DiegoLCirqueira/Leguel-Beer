---
status: proposto
data: 2026-11-26
tags:
  - adr
---

# ADR-021: Merge na `main` vira deploy na Vercel (Hobby, dois projetos)

> [!info] Status
> **Proposto** (rascunho do Spec em 26/11, a pedido do Orchestrator). Nada foi criado na Vercel: sem conta, projeto, chave nem variável. Vira "aceito" só depois de o Diego confirmar e de o Devops executar o LB-8. Decisões de custo, conta e deploy em produção são do Diego ([[ADR-006-merge-por-agentes]], ponto em aberto sobre deploy).

## Contexto

O [[ADR-002-hospedagem-api]] pôs a API como função serverless na Vercel (plano Hobby), num projeto separado do site, no mesmo repositório, e o [[ADR-005-monorepo-camadas]] confirmou que dois projetos cabem no Hobby. Falta decidir **quando** o código vai ao ar. O merge na `main` já é protegido pelas quatro condições do [[ADR-006-merge-por-agentes]] (aprovação do Reviewer, CI verde, sem atribuição, base `main`). O projeto é de portfólio, sem venda real.

## Decisão

- **Dois projetos Vercel** ligados ao mesmo repositório, com os nomes `leguele-web` (site, `apps/web`) e `leguele-api` (API, `apps/api`).
- **Merge na `main` = deploy de produção** dos dois projetos, automático pela integração Git da Vercel. A branch de produção é a `main`.
- **PR = deploy de preview** (um endereço por PR), também no plano Hobby, para o Reviewer e o Diego verem a mudança.
- **Variáveis só na plataforma**, nunca no git: as do site e as da API ficam nos respectivos projetos; o `CRON_SECRET` protege o cron diário `GET /cron/expirar-pedidos` ([[ADR-002-hospedagem-api]]).
- **Sem etapa de aprovação manual de deploy**: a proteção é o CI e a revisão antes do merge.

## Por quê

- É o caminho mais simples dentro do plano gratuito: a Vercel já faz build e deploy por Git, sem pipeline próprio.
- Para um portfólio, ter o que está na `main` sempre no ar evita o site ficar desatualizado em relação ao código que o recrutador lê.
- O custo do erro é baixo: não há venda real nem dado de cliente real, e um deploy anterior pode ser promovido de novo pela Vercel (a conferir no plano Hobby pelo Devops).

## Alternativas consideradas

- **Deploy manual** (o Devops dispara depois de cada merge): mais controle, mas é mais um passo que a banda esquece, e o site fica atrás da `main`.
- **Branch `producao` separada**, promovida por PR: isola o que vai ao ar, mas dobra o número de merges e de PRs sem ganho para um projeto sem usuário real.

## Consequências

- Todo merge na `main` publica, inclusive os de docs (o build de docs só não muda nada visível). Merge ruim vai ao ar: o freio é o Reviewer e o CI.
- Migrations de banco **não** rodam sozinhas no deploy: aplicar em produção continua sendo ação do Devops com ok do Diego (migration em produção é item 5 da política).
- O limite do Hobby vale: 100 deploys por dia, 45 minutos de build, cron diário com imprecisão de até 59 minutos, uso pessoal e não comercial ([[ADR-002-hospedagem-api]]). Se o projeto virar operação real, sobe para o plano Pro, e este ADR é revisto num ADR novo.
- Preview por PR gera endereços públicos: o preview não pode apontar para o banco de produção nem expor segredo (o aviso de trace público do #333 vale também aqui).
