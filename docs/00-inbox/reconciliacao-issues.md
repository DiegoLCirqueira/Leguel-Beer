---
tags: [inbox, backlog]
criado: 2026-11-21
---

# Reconciliação das issues do MVP (21/11)

Auditoria das issues abertas do milestone "MVP" contra a `main` (log, specs, código e testes), por ordem do Diego e com a aprovação permanente para reconciliar issue com o que já está mergeado ([[issue-tracker]]). Nada foi fechado por palpite: cada fechamento cita os PRs e foi conferido no código ou no teste. Os dados vêm do GitHub em 21/11, depois do #345.

## Fechadas (14)

| Issue | Card | Entregue em | Conferido em |
| --- | --- | --- | --- |
| #40 | LB-25 cadastro e login | #153, #154, #162, #165, #167 | páginas `/criar-conta`, `/entrar`, `/conta`; E2E `criar-conta`, `acesso`, `sessao` |
| #42 | LB-27 recuperação de senha | #173, #176 | `/recuperar-senha`, `/nova-senha`; E2E `recuperar-senha` |
| #46 | LB-31 login ao finalizar | #165, #325 | `/checkout` exige conta e volta; E2E `checkout-entrega` |
| #22 | LB-33 filtro por categoria | #210, #216, #221, #345 | E2E `catalogo`, `home-faixa-de-categorias` |
| #24 | LB-35 adicionar do card | #292 (sobre #247) | E2E `adicionar-a-geladeira` |
| #27 | LB-38 esgotadas | #216, #218, #221 | `card-cerveja.spec`, `catalogo.spec` |
| #82 | LB-40 ficha da cerveja | #223, #233, #240 | E2E `produto` |
| #83 | LB-41 desconto | #223, #225, #240 | teste da página de produto |
| #61 | LB-124 imagens das garrafas | #249, #267, #277 | 16 arquivos `.webp` em `apps/web/public/cervejas` |
| #32 | LB-56 criar pedido, reserva atômica | #270, #300, #302, #304 (ADR-019) | testes de unidade e `prisma-order-creation.integration.test.ts` |
| #36 | LB-60 expirar pedidos | #279, #317, #340 | `expire-due-orders.test.ts`, `expire-order.test.ts`, cron |
| #48 | LB-62 spike de mapas | #261 | [[spike-lb-62-geocodificacao-rota]] |
| #7 | LB-121 hospedagem da API | ADR-002 | [[ADR-002-hospedagem-api]] |
| #52 | LB-66 frete grátis a partir de R$ 150 | #271, #293, #320 | `packages/shared/src/entrega/frete.test.ts` |

### Critérios que estavam desmarcados nas fechadas (conferido em 26/11)

Das 14 fechadas, quatro tinham caixas desmarcadas no corpo: #40, #22, #24 e #27. Todas foram conferidas contra o código e comentadas nas issues; nenhuma foi reaberta.

- **#22, #24 e #27:** critérios cumpridos, com os E2E e testes citados no comentário (`catalogo.spec.ts`, `home-faixa-de-categorias.spec.ts`, `adicionar-a-geladeira.spec.ts`, `catalog.controller.integration.test.ts`).
- **#40:** "Termos abertos não apagam o formulário" cumprido (`criar-conta.spec.ts`); "Contrato quebrado aparece no typecheck" cumprido por construção (site e API importam o mesmo schema; o CI roda o typecheck; sem teste dedicado); "hook do perfil com TanStack Query" dispensado (o site não busca o perfil no navegador), registrado em [[contratos-compartilhados]] como recomendação vetável do Spec.

## Mantidas abertas, com comentário do que falta

| Issue | Card | Já na `main` | Falta |
| --- | --- | --- | --- |
| #44 | LB-29 perfil e data de nascimento | contrato (#295), API de perfil (#297) | tela de dados pessoais no site |
| #45 | LB-30 endereços com CEP | CRUD (API, mapas fake), limite (#298), #294, #303, #315 (ViaCEP) | adaptador real de mapas para geocodificar |
| #49 | LB-63 frete por distância | função de frete, cotação (#293), resumo (#320) | adaptador real de rota |
| #50 | LB-64 raio de 25 km | regra de raio e tela 29 (#293, #325) | distância real de rota |
| #98 | LB-20 bloquear menores | regra (#295), data (#297), recusa no pedido (#300) | tela da data (#44) e aviso na Revisão |
| #31 | LB-55 checkout em etapas | Entrega (#325, #334), Pagamento com Pix (#342) | cartão, Revisão, criar pedido no site, revalidação |
| #33 | LB-57 Pix | escolha do Pix e aviso de portfólio (#342) | tela do Pix e "Pagamento em análise" |
| #34 | LB-58 cartão em até 12x | nada além da escolha em #342 | cartão com parcelas; o título (juros a partir da 3ª) continua válido |
| #37 | LB-61 pedido confirmado | API de confirmar pagamento (#337) | a tela |
| #72 | LB-72 layout do admin | `/admin` protegido (#165, #190), página mínima | layout, menu e alertas |
| #76 | LB-76 pedidos no admin | rota confirmar pagamento (#337) | fila, detalhe, transições, cancelar |
| #11 | LB-2 padrões de código | ESLint, Prettier, dependency-cruiser | Husky, lint-staged, Commitlint, jsx-a11y, Tailwind no Prettier |
| #14 | LB-5 testes de unidade | Vitest e Testing Library, cobertura da API no CI | MSW, `renderWithProviders` |
| #15 | LB-6 Playwright | dezenas de E2E em celular | playwright-bdd, `.feature`, projeto desktop |
| #16 | LB-7 CI | `ci.yml` completo, `db:check` | Dependabot, filtro por mudança, artefatos, proteção da `main` (do Diego) |

## Mantidas abertas, sem mudança (não iniciadas ou em andamento)

- #73 (LB-73 cervejas no admin), #75 (LB-75 estoque), #77 (LB-77 entrega no admin): sem código; specs em [[admin]].
- #103 (LB-81 e-mails): só a spec, [[email-pedido]]; provedor pendente do Diego.
- #108 (LB-67 histórico de pedidos): sem código; spec em [[pedidos-cliente]].
- #90 (LB-111) e #91 (LB-112): specs em [[qualidade-compra]]; os testes entram nas fatias.
- #8 (LB-122 API em produção) e #17 (LB-8 Vercel): com o Devops, autorizado pelo Diego em 21/11.
- Épicos (#2, #9, #20, #29, #38, #47, #53, #62, #71, #81, #89, #96, #102, #107): ficam abertos até as filhas fecharem.

## Textos que mudaram com a spec

Nenhum título nem corpo precisou mudar: #33 e #34 já tinham a reconciliação do pagamento só visual (#290, #305; [[ADR-018-pagamento-simulado]] substituído pelo [[ADR-020-aviso-de-portfolio-no-pagamento]]), e o texto "juros a partir da 3ª parcela" de #34 ainda vale para a tela (1x e 2x sem juros, 3x a 12x com 2,99% a.m., só visual).

## Para o Orchestrator

- O adaptador real de mapas (#45, #49, #50) é a pendência técnica que sobra do frete. Com o projeto de portfólio, o Diego tirou o Geoapify das pendências; decidir se o MVP fica com o fake (e o modo "não configurado") ou se ainda se quer a distância real.
- Os cards do Notion não foram alterados aqui (o Orchestrator mantém o Notion, [[issue-tracker]]).
