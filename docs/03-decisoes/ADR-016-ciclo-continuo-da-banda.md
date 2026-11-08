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

Decisão que é do Diego não trava o ciclo: vai para o cartão "Decisões pendentes" do canvas e a banda segue com outra tarefa. A recomendada vale só para os itens 1, 2 e 9 de "Decisões que são do Diego" (produto e negócio, marca e conteúdo, dúvida real): o Orchestrator a aplica e reporta como decisão vetável. Os itens 3 a 8 da mesma lista continuam parando no Diego: vão ao cartão de pendências e a banda segue com outra tarefa. O merge segue só pelas 4 condições do [[ADR-006-merge-por-agentes]].

A lista "Decisões que são do Diego" está no `CLAUDE.md`; não é reescrita aqui.

## Por quê

Os três critérios de ADR valem:
- **Surpreende:** muda o limite da autonomia dos agentes, e quem lê a política não espera que a banda siga sozinha entre tarefas nem que aplique uma recomendada.
- **Trade-off real:** velocidade contra controle. Esperar a ordem seguinte custa tempo sem acrescentar controle; a decisão vetável devolve o controle ao Diego, que vê o que foi aplicado e pode desfazer.
- **Difícil de reverter na prática:** o trabalho feito em cima de recomendadas se acumula, e vetar uma tarefa antiga obriga a refazer as seguintes.

Sem o cartão de pendências, uma dúvida real pararia tudo; com ele, só a tarefa que depende dela espera.

## Alternativas consideradas

- **Pausar a cada ordem:** controle máximo, mas a banda para entre tarefas e por qualquer dúvida.
- **Ciclo sem aplicar a recomendada:** a banda segue, mas cada decisão de produto ou marca vira pendência, e o Diego volta a ser o gargalo.

## Consequências

Uma recomendação aplicada pode ser vetada depois, e o trabalho feito em cima dela se refaz. Por isso o que tem custo alto de desfazer (lista de limites acima) fica fora do "aplica a recomendada".
