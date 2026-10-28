# migrar-backlog (uso único)

Migra para o GitHub Issues os épicos marcados como **MVP** em `docs/01-produto/mvp-corte.md`, com os cards de cada épico como sub-issues.

> **Apague esta pasta depois da migração.** Ela só existe para essa importação.

## Arquivos

- `gerar-json.js`: lê as tabelas de `docs/00-inbox/backlog-snapshot.md` e gera `backlog.json`.
- `backlog.json`: dados do snapshot (épicos, cards, IDs do Notion e labels sugeridas).
- `migrar.js`: faz a migração.

## Pré-requisitos

- Node 18+ e GitHub CLI autenticado (`gh auth status`) com escopo `repo`.
- `mvp-corte.md` revisado e com `aprovado: true` no frontmatter. Sem isso, `--executar` é recusado.
- Decisão tomada pelo GitHub Issues como issue tracker.

## Como rodar (na raiz do repositório)

```bash
# 1. (Opcional) regerar o JSON se o snapshot mudou
node scripts/migrar-backlog/gerar-json.js

# 2. Simulação (padrão): só imprime o que faria; não altera nada no GitHub
node scripts/migrar-backlog/migrar.js

# 3. Execução real
node scripts/migrar-backlog/migrar.js --executar

# Outro repositório (padrão: o remote origin)
node scripts/migrar-backlog/migrar.js --repo dono/nome
```

## O que ele faz

1. Cria as labels que faltam (`epic`, `tipo:*`, `area:*`, `prio:*`, `frontend`, `backend`, `banco`, `infra`, `docs`).
2. Cria uma issue `[Épico] <nome>` por épico MVP.
3. Cria uma issue `[LB-NN] <título>` por card e a vincula como sub-issue do épico.

Cada issue guarda o ID do Notion no corpo (`<!-- notion-id: ... -->`). Ao rodar de novo, o script procura esse ID e não duplica issues nem vínculos.

## Limitações

- O conteúdo das páginas do Notion (resumo, BDD, plano de testes) **não** é copiado. A issue traz o link para o card.
- Status e pontos vão como texto no corpo. Colunas e campos de um GitHub Project ficam por fazer à mão.
- Mudou a classificação em `mvp-corte.md`? Rode a simulação de novo antes de executar.
