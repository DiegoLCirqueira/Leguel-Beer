---
status: aceito
data: 2026-11-26
tags:
  - adr
---

# ADR-021: Merge na `main` vira deploy na Vercel (Hobby, dois projetos)

> [!info] Status
> **Aceito pelo Diego em 26/11** (ordem: "faça as recomendadas"). O aceite é a autorização dos deploys por merge, como a Decisão abaixo diz, mas **não cria nada sozinho**: a **ligação da Vercel ao GitHub** (acesso dele, item 6) e o **primeiro deploy em produção** (item 5) continuam sendo ação ou acesso do Diego, feitos por ele ou com o ok dele no momento. **Ainda não existe banco de produção** (projeto Supabase na nuvem), nem o projeto Supabase de preview; sem eles, nada de produção ou de preview com dado funciona, e o deploy sobe só o que não depende deles. Nada foi criado na Vercel até aqui.

## Contexto

O [[ADR-002-hospedagem-api]] pôs a API como função serverless na Vercel (plano Hobby), num projeto separado do site, no mesmo repositório, e o [[ADR-005-monorepo-camadas]] confirmou que dois projetos cabem no Hobby. Falta decidir **quando** o código vai ao ar. O merge na `main` já é protegido pelas quatro condições do [[ADR-006-merge-por-agentes]] (aprovação do Reviewer, CI verde, sem atribuição, base `main`). O projeto é de portfólio, sem venda real.

## Decisão

- **Dois projetos Vercel** ligados ao mesmo repositório, com os nomes `leguele-web` (site, `apps/web`) e `leguele-api` (API, `apps/api`).
- **Merge na `main` = deploy de produção** dos dois projetos, automático pela integração Git da Vercel. A branch de produção é a `main`.
- **PR = deploy de preview** (um endereço por PR), também no plano Hobby, para o Reviewer e o Diego verem a mudança.
- **Variáveis só na plataforma**, nunca no git: as do site e as da API ficam nos respectivos projetos; o `CRON_SECRET` protege o cron diário `GET /cron/expirar-pedidos` ([[ADR-002-hospedagem-api]]).
- **Sem etapa de aprovação manual de deploy**: a proteção é o CI e a revisão antes do merge.
- **Autorização:** o aceite deste ADR pelo Diego é a autorização de **todos** os deploys de produção feitos por merge, **inclusive o primeiro**; sem o aceite, nenhum merge pode virar deploy e a Vercel não é ligada ao repositório (deploy em produção é item 5 da política). A **ligação da Vercel ao GitHub** (instalar o app da Vercel no repositório e dar a ela permissão de leitura) é um acesso do Diego (item 6): o Devops não a cria sozinho.
- **Banco do preview:** o preview **nunca** usa o banco de produção. As variáveis de produção existem só no ambiente "Production" da Vercel. O ambiente "Preview" usa um projeto Supabase separado (plano Free, só com o seed), a criar com o ok do Diego (conta e projeto novos, item 4). Até existir, o preview da API fica desligado e o do site mostra o erro de API fora do ar.

## Por que é um ADR

- **(a) Difícil de reverter, em parte:** desligar a integração é fácil, mas o que já foi ao ar não volta: um endereço público, um preview que expõe um valor, uma migration aplicada, um site que mostra um erro. E ligar o deploy ao merge tira o último freio humano antes de a mudança ficar pública.
- **(b) Surpreende quem lê o código sem contexto:** quem vê um PR de docs ou um ajuste pequeno não espera que ele publique o site e a API.
- **(c) Trade-off real:** controle de cada deploy contra manter o que está na `main` sempre no ar ([[#Alternativas consideradas]]).

## Por quê

- É o caminho mais simples dentro do plano gratuito: a Vercel já faz build e deploy por Git, sem pipeline próprio.
- Para um portfólio, ter o que está na `main` sempre no ar evita o site ficar desatualizado em relação ao código que o recrutador lê.
- O que compensa o risco é o freio que já existe antes do merge (Reviewer, CI, base `main`, [[ADR-006-merge-por-agentes]]) e o fato de o projeto não ter venda nem dado de cliente real. Isso reduz o dano de um erro, mas não o torna zero: por isso o aceite do Diego, o banco de preview separado e as migrations fora do deploy.

## Alternativas consideradas

- **Deploy manual** (o Devops dispara depois de cada merge): mais controle, mas é mais um passo que a banda esquece, e o site fica atrás da `main`.
- **Branch `producao` separada**, promovida por PR: isola o que vai ao ar, mas dobra o número de merges e de PRs sem ganho para um projeto sem usuário real.

## Consequências

- Todo merge na `main` publica, inclusive os de docs (o build de docs só não muda nada visível). Merge ruim vai ao ar: o freio é o Reviewer e o CI.
- Migrations de banco **não** rodam sozinhas no deploy: aplicar em produção continua sendo ação do Devops com ok do Diego (migration em produção é item 5 da política).
- Os limites do Hobby valem: 100 deploys por dia e 45 minutos de build por deploy ([[ADR-005-monorepo-camadas]]); cron diário com imprecisão de até 59 minutos e uso pessoal e não comercial ([[ADR-002-hospedagem-api]]). Se o projeto virar operação real, sobe para o plano Pro, e este ADR é revisto num ADR novo.
- Preview por PR gera endereços públicos: o preview não pode apontar para o banco de produção nem expor segredo (o aviso de trace público do #333 vale também aqui).
