---
status: proposto
data: 2026-10-28
card-notion: https://app.notion.com/p/3fd490a7ac7d81098f0ecd9094ae8840
tags:
  - adr
---

# ADR-002: Hospedagem gratuita da API NestJS no MVP

> [!info] Status
> **Proposto.** Resultado do spike LB-121 (pesquisar hospedagem gratuita para a API). Aguarda aprovação do Diego. Complementa o [[ADR-001-stack]].

## Contexto

- A API NestJS precisa de hospedagem **gratuita** (restrição do projeto, ver [[visao]]).
- Decisão do Diego para o MVP: **nenhum processo de longa duração**. Sem BullMQ, Redis, WebSocket ou workers.
  - O e-mail é enviado de forma síncrona pela API HTTP do provedor.
  - Tarefas agendadas, se houver, rodam pelo cron da plataforma.
  - BullMQ, Redis e WebSocket ficam para o Pós-MVP (ver [[mvp-corte]]).
- O banco é o Postgres do Supabase, acessado via Prisma (ver [[ADR-001-stack]]).
- O front já vai para a Vercel.
- Fontes consultadas em **2026-10-28**; os limites de plano gratuito mudam com frequência.

## Opções avaliadas

| Critério | **Vercel Functions (Hobby)** | **Render (Free web service)** | Railway (Free) | Koyeb |
| --- | --- | --- | --- | --- |
| Plano gratuito | Sim, uso **pessoal e não comercial** | Sim, 750 h de instância/mês por workspace | US$ 1 de crédito/mês; 1 vCPU / 0,5 GB por serviço | Página de preços não mostra plano gratuito para web services |
| Limites principais | 1 milhão de invocações, 4 h de Active CPU, 360 GB-h de memória, 100 GB de transferência por mês; até 300 s por execução | Sem disco persistente; 1 instância; Render pede para não usar o Free em produção | A RAM custa US$ 10/GB/mês, então o crédito cobre cerca de 0,1 GB-mês: insuficiente para uma API sempre ligada | — |
| Cold start / hibernação | Cold start por instância de função; o NestJS recomenda bundle com webpack e cachear a instância do app entre invocações | **Hiberna após 15 min sem tráfego**; volta em **cerca de 1 min** (o navegador vê uma tela de espera) | Não documentado na página consultada | — |
| Cron | Até 100 por projeto, mas no Hobby **no máximo 1 vez por dia**, com precisão de **±59 min** | Cron jobs não estão entre os serviços com instância Free | — | — |
| Prisma + Supabase | Pooler em modo transação (porta 6543, `pgbouncer=true`) em `DATABASE_URL` e conexão de sessão/direta (5432) em `DIRECT_URL` para migrations, como recomenda o Supabase | Igual (processo Node comum; pode usar a conexão de sessão) | Igual | — |
| Pooling | Obrigatório usar o pooler do Supabase, porque cada instância de função abre conexões | Uma instância só; pooling menos crítico | — | — |
| Deploy | Mesmo provedor e mesmo repositório do front (um projeto Vercel para `web` e outro para `api`); preview por PR | Serviço separado, conectado ao GitHub | — | — |
| Custo se crescer | Pro a partir de US$ 20 por usuário/mês, com cron por minuto e duração de até 800 s | Planos pagos de instância (não consultados em detalhe) | Hobby a partir de US$ 5/mês | Pro a partir de US$ 29/mês + uso |

## Decisão (proposta)

Hospedar a API NestJS como **função serverless na Vercel (plano Hobby)**, num projeto Vercel separado do front, no mesmo repositório.

