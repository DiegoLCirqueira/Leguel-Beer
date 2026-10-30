---
status: rascunho
modulo: base-tecnica
card-notion: https://app.notion.com/p/3fd490a7ac7d812d82c8d2d5efc3c72b
prioridade: P0
criado: 2026-10-29
atualizado: 2026-10-29
issues:
  - "#12 LB-3"
  - "#3 LB-117"
  - "#4 LB-118"
tags:
  - feature
---

# Base da API: banco local, erros padronizados e camadas

> [!info] Origem
> Derivada dos cards do Notion **LB-3** (#12, Postgres local e Prisma com migrations), **LB-117** (#3, validação, erros padronizados e Swagger) e **LB-118** (#4, arquitetura em camadas e template de módulo), ajustados a duas decisões de 2026-10-29: o acesso é a primeira entrega ([[roteiro-mvp]]) e o Supabase roda **local** no desenvolvimento, com Supabase CLI e Docker (decisão do Orchestrator, autorizada pelo Diego); o projeto Supabase na nuvem fica para o LB-8 (#17). Parte do que o LB-117 descreve já veio com o [[base-monorepo]] (LB-1): o NestJS em `apps/api` e o `GET /health` simples.

## História de usuário

- **Como** pessoa que desenvolve a API da Leguelé Beer
- **Quero** banco local com migrations, erros num formato único, documentação viva e um padrão de módulo em camadas
- **Para** começar os módulos de negócio, a começar pela conta ([[cadastro-login]]), sem reinventar a base em cada um

## Cenários

```gherkin
# language: pt
Funcionalidade: Base da API

  Cenário: Banco local do zero
    Dado um clone novo do repositório com Docker rodando
    Quando sigo o README para subir o Supabase local e executo o comando de reset do banco
    Então todas as migrations do Prisma são aplicadas
    E o seed roda sem erro
    E GET http://localhost:3333/health responde com status 200

  Cenário: Mudança no schema sem migration falha no CI
    Dado uma alteração no schema do Prisma sem a migration correspondente
    Quando o CI roda a verificação de divergência entre schema e migrations
    Então o job falha
    E a saída pede a criação da migration

  Esquema do Cenário: Health check informa o estado do banco
    Dado a API no ar e o banco <estado>
    Quando chamo GET /health
    Então a resposta tem status <status>
    E o corpo informa o banco como <banco>

    Exemplos:
      | estado      | status | banco  |
      | no ar       | 200    | "up"   |
      | fora do ar  | 503    | "down" |

  Cenário: Entrada inválida tem erro padronizado
    Dado um endpoint que espera o corpo { "quantidade": número }
    Quando envio { "quantidade": "abc" }
    Então a resposta tem status 400
    E o corpo tem code "VALIDATION_ERROR", uma message e, em details, o campo "quantidade" com o motivo

  Cenário: Erro inesperado não vaza detalhes
    Dado um endpoint que lança uma exceção não tratada
    Quando faço uma requisição a ele
    Então a resposta tem status 500 com code "INTERNAL_ERROR" e uma mensagem genérica
    E o corpo não contém stack trace nem a mensagem original da exceção
    E o log registra o erro com o mesmo id de requisição devolvido no cabeçalho x-request-id

  Esquema do Cenário: Camadas só dependem para dentro
    Dado um arquivo na pasta <camada> de um módulo de apps/api que importa um arquivo de <proibida>
    Quando executo "pnpm lint" na raiz
    Então o comando termina com código diferente de 0
    E a saída do dependency-cruiser aponta o arquivo e a regra violada

    Exemplos:
      | camada         | proibida       |
      | domain         | application    |
      | domain         | infrastructure |
      | domain         | presentation   |
      | application    | infrastructure |
      | application    | presentation   |
```

## Regras de negócio

### Banco e Prisma (LB-3)

- **Desenvolvimento:** Postgres, Auth e Storage do Supabase rodam localmente com o Supabase CLI (Docker). A configuração do Supabase local (`supabase/config.toml`) vai para o git; nada de Docker Compose próprio.
- **Sem Redis:** o Redis do card sai do escopo; filas e cache são Pós-MVP ([[ADR-002-hospedagem-api]], [[mvp-corte]]).
- **Prisma** em `apps/api/prisma`, com schema, migrations e seed. O banco é acessado só pela API ([[ADR-001-stack]]).
- **Comandos** na raiz, documentados no README: subir e parar o Supabase local, aplicar migrations em desenvolvimento, reset do banco (aplica migrations e seed) e seed.
- **Seed:** nesta spec só precisa rodar sem erro; os dados de catálogo entram com o schema do catálogo (LB-4, #13).
- **Divergência:** o CI compara o schema do Prisma com as migrations e falha se faltar migration.
- **Serviço do Prisma** na camada `infrastructure`, com desligamento limpo (a API fecha a conexão ao encerrar).
- **Variáveis:** `DATABASE_URL` (conexão da aplicação) e `DIRECT_URL` (migrations), listadas sem valores em `.env.example` e descritas no CLAUDE.md, seção "Variáveis de ambiente". No local, as duas apontam para o Postgres do Supabase CLI.
- **Data API do Supabase (PostgREST):** desligada também no local, se o Supabase CLI permitir sem afetar o Auth. A confirmar na implementação; se não der, fica ligada só no local e o motivo vai para o README.

### API (LB-117)

- **Validação:** um pipe global valida a entrada com schemas Zod; schemas de contrato ficam em `packages/shared`.
- **Formato único de erro:** `{ code, message, details }`. `code` em maiúsculas com sublinhado (ex.: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `INTERNAL_ERROR`); `details` só existe quando há o que detalhar (ex.: campos inválidos).
- **Mensagens** de erro em pt-BR.
- **Logs** estruturados em JSON, com o id da requisição. A API usa o `x-request-id` recebido ou gera um, e devolve o mesmo valor no cabeçalho da resposta.
- **Health:** `GET /health` informa a API e o banco; 200 com tudo no ar, 503 com o banco fora. Continua sem autenticação.
- **Swagger** em `/docs`, com esquema de autenticação Bearer e tags por módulo. Todo endpoint novo aparece no Swagger.
- **Segurança básica:** helmet; CORS só para a origem do web (no local, `http://localhost:3000`); limite global de 100 requisições por minuto por IP (os limites das rotas de acesso ficam no Supabase Auth, com fonte única em [[cadastro-login]], "Limites de tentativa"); desligamento limpo (`enableShutdownHooks`). Pendência do handoff do LB-1.

### Camadas e template de módulo (LB-118)

- Camadas de [[ADR-005-monorepo-camadas]]: `domain` → `application` → `infrastructure` e `presentation`. `domain` não importa nada das outras camadas nem de framework; `application` importa só `domain`. Verificado pelo dependency-cruiser no `pnpm lint` (a regra de `domain` sem framework já existe desde o LB-1).
- Casos de uso testáveis sem Nest e sem banco, com repositórios em memória.
- Módulos simples (CRUD puro) podem ter domínio fino, sem casos de uso artificiais.
- **Template:** um documento curto "Como criar um módulo" no README da API, com a estrutura de pastas e um exemplo. O primeiro módulo de negócio a seguir o template é a conta ([[cadastro-login]]).

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada dos planos de teste dos cards.

- **Filtro de exceções:** teste unitário que transforma cada tipo de erro no formato `{ code, message, details }`.
- **Validação, erro inesperado e health:** Supertest contra a aplicação Nest; o health com banco fora usa uma porta de banco que falha.
- **Serviço do Prisma:** integração com banco real. No local, um banco de teste separado do banco de desenvolvimento, no mesmo Postgres do Supabase CLI; no CI, um Postgres como *service container* do GitHub Actions, na mesma versão major. O detalhe fica no LB-119 (#5).
- **Divergência de migrations e regras de camada:** provadas com um caso que deve falhar (red) antes de a regra existir.

## Fora de escopo

- Projeto Supabase na nuvem, conexão pelo pooler e variáveis de produção: LB-8 (#17).
- Redis e Docker Compose próprio.
- Módulo de referência do catálogo (`ListBeers`) e o value object `Money`: vão com o catálogo (LB-4, #13, e LB-36, #25), que vem depois do acesso no [[roteiro-mvp]].
- Tabelas de negócio: cada módulo traz as suas.
- Validação das variáveis de ambiente com Zod: LB-9 (#18, MVP+).
- RLS como camada principal de autorização (a autorização fica na API, ver [[guards-api]]).

## Decisões relacionadas

- [[ADR-001-stack]], [[ADR-002-hospedagem-api]], [[ADR-005-monorepo-camadas]], [[ADR-007-banco-de-teste]]
- [[base-monorepo]]: o que já existe em `apps/api`.
- [[guards-api]]: autenticação e papéis sobre esta base.

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, pela política de autonomia. Qualquer uma pode ser vetada.

- **Supabase CLI no lugar do Docker Compose:** decorre da decisão do Orchestrator (Supabase local) e evita duas formas de subir o banco.
- **Banco de testes:** banco separado no Postgres local e *service container* no CI, em vez de Testcontainers. Registrado no [[ADR-007-banco-de-teste]] (decisão técnica do Orchestrator).
- **Módulo de referência:** a conta, primeiro módulo da ordem do [[roteiro-mvp]], segue o template; `ListBeers` e `Money` vão com o catálogo.
- **Health:** 503 quando o banco está fora.
- **Limite global:** 100 requisições por minuto por IP.
- **Mensagens de erro em pt-BR** e `code` em inglês, em maiúsculas.

## Tickets propostos

Reconciliação com as issues migradas, a aplicar depois do merge desta spec.

| Issue | Ajuste proposto | Motivo |
| --- | --- | --- |
| #12 LB-3 | Link para esta spec; Supabase CLI local no lugar de Docker Compose; sem Redis; projeto na nuvem movido para #17 (LB-8) | Decisão de 2026-10-29 (Supabase local) e Redis fora do MVP |
| #3 LB-117 | Link para esta spec; critérios: cenários de entrada inválida, erro inesperado e health; 503 com banco fora; limite de 100/min; o que já veio no LB-1 marcado como feito | Parte do card já foi entregue no #123 |
| #4 LB-118 | Link para esta spec; critério: cenário de camadas; módulo de referência passa a ser a conta; `ListBeers` e `Money` movidos para #13/#25 | Ordem nova: acesso antes do catálogo |
| #17 LB-8 | Acrescentar: criar o projeto Supabase na nuvem, desligar a Data API e configurar `DATABASE_URL` (pooler) e `DIRECT_URL` | Saiu do LB-3 |
