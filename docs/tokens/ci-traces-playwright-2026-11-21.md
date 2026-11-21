# Traces do Playwright no CI: aviso de segurança (21/11/2026)

O passo "Subir os traces do Playwright" do `.github/workflows/ci.yml` (PR #332) sobe `apps/web/test-results` quando o CI falha, com retenção de 7 dias e `trace: "on-first-retry"` só no CI (`apps/web/playwright.config.ts`).

## Risco
Um trace do Playwright guarda requisições, respostas, cookies, campos digitados e capturas de tela. **Se o E2E um dia usar chave real, conta real ou dado pessoal, o trace expõe esse valor.** Como o repositório é público, **qualquer conta do GitHub com acesso de leitura pode baixar o artefato** durante os 7 dias.

## Por que hoje é aceitável
O E2E roda só com valores descartáveis do próprio job: chaves de desenvolvimento do Supabase CLI local, e-mail fictício e a senha do admin gerada na hora (`openssl rand`), que deixa de existir quando o job termina. O pagamento é simulado (sem conta nem gateway reais).

## Regras para manter assim
- Nunca usar segredo do repositório, conta real ou dado pessoal real nos E2E que rodam no CI.
- Se algum E2E precisar de credencial real, desligar o upload do trace nesse caso (remover o passo ou mudar `trace` para `off`) antes de rodar.
- Em dúvida, apagar o artefato em Actions > a execução > Artifacts.

## Rollback
Remover o passo `if: failure()` do `ci.yml` e voltar `trace` para `off` no `playwright.config.ts`.
