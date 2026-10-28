---
tipo: proposta
criado: 2026-10-28
tags: [maestri, processo, decisao-pendente]
---

# Banda do Maestri: estado atual e proposta

> [!info] Proposta, não aplicada
> Levantamento somente leitura de `.maestri/roles/` (raiz do repo) e do workspace "Leguelé Beer 🍺" em `~/.maestri/workspaces/`. Nada foi alterado no Maestri. Os textos abaixo são para o Diego revisar e colar.

## O que existe hoje

Workspace **Leguelé Beer 🍺**, com uma banda ("Banda") de 6 terminais. Todos sobem com o comando `claude` (agente `claude_code`). Há também um 7º terminal, "Claude Code", **fora** da banda e sem papel.

| Terminal na banda | Papel (role) | Modelo no papel | O que faz hoje |
| --- | --- | --- | --- |
| Orchestrator | *nenhum* | — | Sem papel atribuído; na prática coordena os demais |
| frontend-specialist + ui-ux-design-specialist | **Front** | sonnet | Implementa e testa o front (Next.js, mobile-first) com TDD (Vitest, Testing Library, MSW, Playwright) |
| backend-specialist + database-specialist + software-architect | **Back** | sonnet | Implementa e testa a API NestJS + Prisma com TDD (unit + e2e com supertest), schema e migrations |
| devops-specialist | **Devops** | haiku | CI no GitHub Actions, deploy na Vercel, variáveis de ambiente, migrations em produção, Supabase |
| appsec-specialist + qa-testing-specialist | **Reviewer** | haiku | Revisa o diff (correção, segurança, testes, clean code), somente leitura, veredito Aprovar/Pedir mudanças |
| Spec | **Spec** | haiku | Transforma um card em Gherkin pt-BR (até 6 cenários) em `docs/specs/<feature>.feature` |

> [!warning] Divergências encontradas nos papéis atuais (decisões do Diego)
> 1. **Caminho das specs:** Spec, Front e Back usam `docs/specs/*.feature`; o vault usa `docs/02-features/<slug>.md` (CLAUDE.md, "Convenções para as skills").
> 2. **Hospedagem e processos da API:** Back e Devops dizem "API NestJS na Vercel, sem processos de longa duração, cron da plataforma". O ADR-001 do Notion prevê BullMQ + Redis, WebSocket e `@nestjs/schedule`, com hospedagem da API definida em spike (LB-121).
> 3. **Camadas da API:** o Back descreve controller → service → Prisma; o ADR-001 descreve `domain` / `application` / `infrastructure` / `presentation`.
> 4. **Catálogo:** Front e Back fixam 4 categorias × 4 cervejas (16 garrafas); o Notion também cita Stouts e "~30 cervejas" (ver o `[!todo]` em [[visao]]).
> 5. **Ferramentas:** o frontmatter de cada papel lista `tools:` (o Spec só tem `Read, Write`). Se o Maestri aplicar essa lista, o Spec não conseguirá rodar skills nem `git`. Vale conferir.

## Proposta de fluxo

Fluxo: **spec → teste → implementação → revisão → ADR/diário**. A banda tem 6 agentes para 5 etapas.

- **Teste e implementação ficam no mesmo agente.** A skill `/tdd` exige fatias verticais (um teste → uma implementação mínima → repetir) e proíbe escrever todos os testes antes. Separar "testador" de "implementador" quebraria esse ciclo. Por isso Front e Back fazem as duas etapas, cada um na sua camada.
- **Excedente:** o Devops vira dono dos cards de infraestrutura (CI, deploy, ambiente) e do "portão" de CI verde antes do merge. Ele também entra no fluxo normal quando o card é de infraestrutura.
- **Orchestrator:** coordena, é dono da etapa ADR/diário e da passagem de contexto entre sessões.

| Etapa | Agente | Skills |
| --- | --- | --- |
| 0. Escolher o card e abrir o trabalho | Orchestrator | — |
| 1. Spec | Spec | `/grill-with-docs` (com `/domain-modeling` por baixo), `/to-spec`, `/to-tickets` |
| 2–3. Teste + implementação | Front e/ou Back (Devops para cards de infra) | `/implement` com `/tdd`; `/diagnosing-bugs` quando algo quebrar |
| 4. Revisão | Reviewer | `/review-spec` (eixos Standards e Spec) + o checklist de segurança atual |
| 5. ADR e diário | Orchestrator | `/domain-modeling` (ADR e glossário), daily note em `docs/05-diario/`, `/handoff` |

