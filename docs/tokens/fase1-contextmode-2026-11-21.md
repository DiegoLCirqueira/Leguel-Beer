# Fase 1: context-mode instalado (opção A adaptada), 21/11/2026

Caminhos locais redigidos (`<HOME>`). Backups integrais fora do git: `~/.claude/backups/tokens-2026-11-21/` (inclui `settings.global.json`, `settings.global.pos-rtk.json` e `claude.json.pre-contextmode`).

## O que foi feito
1. **Node 24 lado a lado:** `fnm install 24` (v24.22.3). O padrão do fnm continua v22.23.4 e o `.nvmrc` do repositório não foi tocado (pnpm/turbo seguem como antes).
2. **Pacote lido antes de rodar:** `context-mode@2.2.1`, licença Elastic-2.0 (confirmar o uso com o Diego), sem scripts de instalação e sem dependências; instalado com `--ignore-scripts` e versão exata, em pasta própria `<HOME>/.claude/tools/context-mode-2.2.1/`. O `server.mjs` instalado é idêntico (`cmp`) ao do tarball inspecionado.
3. **Registro com caminho absoluto, escopo user** (substitui o `npx -y context-mode`): `<HOME>/AppData/Roaming/fnm/node-versions/v24.22.3/installation/node.exe <HOME>/.claude/tools/context-mode-2.2.1/node_modules/context-mode/server.mjs --agent claude-code`.
4. **Permissões** (`~/.claude/settings.json`, `permissions.allow`), só as 3 de consulta: `mcp__context-mode__ctx_search`, `mcp__context-mode__ctx_stats`, `mcp__context-mode__ctx_doctor`. Nenhuma outra.

## Desvio da opção A (plugin): por quê
O plugin do README registra servidor e hooks com o comando `node` puro (`hooks/claude-code.json` e `plugin.json`), que resolve para o Node padrão (22) e falha: o teste direto do hook devolveu `Context Mode needs Node 24.15.0 or newer; you have v22.23.4`. Fazer o plugin funcionar exigiria trocar o Node padrão ou o PATH, o que a ordem proíbe. Além disso os hooks (PreToolUse/PostToolUse em Bash, Read, Edit, qualquer `mcp__*` etc., a cada prompt) rodariam em todos os papéis do Maestri, sem ganho medido. Por isso ficou só o servidor MCP com Node 24 absoluto, sem hooks. Se o Diego quiser os hooks, é decisão à parte (e precisa de Node 24 no PATH dos terminais).

## Validação
- `claude mcp list`: `context-mode ... ✔ Connected` (sem precisar de `MCP_TIMEOUT` maior; conectou na verificação normal).
- `doctor` (CLI): continua acusando `claude-code: old context-mode entry` e `codex/vscode: not set up`; é o aviso de que não há plugin/hooks configurados, esperado neste desenho.
- Handshake MCP por stdio com o servidor novo: `tools/list` devolveu `ctx_execute, ctx_batch, ctx_index, ctx_search, ctx_resume, ctx_stats, ctx_doctor, ctx_upgrade, ctx_purge`; `ctx_search` respondeu `isError:false` ("No hits ... 0 source(s)", índice vazio). Observação: nesta versão os nomes são `ctx_batch` e `ctx_resume`; as permissões liberadas (search/stats/doctor) existem.
- Pendente: reiniciar os terminais do Maestri; uma sessão nova precisa chamar `ctx_search` para confirmar o carregamento pelo Claude Code.

## Rollback
1. Registro: `claude mcp remove context-mode -s user`; para voltar ao estado anterior, `claude mcp add --scope user context-mode -- npx -y context-mode` (ou restaurar `claude.json.pre-contextmode` do backup externo).
2. Permissões: remover as 3 linhas `mcp__context-mode__*` do `permissions.allow` (ou restaurar `settings.global.pos-rtk.json`, que já tem o hook do rtk e não tem as permissões).
3. Pacote: apagar a pasta `<HOME>/.claude/tools/context-mode-2.2.1/`.
4. Node 24: `fnm uninstall 24` (o padrão 22 não é afetado).
5. Tudo: restaurar `settings.global.json` original do backup externo.
