---
tags: [agentes, processo]
---

# Lições aprendidas

Registro dos erros da banda e da regra que cada um gerou. Todo agente lê esta nota no início de cada ordem. Ao errar ou ser corrigido, acrescente uma linha na tabela (a mais nova no topo) e, se a regra for geral, leve-a também ao CLAUDE.md ou ao papel do agente.

| Data | Quem | O que aconteceu | Causa | Regra |
| --- | --- | --- | --- | --- |
| 2026-10-29 | Front | Arquivos do Obsidian e arquivos gerados entraram em commit de teste; títulos de commit não batiam com o `--stat`. | `git add` amplo (`git add -A .`, `commit -a`). | `git add` só com caminhos explícitos e conferir `git show --stat` antes do push. |
| 2026-10-29 | Devops | A API em :3333 caiu depois do merge do #123, na troca da working copy para a main. | Servidor de desenvolvimento rodando na mesma working copy em que se troca de branch. | Depois de merge ou troca de branch, conferir :3000 e :3333 e religar o que caiu. |
| 2026-10-29 | Back/Devops | No LB-1, o teste e a implementação do `/health` foram no mesmo commit (ffd1494, sem red), e o teste da regra de camadas veio depois da regra (aec0aba, depois de 0d61676). | Pressa no esqueleto. | Até em esqueleto, commit red separado antes do green, inclusive para regras de lint e de arquitetura. |
| 2026-10-29 | Front/Devops | No LB-1, commits com dois assuntos (6e2705c, 619fff2) e um título que não bate com o diff (619fff2 cita a daily note, que não estava no diff). | Commits agrupados no fim, sem conferir o conteúdo. | Um assunto por commit e conferir `git show --stat` antes do push. |
| 2026-10-29 | Orchestrator | Um brief com crases enviado entre aspas duplas pelo shell chegou truncado ao Devops (o shell executou as crases). | Texto com Markdown passado inline num comando de shell. | Brief com Markdown, crases ou cifrões vai por arquivo (heredoc com aspas simples), nunca inline entre aspas duplas. |
| 2026-10-29 | Orchestrator | O Reviewer alertou que editar issues exigia autorização explícita (issue-tracker.md:10); o Orchestrator tinha tratado a resposta delegada do Diego ("de sua decisão") como autorização sem registrar a regra. Depois o Diego deu aprovação permanente ("sempre sim"). | Regra escrita ("aprovação explícita na sessão") mais estreita que a vontade do Diego. | Quando o Diego delegar algo de forma permanente, registrar no CLAUDE.md ou em docs/agents/ na mesma ordem, para todos seguirem a mesma regra. |
| 2026-10-28 | Orchestrator | O cadastro de papéis do Maestri (`maestri role show`) estava desatualizado em relação aos arquivos em `.maestri/roles/`; a pré-checagem só comparou os arquivos. | Duas fontes da mesma informação e só uma foi verificada. | Na pré-checagem, comparar também `maestri role show` com [[maestri-banda]]. |
| 2026-10-28 | Devops | `gh pr merge` negado pelo classificador do modo auto ("Merge Without Review"); um agente liberar permissão de outro também foi negado ("Self-Modification"). | O classificador não vê autorizações que chegam só por mensagem. | Não contornar. Permissões novas são liberadas pelo Diego no terminal do agente. |
| 2026-10-28 | Orchestrator | A daily note ficou fora do commit: a edição falhou (arquivo não lido antes) e o Devops commitou sem ela. | Pedido de commit enviado junto com uma edição sem conferir o resultado. | Só pedir commit depois de confirmar que todas as edições foram gravadas (`git status`). |
| 2026-10-28 | Devops | Encadeou comandos com `set -e` que não parou; criou uma branch a partir da base errada. | Comandos encadeados num shell que não interrompe no erro. | Um comando por vez, conferindo o código de saída; parar no primeiro erro. |
| 2026-10-28 | Orchestrator | Mandou o Devops atualizar o PR #116, que o Diego já tinha mergeado. | Premissa sobre o estado do GitHub sem conferir. | Antes de delegar algo que depende de um PR ou branch, conferir o estado real com `gh pr view`. |
