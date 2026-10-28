# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

> Layout: **single-context**, adapted to the Obsidian vault in `docs/`. These paths take precedence over the defaults written in the skills (see "Convenções para as skills" in `CLAUDE.md`).

## Before exploring, read these

- **`docs/GLOSSARY.md`**: the project glossary (not at the repo root).
- **`docs/03-decisoes/`**: read the ADRs that touch the area you're about to work in. ADRs are named `ADR-NNN-slug.md` (e.g. `ADR-002-hospedagem-api.md`), not `docs/adr/0001-slug.md`.
- **`docs/02-features/`**: the BDD spec of the feature you're working on.
- **`docs/01-produto/visao.md`** and **`docs/01-produto/mvp-corte.md`**: product scope and what is MVP / MVP+ / Pós-MVP.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

## Where to write

- **Glossary terms**: `docs/GLOSSARY.md`.
- **ADRs**: `docs/03-decisoes/ADR-NNN-slug.md`, starting from `docs/templates/adr.md`. Scan `docs/03-decisoes/` for the highest existing number and use the next one.
- **Specs**: `docs/02-features/<slug>.md`, starting from `docs/templates/feature.md`, with Gherkin scenarios in Portuguese.
- **Drafts and temporary files**: `docs/00-inbox/` (never `.scratch/` or new folders).
- Never edit `docs/.obsidian/`. Use `[[wikilinks]]` between notes.

## File structure

```
/
├── CLAUDE.md
└── docs/                      ← Obsidian vault
    ├── GLOSSARY.md
    ├── 00-inbox/              ← drafts
    ├── 01-produto/            ← vision, MVP cut
    ├── 02-features/           ← BDD specs
    ├── 03-decisoes/
    │   ├── ADR-001-stack.md
    │   └── ADR-002-hospedagem-api.md
    ├── 04-arquitetura/
    ├── 05-diario/
    ├── agents/                ← this configuration
    └── templates/
```

The planned monorepo (`apps/web`, `apps/api`, `packages/*`, see `ADR-005-monorepo-camadas.md`) still uses this single glossary and ADR folder.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `docs/GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids. The official name of the cart is **Geladeira**.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-002 (hospedagem da API), but worth reopening because…_
