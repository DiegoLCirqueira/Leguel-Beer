---
status: rascunho
modulo: infra
card-notion:
prioridade: P0
criado: 2026-11-26
issues:
  - "#17 LB-8"
  - "#8 LB-122"
tags:
  - feature
---

# API na Vercel: entrada serverless

> [!info] Origem
> Nota técnica do Devops no #365 (26/11): a API só tem `src/main.ts`, que sobe um servidor e escuta a porta 3333; **não há entrada serverless** para a Vercel. Sem ela, o primeiro deploy do projeto `leguele-api` ([[ADR-021-merge-vira-deploy-na-vercel]]) não funciona. É o que o [[ADR-002-hospedagem-api]] já decidiu (função serverless, aplicativo NestJS criado uma vez por instância e reaproveitado entre invocações, bundle em webpack); esta spec só descreve o comportamento e as fatias. Os ADRs não são editados: esta nota é o registro.

## História de usuário

- **Como** quem abre o site publicado (recrutador, cliente)
- **Quero** que a API responda na Vercel como responde no meu computador
- **Para** que o portfólio funcione de verdade depois do deploy

## Cenários

```gherkin
# language: pt
Funcionalidade: API como função serverless na Vercel

  Cenário: Primeira chamada depois de inatividade (cold start)
    Dado que a função da API está fria
    Quando chega a primeira requisição "GET /health"
    Então a API cria o aplicativo uma vez e responde 200
    E a resposta chega em até 10 segundos

  Cenário: Chamadas seguintes reaproveitam o aplicativo
    Dado que a função já atendeu uma requisição
    Quando chegam mais duas requisições na mesma instância
    Então o aplicativo não é criado de novo
    E as duas respondem normalmente

  Cenário: CORS só para o endereço do site
    Dado que WEB_ORIGIN é "https://leguele-web.vercel.app"
    Quando uma requisição chega com origem "https://leguele-web.vercel.app"
    Então a resposta permite essa origem
    E uma requisição com origem "https://outro-site.example" não recebe permissão de CORS

  Cenário: O limite de requisições enxerga o IP do visitante
    Dado que a API está atrás do proxy da Vercel
    Quando duas requisições chegam com "X-Forwarded-For" de IPs diferentes
    Então cada IP tem o seu próprio limite
    E um IP não esgota o limite do outro

  Cenário: Cron só com o segredo
    Dado que CRON_SECRET está configurado
    Quando "GET /cron/expirar-pedidos" chega sem o cabeçalho "Authorization: Bearer <segredo>"
    Então a API responde 401 e não expira nenhum pedido
    E com o segredo certo ela expira os pedidos vencidos e responde 200

  Cenário: Produção sem a configuração obrigatória falha cedo
    Dado o ambiente de produção sem WEB_ORIGIN
    Quando a função inicia
    Então ela recusa subir com um erro claro e não usa "http://localhost:3000"
```

## Regras de negócio

