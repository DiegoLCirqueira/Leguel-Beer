---
status: rascunho
modulo: base-tecnica
card-notion: https://app.notion.com/p/3fd490a7ac7d819d80f6f048f08cfd42
prioridade: P0
criado: 2026-10-29
atualizado: 2026-10-29
issues:
  - "#5 LB-119"
tags:
  - feature
---

# Testes da API em três níveis

> [!info] Origem
> Derivada do card do Notion **LB-119** (#5), ajustada a duas decisões já tomadas: **Vitest** em vez de Jest (Complemento do [[ADR-005-monorepo-camadas]] e [[base-monorepo]], que já entregou Vitest + Supertest em `apps/api`) e **banco separado no Postgres local + service container no CI**, sem Testcontainers ([[ADR-007-banco-de-teste]]). É a etapa 3 da fase 1 do [[roteiro-mvp]], ao lado de [[api-base]] e [[contratos-compartilhados]].

## História de usuário

- **Como** pessoa que desenvolve a API com TDD
- **Quero** testes de unidade, de integração com banco real e de HTTP, cada um com seu comando
- **Para** escrever o teste antes do código com retorno rápido e confiar no banco de verdade quando ele importa

## Cenários

```gherkin
# language: pt
Funcionalidade: Testes da API em três níveis

  Cenário: Testes de unidade rodam sem banco
    Dado o Supabase local parado
    Quando executo "pnpm test" na raiz
    Então os testes de unidade de domain e application da API passam
    E nenhum deles tenta abrir conexão com o banco

  Cenário: Integração com banco real
    Dado o Supabase local rodando
    Quando executo o comando de testes de integração da API
    Então as migrations do Prisma são aplicadas no banco de teste
    E os testes de integração passam
    E o banco de desenvolvimento continua com os mesmos dados de antes

  Cenário: Um teste não enxerga os dados do outro
    Dado dois testes de integração que gravam um registro com o mesmo identificador único
    Quando rodam em sequência
    Então os dois passam
    E nenhum deles encontra o registro gravado pelo outro

  Cenário: Banco de teste fora do ar falha com mensagem clara
    Dado o Supabase local parado
    Quando executo o comando de testes de integração da API
    Então o comando termina com código diferente de 0
    E a saída diz que o banco de teste não respondeu e como subi-lo
    E nenhum teste é marcado como pulado

  Cenário: Cobertura abaixo do mínimo falha no CI
    Dado que a cobertura de linhas de domain e application da API está abaixo de 80%
    Quando o CI roda os testes
    Então o job falha
    E a saída mostra a cobertura medida e o mínimo exigido
```

## Regras de negócio

- **Três níveis**, com comandos separados em `apps/api` e tarefas no Turborepo:
  - **Unidade:** domínio e casos de uso, sem Nest e sem banco, com repositórios em memória. Rodam no `pnpm test` da raiz, como hoje.
  - **Integração:** repositórios Prisma e consultas contra o banco de teste. Comando próprio (ex.: `test:integration`); não entra no `pnpm test` para ele continuar rápido e sem Docker.
  - **HTTP:** rotas com Supertest sobre a aplicação Nest. As que não tocam o banco ficam na unidade; as que tocam ficam na integração.
- **Banco de teste:** conforme [[ADR-007-banco-de-teste]]. A conexão vem de uma variável própria (ex.: `TEST_DATABASE_URL`), listada sem valor no `.env.example`; o comando recusa rodar se ela apontar para o mesmo banco de `DATABASE_URL`.
- **Isolamento:** cada teste de integração começa com o banco limpo (transação revertida ou limpeza das tabelas, a escolher na implementação).
- **Factories** de dados de teste por módulo, para não repetir montagem de registros.
- **Tokens de teste:** um helper gera JWT de cliente, de admin, expirado e de assinatura adulterada, assinados com uma chave só de teste, para os testes de [[guards-api]].
- **Cobertura:** mínimo de 80% de linhas em `domain` e `application` da API, verificado no CI.
- **CI:** um job de integração com Postgres como *service container*, na mesma versão major do Supabase CLI. Os E2E que precisam do Supabase Auth (cadastro, login, recuperação de senha) sobem o Supabase CLI no job de E2E do CI.

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego

- **Cada nível** começa com um teste de fumaça que falha antes da configuração existir (red), como pede o card.
- **Recusa de banco igual ao de desenvolvimento:** teste unitário da função que compara as duas conexões.
- **Cobertura:** provada com o limite temporariamente acima da cobertura real (o job tem que falhar).

## Fora de escopo

- Jest e Testcontainers (substituídos por Vitest e [[ADR-007-banco-de-teste]]).
- Testes de carga.
- E2E do site (Playwright, LB-6, #15), que já existe em fumaça desde o [[base-monorepo]].

## Decisões relacionadas

- [[ADR-005-monorepo-camadas]], [[ADR-007-banco-de-teste]], [[base-monorepo]]
- [[api-base]]: banco local e formato de erro.
- [[guards-api]]: usa os tokens de teste.

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, pela política de autonomia. Qualquer uma pode ser vetada.

- **Integração fora do `pnpm test`:** o comando padrão continua rápido e sem Docker.
- **Recusar `TEST_DATABASE_URL` igual a `DATABASE_URL`:** protege o banco de desenvolvimento.
- **Supabase CLI no job de E2E do CI:** os fluxos de acesso precisam do Supabase Auth de verdade; os runners do GitHub Actions têm Docker.
- **Cobertura por linhas:** o card diz só "80%".

## Tickets propostos

| Issue | Ajuste proposto | Motivo |
| --- | --- | --- |
| #5 LB-119 | Título: "[LB-119] Configurar testes da API com Vitest, Supertest e banco de teste". Link para esta spec; critérios: os 5 cenários; [[ADR-007-banco-de-teste]] no lugar de Testcontainers; helper de tokens de teste | O card cita Jest e Testcontainers, trocados por decisões já registradas |
