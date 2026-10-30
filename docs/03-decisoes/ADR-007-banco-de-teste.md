---
status: aceito
data: 2026-10-29
tags:
  - adr
---

# ADR-007: Banco dos testes de integração

> [!info] Status
> **Aceito.** Decisão técnica do Orchestrator em 2026-10-29, dentro da política de autonomia. Resolve o item "banco local e de CI para os testes de integração" que estava **a confirmar** no Complemento do [[ADR-005-monorepo-camadas]].

## Contexto

Os testes de integração da API (repositórios Prisma, rotas com banco real) precisam de um Postgres. O Complemento do [[ADR-005-monorepo-camadas]] deixou em aberto qual banco usar no local e no CI. Em 2026-10-29 ficou decidido que o desenvolvimento usa o Supabase local, com Supabase CLI e Docker, e que o projeto Supabase na nuvem só entra no LB-8 ([[api-base]]). Os cards do Notion (LB-3, LB-118, LB-119) citam Testcontainers.

## Decisão

- **Local:** os testes de integração usam um **banco separado** (ex.: `leguele_test`) no mesmo Postgres do Supabase CLI. O banco de desenvolvimento nunca é apagado pelos testes.
- **CI:** um **Postgres como *service container*** do GitHub Actions, na mesma versão major do Postgres do Supabase CLI.
- **Sem Testcontainers.**
- Os testes recebem a conexão pela variável de ambiente do banco de teste; as migrations do Prisma são aplicadas nesse banco antes da suíte.
- Testes que precisam do Supabase Auth (E2E de cadastro, login e recuperação de senha) rodam contra o Supabase local completo; como isso entra no CI fica para o LB-119 (#5).

## Alternativas consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **Banco separado no Postgres local + service container no CI** (escolhida) | Reaproveita o Postgres que já está rodando no local; o service container é gratuito e simples no GitHub Actions; nada novo para instalar | Local e CI sobem o Postgres de formas diferentes; é preciso manter as versões iguais |
| Testcontainers | Um Postgres limpo por suíte, igual no local e no CI | Mais uma dependência; suíte mais lenta (sobe container a cada execução); no Windows depende do Docker Desktop exposto para a biblioteca |
| Usar o banco de desenvolvimento | Nenhuma configuração extra | Testes apagam e sujam os dados de desenvolvimento |
| Projeto Supabase Free só para testes | Igual à produção | Depende de rede e do limite de projetos do plano gratuito; projeto pausa sem uso |

## Consequências

- **Positivas:** testes de integração rápidos, sem custo e sem rede; o banco de desenvolvimento fica intacto.
- **Negativas:** duas formas de subir o Postgres (Supabase CLI no local, service container no CI), com a versão major mantida igual à mão; os cards LB-3, LB-118 e LB-119 citam Testcontainers e precisam ser reconciliados.

## Relacionados

- [[ADR-005-monorepo-camadas]]: Complemento, item 3 (banco para testes de integração).
- [[api-base]]: banco local com Supabase CLI.
