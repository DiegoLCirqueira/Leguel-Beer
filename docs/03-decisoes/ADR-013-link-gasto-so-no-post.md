---
status: aceito
data: 2026-10-31
tags:
  - adr
---

# ADR-013: Link do e-mail só é gasto no POST

> [!info] Status
> **Aceito.** Registro retroativo (2026-11-04): a decisão foi tomada em 2026-10-31 e ficou só nas notas do diário e nos PRs.

## Contexto

Os links de confirmação do cadastro e de recuperação de senha são de uso único. Scanners de e-mail abrem links e gastariam o token, e um link aberto sem querer faria login na conta errada (login CSRF). Apontado pelo Reviewer no PR #162 e decidido nos PRs #167 e #173 ([[cadastro-login]], [[recuperacao-senha]]; diário [[2026-10-31]]).

## Decisão

Abrir o link (GET) só mostra uma página com um botão. O token é gasto no POST: `confirmarContaAction` em `apps/web/src/app/auth/confirmar/actions.ts` ("Confirmar minha conta") chama o `/verify` do Supabase Auth, e `novaSenhaAction` em `apps/web/src/app/nova-senha/actions.ts` define a nova senha. Link vencido, usado ou substituído só é detectado nesse POST.

## Por quê

O GET fica sem efeito colateral, então scanners não invalidam o link. Voltar a gastar o link no GET reabre o risco (scanners de e-mail consumindo o token e login CSRF), e é isso que justifica o ADR. A contrapartida é um passo a mais para a pessoa e o aviso de link vencido aparecer só depois do toque.
