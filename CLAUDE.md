## Projeto
Leguelé Beer: e-commerce mobile-first da cervejaria artesanal Leguelé Beer (projeto de portfólio).
Stack: Next.js (front) + NestJS (API) + Prisma; Supabase apenas para Postgres, autenticação e arquivos; deploy na Vercel. Ver docs/03-decisoes/ADR-001-stack.md.
Hospedagem da API: docs/03-decisoes/ADR-002-hospedagem-api.md. No MVP não há processos de longa duração: sem filas (BullMQ), Redis, WebSocket ou workers. E-mail é enviado de forma síncrona pela API do provedor; tarefas agendadas, se houver, usam o cron da plataforma. Esses recursos ficam para o Pós-MVP.

### Estrutura de pastas
> PENDENTE: preencher quando houver código.

### Comandos (dev, teste, build, lint)
> PENDENTE: preencher quando houver código.

### Convenções de teste
> PENDENTE: preencher quando houver código.

### Variáveis de ambiente
> PENDENTE: preencher quando houver código.

## Documentação (docs/ é um vault do Obsidian)
- Antes de implementar uma funcionalidade, leia a spec correspondente em docs/02-features/.
- Fluxo obrigatório (red-green-refactor): cenário Gherkin → teste falhando (red) → implementação mínima até passar (green) → refatoração.
  - Red e green andam em fatias verticais, uma de cada vez, como na skill `/tdd`: um teste falhando, o mínimo para passar, e só então o próximo teste. Não escreva todos os testes antes.
  - A refatoração não faz parte do loop red → green: é um passo separado, feito só com todos os testes verdes, sem mudar comportamento (se um teste precisar mudar, não é refatoração) e em commit próprio (`refactor: ...`), separado dos commits da funcionalidade.
- Toda decisão técnica relevante vira um ADR em docs/03-decisoes/ usando docs/templates/adr.md.
- Use [[wikilinks]] entre notas; não crie notas fora das pastas existentes (na dúvida, docs/00-inbox/).
- Ao terminar uma tarefa, registre um resumo na daily note do dia em docs/05-diario/.
- Não edite docs/.obsidian/.

### Convenções para as skills
Estas regras têm prioridade sobre os caminhos padrão descritos nos SKILL.md em .claude/skills/ (por exemplo, nas skills do Matt Pocock). Valem tanto para gravar quanto para ler:
- ADRs: `docs/03-decisoes/ADR-NNN-slug.md` usando `docs/templates/adr.md` (nunca `docs/adr/`).
- Glossário: `docs/GLOSSARY.md` (nunca na raiz).
- Specs: `docs/02-features/<slug>.md` usando `docs/templates/feature.md`, com cenários Gherkin em português.
- Rascunhos e arquivos temporários: `docs/00-inbox/` (nunca `.scratch/` ou pastas novas).
- Revisão de código contra a spec: usar `/review-spec`.
- Issue tracker: GitHub Issues é o tracker do MVP.
  - `to-spec` e `to-tickets` gravam a spec em `docs/02-features/` e só publicam issues depois que a migração do backlog tiver sido feita. Enquanto não existirem issues migradas no repositório (issues com o marcador `notion-id` no corpo), apenas listam os tickets propostos no fim da spec.
  - O Notion guarda as ideias do Pós-MVP e não deve ser alterado pelos agentes.
  - Corte do MVP: [[mvp-corte]] (`docs/01-produto/mvp-corte.md`). A migração do backlog foi feita em 2026-10-28: 110 issues com o marcador `notion-id` (14 épicos + 96 cards) nos milestones "MVP" e "MVP+".
- Ultracode e workflows: não use `/effort ultracode` nem execute tarefas como workflow sem autorização explícita do Diego.
  - Uso previsto: auditorias amplas e pontuais pelo Reviewer, como a revisão de segurança antes de fechar o milestone "MVP".
  - Front, Back, Orchestrator, Spec e Devops não usam ultracode.
  - Pesquisas comparando várias fontes podem usar `/deep-research`, também só com autorização.
