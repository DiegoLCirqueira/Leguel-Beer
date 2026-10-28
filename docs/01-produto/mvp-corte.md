---
tipo: decisao
aprovado: true
criado: 2026-10-28
atualizado: 2026-10-28
fonte: "[[backlog-snapshot]]"
tags: [produto, mvp]
---

# Proposta de corte do MVP

> [!success] Aprovado pelo Diego em 2026-10-28
> Classificação dos 18 épicos do Notion (retrato de 2026-10-28 em [[backlog-snapshot]]), com as decisões do Diego de 2026-10-28. Migrado para o GitHub Issues em 2026-10-28 (milestones "MVP" e "MVP+"). A partir daqui, mudanças de escopo são feitas nas issues e nos milestones.

## Critério

Entra no MVP o que é necessário para **uma compra de ponta a ponta**: catálogo, Geladeira (carrinho), checkout completo, login e o mínimo de administração para cadastrar produtos e ver pedidos (ver [[visao]]).

Decisões do Diego aplicadas:

- Os 4 épicos que estavam em "Dúvida" entram no MVP com **escopo reduzido** (ver abaixo).
- **Sem processos de longa duração no MVP:** BullMQ, Redis, WebSocket e workers são Pós-MVP. E-mail é síncrono; tarefas agendadas usam o cron da plataforma (ver [[ADR-002-hospedagem-api]]).
- GitHub Issues é o tracker do MVP; o Notion fica como banco de ideias do Pós-MVP.

## Resumo

| Grupo | Épicos | Cards | Pontos |
| --- | --- | --- | --- |
| MVP (núcleo) | 14 | 63 | 210 |
| MVP (adiáveis) | — | 33 | 85 |
| Pós-MVP | 4 (+ 2 cards de épicos MVP) | 28 | 92 |
| **Total** | **18** | **124** | **387** |

Os 14 épicos MVP somam 98 cards (301 pontos): 63 no núcleo, 33 adiáveis e 2 que vão para o Pós-MVP por dependerem de filas ou WebSocket.

## Milestones no GitHub

| Milestone | O que entra | Issues |
| --- | --- | --- |
| **MVP** | Os 14 épicos MVP e os cards do núcleo | 77 (14 épicos + 63 cards) |
| **MVP+** | Os cards adiáveis (também com a label `adiavel`) | 33 |

> [!important] Regra de trabalho
> A banda só puxa trabalho do milestone **MVP+** depois que o milestone **MVP** estiver fechado. Os cards Pós-MVP não vão para o GitHub; continuam no Notion como banco de ideias.

## Épicos

