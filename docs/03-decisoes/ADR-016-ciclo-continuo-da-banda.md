---
status: aceito
data: 2026-11-08
tags:
  - adr
---

# ADR-016: Ciclo contínuo da banda

> [!info] Status
> **Aceito**, por decisão do Diego em 2026-11-08 ("mantenha um ciclo", "não pare de trabalhar por precisar de uma decisão minha", "faça sempre as recomendadas").

## Contexto

Até aqui cada ordem terminava e a banda esperava o Diego dar a próxima. Isso parava o trabalho entre tarefas e também quando surgia uma dúvida que só ele resolve. O Diego pediu que a banda siga sozinha pela sequência combinada das páginas.

## Decisão

A ordem vira um ciclo, sem esperar ordem do Diego entre uma tarefa e outra:

1. escolher a próxima tarefa pela sequência combinada;
2. spec (e ADR, se houver);
3. Front e/ou Back;
4. Reviewer;
5. merge pela regra do [[ADR-006-merge-por-agentes]];
6. daily e handoff;
7. auditoria final do Codex ([[maestri-banda]]);
8. achados voltam ao responsável;
9. próxima tarefa.

Decisão que é do Diego não trava o ciclo: vai para o cartão "Decisões pendentes" do canvas e a banda segue com outra tarefa. Quando o Orchestrator tem uma opção recomendada, ele a aplica e a reporta como decisão vetável.

Continuam só com o Diego: ação irreversível ou destrutiva, custo, segredo novo e deploy em produção (lista de "Decisões que são do Diego" no `CLAUDE.md`).

## Por quê

O Diego decide o que é produto e risco; esperar a ordem seguinte não acrescenta controle e custa tempo. A decisão vetável mantém o controle dele: ele vê o que foi aplicado e pode desfazer. Sem o cartão de pendências, uma dúvida real pararia tudo; com ele, só a tarefa que depende dela espera.

## Consequências

Uma recomendação aplicada pode ser vetada depois, e o trabalho feito em cima dela se refaz. Por isso o que tem custo alto de desfazer (lista de limites acima) fica fora do "aplica a recomendada".
