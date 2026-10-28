## Projeto
Leguelé Beer: e-commerce mobile-first da cervejaria artesanal Leguelé Beer (projeto de portfólio).
Stack: Next.js (front) + NestJS (API) + Prisma; Supabase apenas para Postgres, autenticação e arquivos; deploy na Vercel. Ver docs/03-decisoes/ADR-001-stack.md.

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
- Fluxo obrigatório: cenário Gherkin → teste falhando → implementação mínima → refatoração.
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
- Issue tracker: DECISÃO PENDENTE entre Notion e GitHub Issues. Até lá, `to-spec` e `to-tickets` não devem publicar em nenhum tracker; apenas gravar em `docs/02-features/` e listar os tickets propostos no fim da spec.
