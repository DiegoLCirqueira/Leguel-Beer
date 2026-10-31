---
tipo: produto
criado: 2026-10-29
atualizado: 2026-10-29
fonte-notion: https://app.notion.com/p/3fd490a7ac7d81d2bc58c7ff9e7091b8
tags:
  - produto
  - mvp
---

# Roteiro do MVP

> [!info] Origem
> Ordem de trabalho dos cards do milestone **MVP**, a partir da decisão do Diego de 2026-10-29: "quero que a primeira página criada seja a de login e tudo que a envolve, depois pode seguir como manda o notion". O Notion manda seguir a prioridade P0 → P1 → P2 → P3, respeitando as dependências de cada card (página do projeto, seção "Ordem de execução"). O escopo continua o do [[mvp-corte]]; este roteiro só define a ordem.

## Regras

- **Fase 1, acesso:** a entrada do site, a conta e tudo de que elas dependem, na ordem abaixo.
- **Fase 2, o resto do MVP:** cards P0 antes dos P1, com uma exceção: quando um card P0 depende de um P1, o P1 vem antes dele (ex.: LB-14 antes do catálogo).
- **Paralelo:** Front e Back podem tocar etapas diferentes ao mesmo tempo, desde que as dependências de cada uma estejam prontas.
- **Spec antes do código:** cada etapa só começa com a spec mergeada em `docs/02-features/`.
- **MVP+ depois do MVP:** os cards do milestone **MVP+** só entram com o milestone **MVP** fechado ([[mvp-corte]]).
- **Supabase:** local (Supabase CLI e Docker) no desenvolvimento; a nuvem entra no LB-8.

## Fase 1: acesso

