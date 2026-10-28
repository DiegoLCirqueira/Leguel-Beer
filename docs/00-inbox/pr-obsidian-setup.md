## Resumo

Configura `docs/` como vault do Obsidian e prepara o repositório para o desenvolvimento guiado por BDD/TDD com agentes:

- **Vault:** pastas `00-inbox` a `05-diario` e `templates`; configuração do Obsidian (daily notes, templates, pasta padrão); plugins Templater e Dataview.
- **Templates (Templater):** feature (BDD), ADR e daily note.
- **Notas:** visão do produto, specs de catálogo, checkout e Geladeira (rascunhos), visão geral da arquitetura, LEIA-ME, diário.
- **Claude Code:**
  - `CLAUDE.md` com o fluxo obrigatório, os caminhos do vault para as skills e as regras de hospedagem e de issue tracker do MVP;
  - skills do Obsidian (kepano) e o núcleo das skills do Matt Pocock em `.claude/skills/`, com `code-review` renomeada para `review-spec`.
- **Backlog:** snapshot do Notion e script de uso único `scripts/migrar-backlog/` para levar o MVP ao GitHub Issues. O script **não foi executado**, só simulado.

## Decisões registradas

- [ADR-001](docs/03-decisoes/ADR-001-stack.md): stack Next.js + NestJS + Prisma + Supabase (só Postgres, auth e arquivos) + Vercel. **Aceito.**
- [ADR-002](docs/03-decisoes/ADR-002-hospedagem-api.md): API NestJS em funções serverless na Vercel (Hobby), sem processos de longa duração no MVP. **Proposto.**
- [Corte do MVP](docs/01-produto/mvp-corte.md): 14 épicos no MVP (63 cards / 210 pontos no núcleo + 33 adiáveis / 85 pontos) e 4 épicos no Pós-MVP. **Proposto, `aprovado: false`.**
- **TDD:** red-green em fatias verticais; refatoração em passo e commit separados, só com todos os testes verdes (CLAUDE.md).
- **Issue tracker:** GitHub Issues para o MVP; o Notion fica como banco de ideias do Pós-MVP (CLAUDE.md).
- **Papéis da banda do Maestri:** textos completos em `docs/00-inbox/maestri-banda.md`, prontos para colar.

## Pendências (fora desta branch)

- [ ] Aprovar o ADR-002 (`status: aceito`) e o corte do MVP (`aprovado: true`).
- [ ] Rodar `node scripts/migrar-backlog/migrar.js --executar` e depois apagar `scripts/migrar-backlog/`.
- [ ] Confirmar o tamanho e as categorias do catálogo e resolver os callouts `[!todo]`.
- [ ] Trocar o Node por uma versão 22 recente via fnm e criar o `.nvmrc`.
- [ ] Colar os papéis no Maestri, remover o terminal "Claude Code" e salvar a Partitura.
- [ ] Abrir `docs/` no Obsidian e ativar os plugins da comunidade.
- [ ] Rodar `/setup-matt-pocock-skills` com os caminhos do vault e GitHub Issues como tracker.

## Como revisar

1. **Comece por `CLAUDE.md`:** é o que todos os agentes leem.
2. **Leia as decisões:** `docs/03-decisoes/` (ADR-001 e ADR-002) e `docs/01-produto/mvp-corte.md`.
3. **Abra `docs/` no Obsidian:** confira a consulta Dataview em `01-produto/visao.md`, os wikilinks e os templates (Templater → "Insert template").
4. **Skills:** `.claude/skills/` e `skills-lock.json` são cópias de repositórios externos. A única edição local é a renomeação para `review-spec`.
5. **Plugins:** `docs/.obsidian/plugins/` tem os `main.js` do Templater e do Dataview (arquivos grandes, baixados das releases oficiais). Não precisam de revisão linha a linha.
6. **Script de migração:** rode a simulação, que não altera nada: `node scripts/migrar-backlog/migrar.js`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