| ID | Épico | Prio Notion | Cards | Pontos | Grupo | Justificativa |
| --- | --- | --- | --- | --- | --- | --- |
| E1 | Back-end em camadas pronto para crescer | P0 | 7 | 22 | MVP | Sem a API e a hospedagem dela não há compra (ver [[ADR-001-stack]] e [[ADR-002-hospedagem-api]]). |
| E2 | Base técnica pronta para evoluir com segurança | P0 | 10 | 26 | MVP | Monorepo, banco, testes e CI são pré-requisito do TDD e de qualquer feature. |
| E3 | Catálogo fácil de explorar | P0 | 8 | 23 | MVP | Catálogo é o primeiro passo da compra. |
| E4 | Checkout com Pix e cartão confiável | P0 | 8 | 32 | MVP | Núcleo do MVP: pedido, pagamento e confirmação. |
| E5 | Conta do cliente sem atrito | P0 | 8 | 23 | MVP | A compra exige conta; endereço é necessário para a entrega. |
| E6 | Entrega local calculada por distância | P0 | 5 | 13 | MVP | O checkout precisa de frete e de restrição de área. |
| E7 | Geladeira fluida e confiável | P0 | 8 | 30 | MVP | A Geladeira é o carrinho (ver [[geladeira]]). |
| E8 | Identidade visual consistente em todo o site | P0 | 8 | 23 | MVP | Tokens e componentes base são usados por todas as telas do fluxo de compra. |
| E9 | Painel admin para operar a loja sozinho | P0 | 9 | 34 | MVP | Cadastrar cervejas, controlar estoque e ver/alterar pedidos é o mínimo de operação. |
| E10 | Página de produto que convence | P0 | 7 | 18 | MVP | Ficha da cerveja e "adicionar à Geladeira" fazem parte da compra. |
| E11 | Qualidade comprovada e portfólio publicado | P0 | 6 | 17 | MVP | Escopo reduzido: E2E só do fluxo de compra de ponta a ponta + checklist de segurança básica. |
| E12 | Acesso responsável e dados protegidos | P1 | 5 | 13 | MVP | Escopo reduzido: confirmação de maioridade na entrada do site e no checkout, sem validação de documento. |
| E13 | Avisos e relatório mensal automáticos | P1 | 4 | 15 | MVP | Escopo reduzido: só o e-mail transacional de confirmação do pedido, via provedor com plano gratuito. |
| E14 | Clube do Leguelé com assinatura recorrente | P1 | 11 | 40 | Pós-MVP | Definido como "depois do MVP" na visão; há pendências de regra (planos, descontos). |
| E15 | Mix & Match com packs personalizados | P1 | 7 | 23 | Pós-MVP | Definido como "depois do MVP" na visão; descontos dos packs ainda pendentes. |
| E16 | Pedidos acompanháveis do início ao fim | P1 | 5 | 12 | MVP | Escopo reduzido: lista de pedidos do cliente com status, sem rastreio em tempo real. |
| E17 | Site encontrável, instalável e rápido | P1 | 5 | 15 | Pós-MVP | SEO, PWA instalável e analytics não bloqueiam a compra. |
| E18 | Favoritos e avaliações reais | P2 | 3 | 8 | Pós-MVP | Engajamento, não compra. |

## Escopo reduzido nos cards do núcleo

| Card | O que entra no MVP |
| --- | --- |
| LB-111 Revisar autorização, validação e acesso ao banco | Checklist de segurança básica: itens aplicáveis do OWASP Top 10, headers de segurança e validação de entrada. |
| LB-112 Cobrir o fluxo de compra completo com testes E2E | E2E só do fluxo de compra de ponta a ponta. |
| LB-19 Verificação de idade 18+ na entrada | Confirmação de maioridade na entrada do site, sem validação de documento. |
| LB-20 Bloquear compra para menores | Confirmação de maioridade no checkout, sem validação de documento. |
| LB-81 E-mails transacionais do pedido | Só o e-mail de confirmação do pedido, enviado de forma síncrona pela API de um provedor com plano gratuito. |
| LB-67 Listar histórico de pedidos | Lista de pedidos do cliente com status, sem tempo real. |
| LB-59 Webhooks de pagamento idempotentes | Processamento síncrono no endpoint do webhook, sem fila. |
| LB-60 Cancelar pedidos expirados | Expiração verificada sob demanda + cron diário da plataforma, conforme [[ADR-002-hospedagem-api]]. |

## Cards Pós-MVP

Cards de épicos MVP que dependem de BullMQ, Redis ou WebSocket:

| Épico | Card | Pontos | Motivo |
| --- | --- | --- | --- |
| E1 | LB-123 Configurar filas e agendamentos com BullMQ e @nestjs/schedule | 3 | Filas e processos de longa duração ficam fora do MVP; agendamento usa o cron da plataforma. |
| E16 | LB-69 Atualizar status do pedido em tempo real | 3 | Depende de WebSocket. |

## Cards adiáveis

Cards de épicos MVP que podem ficar para depois sem quebrar a compra de ponta a ponta:

