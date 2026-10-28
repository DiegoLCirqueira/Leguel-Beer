## Documentação (docs/ é um vault do Obsidian)
- Antes de implementar uma funcionalidade, leia a spec correspondente em docs/02-features/.
- Fluxo obrigatório: cenário Gherkin → teste falhando → implementação mínima → refatoração.
- Toda decisão técnica relevante vira um ADR em docs/03-decisoes/ usando docs/templates/adr.md.
- Use [[wikilinks]] entre notas; não crie notas fora das pastas existentes (na dúvida, docs/00-inbox/).
- Ao terminar uma tarefa, registre um resumo na daily note do dia em docs/05-diario/.
- Não edite docs/.obsidian/.

### Skills do Matt Pocock (mattpocock/skills)
As skills instaladas em .claude/skills/ (setup-matt-pocock-skills, grill-with-docs, domain-modeling, to-spec, implement, tdd, code-review e afins) têm caminhos padrão próprios. Neste repositório, eles são substituídos pelos do vault:
- Specs: gravar em docs/02-features/ (a partir de docs/templates/feature.md), não no issue tracker nem em `.scratch/`.
- ADRs: gravar em docs/03-decisoes/ no formato `ADR-NNN-slug.md` (a partir de docs/templates/adr.md), não em `docs/adr/` nem com numeração `0001-slug.md`.
- Glossário: `docs/GLOSSARY.md` (não na raiz do repositório).
- Ao procurar ADRs ou glossário, leia esses mesmos caminhos.
