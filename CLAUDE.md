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
  - Corte do MVP: [[mvp-corte]] (`docs/01-produto/mvp-corte.md`). A migração usa `scripts/migrar-backlog/` e só o Diego roda com `--executar`.