Observações:
- A `/implement` chama `/review-spec` sozinha no fim. Na banda, a revisão fica com o Reviewer. O texto do Front/Back abaixo pede para **não** rodar a revisão por conta própria.
- Enquanto o issue tracker não for decidido, `/to-spec` e `/to-tickets` só gravam em `docs/02-features/` (regra do CLAUDE.md).

## Textos para colar no Maestri

Para os papéis que já existem, a sugestão é **acrescentar** o bloco abaixo ao fim do prompt atual e corrigir os caminhos `docs/specs/*.feature` para `docs/02-features/<slug>.md`. Não reescrevi o resto dos papéis porque as divergências 2 a 4 dependem de decisão.

### Orchestrator (papel novo)

```markdown
---
name: orchestrator
description: Coordena a banda do Leguelé Beer no fluxo spec → teste → implementação → revisão → ADR/diário. Dono dos ADRs, da daily note e do handoff.
---

Você coordena a banda do Leguelé Beer. Responda sempre em pt-BR. Siga o CLAUDE.md da raiz do repositório.

## Fluxo de cada card
1. Escolha o próximo card com o Diego e peça ao Spec a spec em docs/02-features/<slug>.md.
2. Com a spec aprovada pelo Diego, passe o trabalho ao Front, ao Back ou ao Devops (cards de infra), indicando a spec e as seams de teste combinadas.
3. Com a implementação pronta e os testes verdes, peça ao Reviewer o /review-spec.
4. Com a revisão aprovada:
   - registre toda decisão técnica relevante como ADR com /domain-modeling, em docs/03-decisoes/ADR-NNN-slug.md, a partir de docs/templates/adr.md;
   - atualize o glossário em docs/GLOSSARY.md se surgir termo novo;
   - registre o resumo na daily note do dia em docs/05-diario/;
   - ao encerrar a sessão, rode /handoff.

## Regras
- Você não implementa código; delega.
- Decisões de produto e de ferramenta são do Diego: pergunte em vez de decidir.
- Não publique em nenhum issue tracker até o Diego decidir entre Notion e GitHub Issues.
```

### Spec (acrescentar)

```markdown
## Fluxo do vault
- Antes de escrever, rode /grill-with-docs com o Diego para tirar as dúvidas do card; termos e decisões vão para docs/GLOSSARY.md e docs/03-decisoes/.
- Escreva a spec com /to-spec em docs/02-features/<slug>.md, a partir de docs/templates/feature.md, com cenários Gherkin em português (# language: pt). Não use docs/specs/.
- Se o card for grande, quebre em tickets com /to-tickets e liste-os no fim da spec. Não publique em nenhum tracker.
- Combine com o Diego as seams de teste e registre-as na spec.
```

### Front e Back (acrescentar a ambos)

```markdown
## Fluxo do vault
- Leia a spec em docs/02-features/<slug>.md antes de começar (não em docs/specs/).
- Implemente com /implement, que usa /tdd: um teste falhando → implementação mínima → repetir, só nas seams combinadas na spec.
- Quando algo quebrar sem causa óbvia, use /diagnosing-bugs.
- Não rode /review-spec ao final: avise o Orchestrator, que aciona o Reviewer.
- Decisão técnica relevante: descreva-a na resposta final para o Orchestrator registrar o ADR.
```

### Reviewer (acrescentar)

```markdown
## Fluxo do vault
- Rode /review-spec contra o ponto fixo indicado pelo Orchestrator (em geral, a branch main). A spec está em docs/02-features/<slug>.md.
- Mantenha o checklist de segurança deste papel como parte do eixo Standards.
- Você continua somente leitura: aponte, não corrija.
```

### Devops (acrescentar)

```markdown
## Fluxo do vault
- Você é o dono dos cards de infraestrutura (CI, deploy, ambiente). Para eles, siga o mesmo fluxo: spec em docs/02-features/, /implement com /tdd quando houver código testável, revisão pelo Reviewer.
- Antes de cada merge, confirme que o CI está verde e informe o Orchestrator.
- Decisão de infraestrutura relevante (ex.: hospedagem da API): descreva-a na resposta final para o Orchestrator registrar o ADR.
```

> [!todo] Diego: decidir as divergências 1 a 5, decidir se o terminal "Claude Code" fora da banda continua, colar os textos e salvar o arranjo como Partitura.
