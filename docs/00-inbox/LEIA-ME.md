---
tags:
  - meta
---

# LEIA-ME: estrutura do vault

| Pasta | O que vai nela |
| --- | --- |
| `00-inbox/` | Notas novas e rascunhos sem lugar definido (pasta padrão de criação) |
| `01-produto/` | Visão do produto, público e escopo ([[visao]]) |
| `02-features/` | Specs das funcionalidades em BDD, uma nota por feature |
| `03-decisoes/` | ADRs (`ADR-NNN-slug.md`), a partir de `templates/adr` |
| `04-arquitetura/` | Diagramas e visão técnica ([[visao-geral]]) |
| `05-diario/` | Daily notes `YYYY-MM-DD` |
| `templates/` | Templates do Templater: feature, adr, daily |
| `agents/` | Configuração das skills do Matt Pocock: issue tracker e documentação de domínio (gerada por `/setup-matt-pocock-skills`) |

O backlog (Kanban) continua no Notion; aqui fica a base de conhecimento.

## Manutenção das skills

- Rode `npx skills update` só de propósito, não por hábito.
- Depois de cada update, refaça a renomeação de `code-review` para `review-spec`:
  - renomear a pasta `.claude/skills/code-review` para `.claude/skills/review-spec`;
  - trocar o campo `name` no frontmatter do `SKILL.md` para `review-spec`;
  - atualizar as referências em `.claude/skills/implement/SKILL.md` e `.claude/skills/tdd/SKILL.md`;
  - renomear a chave `code-review` para `review-spec` no `skills-lock.json` (o `skillPath` continua apontando para o caminho original).