| Etapa | Cards | Spec | Depende de |
| --- | --- | --- | --- |
| 1 | LB-3 (#12) banco local com Supabase CLI e Prisma · LB-11 (#63) tokens da marca | [[api-base]] · [[identidade-visual]] | LB-1 (feito) |
| 2 | LB-117 (#3) validação, erros e Swagger · LB-12 (#64) botão, badge e chip | [[api-base]] · [[identidade-visual]] | Etapa 1 |
| 3 | LB-118 (#4) camadas e template de módulo · LB-119 (#5) testes da API com banco real ([[ADR-007-banco-de-teste]]) · LB-120 (#6) schemas compartilhados | [[api-base]] · [[testes-api]] · [[contratos-compartilhados]] | Etapa 2 |
| 4 | LB-19 (#97) confirmação de maioridade | [[maioridade-entrada]] | LB-12 |
| 5 | LB-24 (#39) boas-vindas | [[boas-vindas]] | LB-19, LB-12 |
| 6 | LB-28 (#43) proteção da API e do site | [[guards-api]] | Etapas 1 a 3 |
| 7 | LB-22 (#100) termos, privacidade e entregas | [[termos-privacidade]] | LB-12, LB-19 |
| 8 | LB-25 (#40) cadastro e login | [[cadastro-login]] | LB-24, LB-28, LB-120, LB-22 |
| 9 | LB-27 (#42) recuperação de senha | [[recuperacao-senha]] | LB-25 |

> [!info] LB-22 no MVP
> O LB-22 era MVP+ e entrou na fase 1 por decisão do Diego (2026-10-29): os links "Termos de Uso" e "Política de Privacidade" do cadastro precisam de destino.

## Fase 2: o resto do MVP

Agrupado por dependência. Dentro de cada grupo, a ordem da lista.

| Grupo | Cards | Observação |
| --- | --- | --- |
| A. Base técnica | LB-2 (#11), LB-5 (#14), LB-6 (#15), LB-7 (#16), LB-8 (#17), LB-121 (#7), LB-122 (#8) | LB-2, LB-5, LB-6 e LB-7 foram em parte entregues pelo LB-1 ([[base-monorepo]]): reconciliar antes. LB-121 já foi respondido pelo [[ADR-002-hospedagem-api]]. LB-8 traz o Supabase na nuvem, o envio de e-mails e a decisão "merge = deploy" do Diego; o que conferir na nuvem está no "Checklist do LB-8", abaixo |
| B. Catálogo | LB-4 (#13), LB-13 (#65), LB-14 (#66, P1), LB-15 (#67), LB-33 (#22), LB-36 (#25), LB-34 (#23) | [[catalogo]], [[destaques-home]]. LB-14 sobe por ser dependência do LB-36 (bottom sheet dos filtros). Faixas de filtro ainda em aberto com o Diego |
| C. Geladeira | LB-124 (#61), LB-47 (#54), LB-49 (#56), LB-50 (#57), LB-51 (#58), LB-52 (#59), LB-35 (#24) | [[geladeira]], [[adicionar-do-card]]. LB-35 depende do LB-47 |
| D. Página de produto | LB-40 (#82), LB-41 (#83), LB-42 (#84) | LB-42 depende do LB-47 |
| E. Conta para a compra | LB-29 (#44), LB-62 (#48), LB-30 (#45), LB-31 (#46, P1), LB-20 (#98) | LB-30 depende do spike de geocodificação (LB-62); LB-31 sobe por ser dependência do checkout; LB-20 usa a data de nascimento do LB-29 |
| F. Entrega | LB-63 (#49), LB-64 (#50), LB-66 (#52) | Dependem do LB-62 |
| G. Checkout | LB-54 (#30), LB-55 (#31), LB-56 (#32), LB-38 (#27), LB-57 (#33), LB-58 (#34), LB-59 (#35), LB-60 (#36), LB-61 (#37), LB-81 (#103) | [[checkout]]. LB-54 pode já estar respondido pelo [[ADR-004-mercado-pago]]. LB-38 (esgotadas) depende da reserva do LB-56. LB-81 depende de um provedor de e-mail (conta nova: decisão do Diego) |
| H. Pedidos do cliente | LB-67 (#108) | Depende do checkout |
| I. Admin | LB-72 (#72), LB-73 (#73), LB-75 (#75), LB-76 (#76), LB-77 (#77) | LB-72 usa o papel admin do [[guards-api]]; LB-76 depende de pedidos |
| J. Qualidade | LB-111 (#90), LB-112 (#91) | Fecham o MVP: checklist de segurança e E2E da compra de ponta a ponta |

### Checklist do LB-8

O que a nuvem precisa repetir do Supabase local. Vem das specs e das revisões dos PRs #153 (tela de criar conta) e #154 (perfil em `/me/profile`).

- [ ] **Limites de tentativa:** replicar na nuvem os "Limites de tentativa" de [[cadastro-login]].
- [ ] **Limite por IP do cadastro e da renovação de sessão:** a Server Action do cadastro precisa repassar o IP do visitante (`X-Forwarded-For`) ao Supabase Auth (a implementar). A renovação de sessão também (a implementar): ela sai do proxy do site, então o limite `token_refresh` (150 a cada 5 minutos por IP) hoje vê só o IP do servidor do site (revisão do #165). Depois, confirmar na nuvem que o GoTrue confia nesse cabeçalho e testar com 31 cadastros seguidos do mesmo IP.
- [ ] **Chave assimétrica de JWT:** replicar a de [[guards-api]].
- [ ] **Emissor do token (`iss`):** a API compara o `iss` do JWT ao pé da letra com `SUPABASE_URL` + `/auth/v1`. Conferir na nuvem que o `iss` emitido é exatamente esse valor (mesmo protocolo e domínio, sem barra a mais).
- [ ] **Confirmação de e-mail obrigatória:** `enable_confirmations = true` na nuvem. Sem ela, quem cadastrar o e-mail do admin vira admin.
- [ ] **Leitura de `auth.users`:** a API lê `id` e `email_confirmed_at` para conceder admin. Se o papel do `DATABASE_URL` de produção não for o `postgres`, dar `GRANT SELECT (id, email_confirmed_at) ON auth.users` a esse papel.
- [ ] **Endereço do site:** `SITE_URL` obrigatório em produção, e `site_url` e `additional_redirect_urls` do Supabase na nuvem iguais ao domínio do site.

## Ver também

- [[mvp-corte]]: o que entra no MVP, no MVP+ e no Pós-MVP.
- [[visao]]