- **Banco:** `DATABASE_URL` aponta para o pooler do Supabase em modo transação (porta 6543, `pgbouncer=true`) e `DIRECT_URL` para a conexão usada nas migrations.
- **Bootstrap:** o app NestJS é criado uma vez por instância e reaproveitado entre invocações, com bundle em webpack, como recomenda a documentação do NestJS.
- **Cancelar pedidos com Pix expirado (LB-60):** o cron do Hobby roda só uma vez por dia e com imprecisão de ±59 min, o que não atende a validade de 30 min do Pix. A expiração é verificada **sob demanda**: ao ler o pedido, ao receber o webhook e antes de reservar estoque. Um **cron diário** faz a limpeza do que sobrar.
- **E-mail transacional:** chamada síncrona à API HTTP do provedor, fora da transação do banco.
- **Manter o Supabase ativo:** o mesmo cron diário da Vercel também executa uma consulta leve no banco (por exemplo, `SELECT 1` via Prisma). Assim o projeto do Supabase Free não é pausado por inatividade, o que importa num portfólio que recrutadores podem abrir a qualquer momento.
  - O Supabase considera inativo o projeto Free que "não recebe atividade de usuário suficiente no banco ao longo da última semana" e diz que algumas requisições por dia normalmente bastam, **sem garantia**.
  - Se uma consulta diária não for suficiente, dá para cadastrar mais crons diários em horários diferentes: o Hobby permite até 100 por projeto, cada um no máximo uma vez por dia.

### Por que não as outras

- **Render Free:** a hibernação após 15 min, com cerca de 1 min para voltar, prejudica a demo para recrutadores e arrisca timeouts nos webhooks de pagamento. O plano Free também não tem cron, e o próprio Render desaconselha o Free em produção.
- **Railway Free:** o crédito de US$ 1/mês não sustenta uma API sempre ligada.
- **Koyeb:** não há plano gratuito para web services na página de preços atual.
- **Fly.io:** não avaliado neste spike.

## Consequências

- **Positivas:**
  - Um único provedor para front e API, com preview por PR nos dois.
  - Sem servidor para manter nem hibernação de serviço inteiro.
  - Escala a zero sem custo.
- **Negativas / riscos:**
  - O Hobby é só para uso **pessoal e não comercial**. Serve para o portfólio; uma operação real da cervejaria exigiria o plano Pro.
  - Cron apenas diário: a expiração do Pix precisa ser verificada sob demanda (afeta a spec de LB-60).
  - Cold start nas primeiras requisições após inatividade.
  - Logs de runtime guardados por só 1 hora no Hobby.
  - O projeto Supabase Free é pausado quando não recebe atividade suficiente no banco ao longo de uma semana. O cron diário com consulta leve reduz esse risco, mas o Supabase não garante que algumas requisições por dia bastem.
    - Antes da pausa, o dono recebe um e-mail de aviso, cerca de uma semana antes.
    - Um projeto pausado pode ser restaurado por até 1 ano.
    - O dono do projeto precisa ficar atento a esse e-mail.
  - BullMQ, Redis, WebSocket e workers seguem fora do MVP. Voltar a eles no Pós-MVP exigirá rever este ADR.

> [!todo] Diego: aprovar ou ajustar este ADR (mudar `status` para `aceito`). Se aprovado, atualizar a spec de LB-60 com a expiração sob demanda.

## Fontes (consultadas em 2026-10-28)

- Vercel, Limits: https://vercel.com/docs/limits (atualizada em 2026-09-16)
- Vercel, Hobby Plan: https://vercel.com/docs/plans/hobby (atualizada em 2026-09-14)
- Vercel, Usage & Pricing for Cron Jobs: https://vercel.com/docs/cron-jobs/usage-and-pricing (atualizada em 2026-07-15)
- NestJS, Serverless: https://docs.nestjs.com/faq/serverless
- Supabase, Prisma: https://supabase.com/docs/guides/database/prisma
- Supabase, Pricing: https://supabase.com/pricing
- Supabase, Project Pausing: https://supabase.com/docs/guides/platform/free-project-pausing (consultada em 2026-10-28; a página não mostra data de atualização)
- Render, Deploy for Free: https://render.com/docs/free
- Railway, Pricing: https://railway.com/pricing e https://docs.railway.com/reference/pricing/plans
- Koyeb, Pricing: https://www.koyeb.com/pricing