| Épico | Card | Pontos | Motivo |
| --- | --- | --- | --- |
| E2 | LB-9 Validar variáveis de ambiente com Zod | 1 | Útil, mas não bloqueia. |
| E2 | LB-10 Documentar setup e arquitetura no README | 2 | Útil, mas não bloqueia. |
| E3 | LB-32 Exibir banner rotativo de destaques na home | 3 | O catálogo com filtros já permite achar a cerveja. |
| E3 | LB-37 Implementar busca por nome, estilo e ingrediente | 5 | O catálogo com filtros já permite achar a cerveja. |
| E3 | LB-39 Exibir chamada do Clube do Leguelé na home | 1 | O Clube é Pós-MVP. |
| E5 | LB-26 Implementar login social com Google e Facebook | 3 | E-mail e senha bastam para comprar. |
| E6 | LB-65 Estimar tempo de entrega com preparo e deslocamento | 3 | Frete e área de entrega já cobrem o checkout. |
| E7 | LB-48 Mesclar geladeira do convidado ao fazer login | 3 | Não bloqueia a compra. |
| E7 | LB-53 Aplicar cupom de desconto na geladeira | 3 | Sem cupom no MVP; acompanha LB-80. |
| E8 | LB-16 Exportar logo, favicon e ícones do PWA | 2 | PWA é Pós-MVP. |
| E8 | LB-17 Otimizar fundo de folhagem para mobile | 2 | Acabamento. |
| E8 | LB-18 Criar páginas de erro 404/500 e estados vazios | 2 | Acabamento. |
| E9 | LB-74 Gerenciar categorias de cerveja no admin | 2 | Categorias podem vir do seed. |
| E9 | LB-78 Exibir dashboard de vendas no admin | 5 | Não afeta a compra. |
| E9 | LB-79 Gerenciar banners da home no admin | 3 | Acompanha LB-32. |
| E9 | LB-80 Gerenciar cupons de desconto no admin | 3 | Acompanha LB-53. |
| E10 | LB-43 Implementar abas de descrição, ingredientes, harmonização e avaliações | 3 | A ficha técnica (LB-40) já mostra o essencial. |
| E10 | LB-44 Exibir quanto falta para o frete grátis | 2 | Não bloqueia a compra. |
| E10 | LB-45 Sugerir cervejas do mesmo estilo | 2 | Não bloqueia a compra. |
| E10 | LB-46 Compartilhar cerveja com Web Share e preview Open Graph | 2 | Não bloqueia a compra. |
| E11 | LB-113 Auditar acessibilidade das telas principais | 3 | Fora do escopo reduzido de E11. |
| E11 | LB-114 Monitorar erros em produção com Sentry | 1 | Fora do escopo reduzido de E11. |
| E11 | LB-115 Preparar README de portfólio com prints, GIF e decisões | 3 | Fora do escopo reduzido de E11. |
| E11 | LB-116 Criar dados de demonstração e conta de teste para recrutadores | 2 | Fora do escopo reduzido de E11. |
| E12 | LB-21 Implementar banner de consentimento de cookies | 3 | Fora do escopo reduzido de E12. |
| E12 | LB-22 Publicar termos, privacidade e aviso de projeto de portfólio | 2 | Fora do escopo reduzido de E12. |
| E12 | LB-23 Permitir exportar e excluir os dados da conta | 3 | Fora do escopo reduzido de E12. |
| E13 | LB-82 Pesquisar envio gratuito de notificação por WhatsApp | 2 | Fora do escopo reduzido de E13. |
| E13 | LB-83 Notificar o admin no WhatsApp a cada pedido pago | 3 | Fora do escopo reduzido de E13. |
| E13 | LB-84 Gerar relatório mensal exportável para planilha | 5 | Fora do escopo reduzido de E13. |
| E16 | LB-68 Exibir detalhe do pedido com linha do tempo de status | 3 | Fora do escopo reduzido de E16 (a lista já mostra o status). |
| E16 | LB-70 Comprar novamente um pedido anterior | 2 | Fora do escopo reduzido de E16. |
| E16 | LB-71 Abrir conversa no WhatsApp a partir do pedido | 1 | Fora do escopo reduzido de E16. |

