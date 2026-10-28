## Resumo

Configura `docs/` como vault do Obsidian e prepara o repositório para o desenvolvimento guiado por BDD/TDD com uma banda de agentes:

- **Vault:**
  - pastas `00-inbox` a `05-diario` e `templates`;
  - configuração do Obsidian (daily notes, templates, pasta padrão);
  - plugins Templater e Dataview.
- **Templates (Templater):** feature (BDD), ADR e daily note.
- **Notas:**
  - visão do produto e corte do MVP;
  - specs de catálogo, checkout e Geladeira (rascunhos);
  - visão geral da arquitetura, LEIA-ME, diário.
- **Claude Code:**
  - `CLAUDE.md` com o fluxo red-green-refactor, os caminhos do vault para as skills, as regras de hospedagem e de issue tracker do MVP, e as regras de ultracode/workflows e de modelos;
  - skills do Obsidian (kepano) e o núcleo das skills do Matt Pocock em `.claude/skills/`, com `code-review` renomeada para `review-spec`.
- **Banda do Maestri:** `docs/00-inbox/maestri-banda.md` com os papéis completos e a tabela de modelos por agente, prontos para colar.
- **Backlog:**
  - snapshot do Notion;
  - script de uso único `scripts/migrar-backlog/` que leva o MVP ao GitHub Issues com sub-issues, labels e milestones;
  - o script **não foi executado**, só simulado.

## Decisões registradas

| Decisão | Status |
| --- | --- |
| ADR-001: stack Next.js + NestJS + Prisma + Supabase (só Postgres, auth e arquivos) + Vercel | Aceito |
| ADR-002: API NestJS em funções serverless na Vercel (Hobby), sem processos de longa duração no MVP; cron diário para expirar pedidos Pix e manter o Supabase Free ativo | **Aceito** |
| ADR-003: site mobile-first em Next.js (do Notion ADR-002; PWA instalável no Pós-MVP) | Aceito |
| ADR-004: Mercado Pago em sandbox, só Pix e cartão no MVP (do Notion ADR-003; assinaturas no Pós-MVP) | Proposto, até o spike LB-54 |
| ADR-005: monorepo Turborepo + pnpm em camadas (do Notion ADR-004; sem WebSocket no MVP) | Aceito, com `[!todo]` para completar antes do LB-1 |
| Corte do MVP (`docs/01-produto/mvp-corte.md`): 14 épicos no MVP, 4 no Pós-MVP | **Aprovado** |
| Milestones: **MVP** (77 issues: 14 épicos + 63 cards do núcleo) e **MVP+** (33 cards adiáveis, label `adiavel`); a banda só puxa MVP+ depois de fechar o MVP | Aprovado com o corte |
| TDD: red-green em fatias verticais; refatoração em passo e commit separados, só com todos os testes verdes | CLAUDE.md |
| Issue tracker: GitHub Issues para o MVP; o Notion vira banco de ideias do Pós-MVP | CLAUDE.md |
| Modelos por agente: Orchestrator, Spec e Reviewer em `opus`; Front, Back e Devops em `sonnet` (sempre por alias) | `maestri-banda.md` + CLAUDE.md |
| Ultracode, workflows e `/deep-research`: só com autorização do Diego; uso previsto pelo Reviewer em auditorias pontuais | CLAUDE.md |

## Como revisar

1. **Comece por `CLAUDE.md`:** é o que todos os agentes leem.
2. **Leia as decisões:** `docs/03-decisoes/` (ADR-001 a ADR-005) e `docs/01-produto/mvp-corte.md`.
3. **Abra `docs/` no Obsidian:** confira a consulta Dataview em `01-produto/visao.md`, os wikilinks e os templates (Templater → "Insert template").
4. **Skills:** `.claude/skills/` e `skills-lock.json` são cópias de repositórios externos. A única edição local é a renomeação para `review-spec`.
5. **Plugins:** `docs/.obsidian/plugins/` tem os `main.js` do Templater e do Dataview (arquivos grandes, baixados das releases oficiais). Não precisam de revisão linha a linha.
6. **Script de migração:** rode a simulação, que não altera nada: `node scripts/migrar-backlog/migrar.js`.

## Depois do merge

- [ ] Na `main`, rodar `node scripts/migrar-backlog/migrar.js` (simulação) e depois `--executar`; conferir issues, sub-issues, labels e milestones no GitHub.
- [ ] Apagar `scripts/migrar-backlog/`.
- [ ] Apagar este arquivo (`docs/00-inbox/pr-obsidian-setup.md`).

## Pendências fora do repositório

- [ ] Trocar o Node por uma versão 22 recente via fnm e criar o `.nvmrc`.
- [ ] Colar os papéis e os comandos de inicialização (`claude --model …`) no Maestri, remover o terminal "Claude Code" e salvar a Partitura.
- [ ] Abrir `docs/` no Obsidian e ativar os plugins da comunidade.
- [ ] Rodar `/setup-matt-pocock-skills` com os caminhos do vault e GitHub Issues como tracker.
- [ ] Confirmar o tamanho e as categorias do catálogo e resolver os callouts `[!todo]`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