- Modelos: cada agente usa o modelo definido em `docs/00-inbox/maestri-banda.md`. Não troque de modelo por conta própria.
- Merge de PRs (ver [[ADR-006-merge-por-agentes]]): o Orchestrator decide o merge e o Devops executa, sem aprovação do Diego PR a PR, quando TODAS as condições valem: (1) o Reviewer deu veredito "Aprovar" para o commit atual do PR (commit novo depois da aprovação exige nova aprovação); (2) o CI está verde, quando houver CI configurado; (3) a mensagem do squash e a descrição do PR foram conferidas sem atribuição ao Claude; (4) a base é `main` e não há conflitos. Método único: `gh pr merge <n> --squash --delete-branch`. Nenhum outro agente faz merge. Se alguma condição falhar, não há merge e o Orchestrator reporta ao Diego. O Diego pode fazer merge a qualquer momento.
- Atribuição (regra permanente para todos os agentes, nesta e em todas as ordens futuras): o Claude nunca aparece como colaborador do projeto. Nenhum commit tem `Co-Authored-By: Claude` (ou variação), e nenhum PR, descrição, comentário ou mensagem tem "Generated with Claude Code", link de sessão ou qualquer outra atribuição ao Claude ou à Anthropic.
  - Antes de cada push ou PR, confira a mensagem de commit e a descrição do PR.
  - A atribuição automática do Claude Code fica desativada em `.claude/settings.json` (chave `attribution`).
  - Se encontrar atribuição ao Claude em commit ou PR ainda aberto, avise o Diego antes de corrigir. Não reescreva histórico já mergeado sem autorização dele.

### Política de autonomia (regra permanente do Diego)

Os agentes têm autonomia para decidir e executar a maior parte do trabalho sem consultar o Diego. Só o procure nos casos listados em "Decisões que são do Diego".

**O agente decide sozinho** (exemplos, não é lista fechada):
- Escolhas técnicas com resposta razoavelmente clara: estrutura de código, nomes, padrões, bibliotecas já presentes no projeto, formato de arquivos, organização de pastas.
- Planejamento: ordem das tarefas, divisão em branches e PRs, qual especialista recebe o quê.
- Correções de bugs, refatorações, testes, ajustes de CI, melhorias de performance e acessibilidade que não mudam o comportamento combinado.
- Nomes de branches, commits, PRs e arquivos (ex.: nomear imagens com base no conteúdo).
- Pequenas ambiguidades: escolha a opção mais simples e mais fácil de reverter e registre a decisão (ADR curto ou nota no diário).

**Decisões que são do Diego** (pare só esse item e pergunte):
1. Produto e negócio: preços, catálogo, regras de venda, kits, Clube, escopo do MVP, o que entra ou sai de uma feature.
2. Marca e conteúdo: textos do site, identidade visual, uso de imagens/logo, qualquer coisa que represente a Leguelé Beer.
3. Mudança de decisão já tomada: contrariar algo registrado nos ADRs, no visao.md ou no backlog.
4. Custos e contas: qualquer serviço pago, sair do plano gratuito, criar contas ou integrações externas novas (pagamento, e-mail etc.).
5. Ações irreversíveis ou destrutivas: force push, reescrever histórico, apagar branch com trabalho não mergeado, apagar dados, migration destrutiva em produção, descartar alterações que não sejam claramente lixo.
6. Segredos e acessos: criar, trocar ou expor credenciais, mudar permissões do repositório ou dos serviços.
7. Segurança e lei: dados pessoais de clientes (LGPD), pagamentos, termos de uso.
8. Merge na main: segue a regra "Merge de PRs" acima ([[ADR-006-merge-por-agentes]]): o Orchestrator decide e o Devops executa, só com todas as condições cumpridas. Fora dessas condições, o merge é do Diego.
9. Dúvida real: quando as opções têm consequências bem diferentes para o produto e nenhuma é claramente melhor.

**Como consultar o Diego:**
- Não trave o trabalho inteiro por uma decisão dele. Pause só o que depende dela e siga com o resto.
- Junte as perguntas pendentes e mande tudo de uma vez, no fim da tarefa ou quando nada mais puder avançar sem ele.
- Para cada pergunta: contexto em 1–2 frases, as opções (no máximo 3), o impacto de cada uma e a recomendação.
- Numere as perguntas, para ele responder no formato "1: opção B, 2: sim".
- Os especialistas mandam as dúvidas ao Orchestrator, que só encaminha ao Diego as que se encaixam em "Decisões que são do Diego".

**Prioridades:**
- Quando uma ordem do Diego disser explicitamente "pare e me pergunte", isso vale acima desta política.
- A regra de nenhuma atribuição ao Claude (commits, PRs, descrições) continua valendo sempre.

**Relatório do Orchestrator ao fim de cada ordem:**
1. O que foi feito (PRs, arquivos).
2. Decisões tomadas sem consultar o Diego, em uma linha cada, para ele poder vetar alguma.
3. Perguntas pendentes para o Diego, no formato acima.

## Agent skills

### Issue tracker

GitHub Issues em `DiegoLCirqueira/Leguel-Beer`, com milestones "MVP" e "MVP+"; specs ficam em `docs/02-features/`, não nas issues. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context, dentro do vault: glossário em `docs/GLOSSARY.md` e ADRs em `docs/03-decisoes/ADR-NNN-slug.md`. See `docs/agents/domain.md`.