- **Entrada serverless** da API (por exemplo `apps/api/api/index.ts`, o nome é do Back): cria o aplicativo NestJS **uma vez por instância**, guarda a promessa em memória e a reaproveita; entrega a requisição ao Express do Nest. Não chama `listen` nem `process.loadEnvFile`: as variáveis vêm do ambiente da plataforma. `main.ts` continua sendo a entrada de desenvolvimento e do CI.
- **Mesma configuração** nas duas entradas: `setupApp` (Helmet, CORS, Swagger) é a função compartilhada; a entrada serverless a chama, sem copiar. O logger e os filtros globais são os mesmos.
- **CORS** com `WEB_ORIGIN` como origem única. Em **produção, `WEB_ORIGIN` é obrigatório** (hoje o padrão `http://localhost:3000` valeria e bloquearia o site em silêncio); em desenvolvimento o padrão continua. Previews do site têm endereços próprios: o preview da API (se ligado, [[ADR-021-merge-vira-deploy-na-vercel]]) usa o endereço do preview do site em `WEB_ORIGIN`; origem com curinga fica fora.
- **Trust proxy:** a API fica atrás do proxy da Vercel, então ela confia no primeiro salto (`trust proxy` com 1) para que o limite global por IP e o limite por conta ([[qualidade-compra]]) usem o IP do visitante e não o do proxy. Sem isso, todos os visitantes dividiriam um só balde. Fora da Vercel (desenvolvimento, CI) o padrão não muda.
- **Cron:** o `vercel.json` do projeto `leguele-api` declara o cron diário de `GET /cron/expirar-pedidos` (já no #365); a rota exige `Authorization: Bearer <CRON_SECRET>` (segredo só como variável da plataforma) e recusa com 401 sem segredo ou com segredo errado, como já faz hoje.
- **Contagem em memória por instância:** o limitador global e o por conta guardam a contagem na instância; com várias instâncias o limite é **aproximado** (mesma ressalva do #200). Aceito no portfólio.
- **Prisma e banco:** `DATABASE_URL` aponta para o pooler em modo transação e `DIRECT_URL` só para migrations ([[ADR-002-hospedagem-api]]); migrations **não** rodam no deploy ([[ADR-021-merge-vira-deploy-na-vercel]]). Sem banco de produção ainda, o deploy só prova o `/health` e a rota de cron fechada.
- **Bundle:** o build da função empacota o que a Vercel não instala sozinha (o `@leguele/shared` compilado e o Prisma Client gerado); o `postinstall` ou o passo de build roda `prisma generate`. O Back escolhe a ferramenta (webpack como no ADR-002, ou o bundler da própria Vercel) com um teste que prova que a função sobe.

## Fora de escopo

- Criar a conta, ligar a Vercel ao GitHub, o primeiro deploy e o banco de produção (do Diego, [[ADR-021-merge-vira-deploy-na-vercel]]).
- Cache distribuído do limite de requisições, fila e qualquer processo de longa duração (MVP sem Redis, [[ADR-002-hospedagem-api]]).
- O site (`leguele-web`) na Vercel.

## Seams de teste

> [!info] Proposta do Spec, vetável

- **Cold start e reaproveitamento** (API, unitário): a função de entrada, chamada duas vezes, cria o aplicativo uma vez (contador no `create`); a primeira chamada responde o `/health` em Supertest sem `listen`.
- **CORS e trust proxy** (Supertest sobre o app montado pela entrada serverless): origem permitida e negada; dois `X-Forwarded-For` diferentes têm limites separados; um só IP é recusado acima do limite.
- **Cron** (Supertest): sem cabeçalho e com segredo errado, 401; com o segredo, 200 (o caso de uso já tem testes).
- **Produção sem `WEB_ORIGIN`** (unitário): a função recusa subir; em desenvolvimento usa o padrão.
- **Fumaça do deploy** (Devops, depois do primeiro deploy, fora do CI): `GET /health` responde 200 no endereço da Vercel e `GET /cron/expirar-pedidos` sem segredo responde 401.

## Fatias, com dono e ordem

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | LB-122 (#8) | Back | Entrada serverless que cria o aplicativo uma vez, com `setupApp` compartilhada, `trust proxy` de 1 salto e `WEB_ORIGIN` obrigatório em produção; testes dos cenários acima |
| 2 | LB-122 (#8) | Back e Devops | Bundle e build da função (`@leguele/shared`, Prisma Client), com o teste de que a função sobe; `vercel.json` do `leguele-api` com a rota da função e o cron |
| 3 | LB-8 (#17) | Devops | Variáveis do `leguele-api` na plataforma e a fumaça do primeiro deploy, **só com a ação do Diego** (ligação ao GitHub e primeiro deploy) |

A 1 vem antes da 2; a 3 só depois de o Diego ligar a Vercel e de existir banco de produção.

Candidatos a ADR: nenhum, a menos que o Back troque o webpack do [[ADR-002-hospedagem-api]] por outro bundler (decisão que surpreende e seria difícil de reverter: vira ADR novo, sem editar o 002).

## Decisões relacionadas

- [[ADR-002-hospedagem-api]], [[ADR-021-merge-vira-deploy-na-vercel]], [[ADR-005-monorepo-camadas]], [[qualidade-compra]], [[api-base]]

## Decisões tomadas sem consulta

Recomendações do Spec em 26/11; qualquer uma pode ser vetada.

- **`WEB_ORIGIN` obrigatório em produção**, em vez do padrão local (evita o site bloqueado em silêncio).
- **`trust proxy` com 1 salto**, para o limite por IP funcionar atrás da Vercel.
- **Spec própria** em vez de nota no ADR, porque ADR aceito não é editado.
