---
tipo: proposta
aprovado: false
criado: 2026-10-28
fonte: "[[backlog-snapshot]]"
tags: [produto, mvp, decisao-pendente]
---

# Proposta de corte do MVP

> [!warning] Proposta para revisão — não aprovada
> Classificação sugerida dos 18 épicos do Notion (retrato de 2026-10-28 em [[backlog-snapshot]]). Quem decide é o Diego. Ao aprovar, troque `aprovado: false` por `aprovado: true` no frontmatter: o script em `scripts/migrar-backlog/` lê a coluna **Grupo** desta tabela e só cria issues de verdade com essa marca.

## Critério

Entra no MVP o que é necessário para **uma compra de ponta a ponta**: catálogo, Geladeira (carrinho), checkout completo, login e o mínimo de administração para cadastrar produtos e ver pedidos (ver [[visao]]). O resto tende a ser Pós-MVP. **Dúvida** = há argumento forte para os dois lados.

## Resumo

| Grupo | Épicos | Cards | Pontos |
| --- | --- | --- | --- |
| MVP | 10 | 78 | 244 |
| Dúvida | 4 | 20 | 57 |
| Pós-MVP | 4 | 26 | 86 |
| **Total** | **18** | **124** | **387** |

Se os cards adiáveis listados abaixo saírem do MVP, ele cai para **57 cards e 189 pontos** (21 cards, 55 pontos a menos).

## Épicos

| ID | Épico | Prio Notion | Cards | Pontos | Grupo | Justificativa |
| --- | --- | --- | --- | --- | --- | --- |
| E1 | Back-end em camadas pronto para crescer | P0 | 7 | 22 | MVP | Sem a API e a hospedagem dela não há compra (ver [[ADR-001-stack]]). |
| E2 | Base técnica pronta para evoluir com segurança | P0 | 10 | 26 | MVP | Monorepo, banco, testes e CI são pré-requisito do TDD e de qualquer feature. |
| E3 | Catálogo fácil de explorar | P0 | 8 | 23 | MVP | Catálogo é o primeiro passo da compra. |
| E4 | Checkout com Pix e cartão confiável | P0 | 8 | 32 | MVP | Núcleo do MVP: pedido, pagamento e confirmação. |
| E5 | Conta do cliente sem atrito | P0 | 8 | 23 | MVP | A compra exige conta; endereço é necessário para a entrega. |
| E6 | Entrega local calculada por distância | P0 | 5 | 13 | MVP | O checkout precisa de frete e de restrição de área. |
| E7 | Geladeira fluida e confiável | P0 | 8 | 30 | MVP | A Geladeira é o carrinho. |
| E8 | Identidade visual consistente em todo o site | P0 | 8 | 23 | MVP | Tokens e componentes base são usados por todas as telas do fluxo de compra. |
| E9 | Painel admin para operar a loja sozinho | P0 | 9 | 34 | MVP | Cadastrar cervejas, controlar estoque e ver/alterar pedidos é o mínimo de operação. |
| E10 | Página de produto que convence | P0 | 7 | 18 | MVP | Ficha da cerveja e "adicionar à Geladeira" fazem parte da compra. |
| E11 | Qualidade comprovada e portfólio publicado | P0 | 6 | 17 | Dúvida | Não é necessário para comprar, mas E2E do fluxo de compra e revisão de segurança são o que dá valor de portfólio. |
| E12 | Acesso responsável e dados protegidos | P1 | 5 | 13 | Dúvida | Verificação 18+ e bloqueio de menores fazem sentido para venda de álcool, mesmo num projeto fictício; cookies/LGPD podem esperar. |
| E13 | Avisos e relatório mensal automáticos | P1 | 4 | 15 | Dúvida | E-mail do pedido (LB-81, P0 no Notion) é esperado pelo cliente; WhatsApp e relatório mensal são Pós-MVP. |
| E14 | Clube do Leguelé com assinatura recorrente | P1 | 11 | 40 | Pós-MVP | Definido como "depois do MVP" na visão; também há pendências de regra (planos, descontos). |
| E15 | Mix & Match com packs personalizados | P1 | 7 | 23 | Pós-MVP | Definido como "depois do MVP" na visão; descontos dos packs ainda pendentes. |
| E16 | Pedidos acompanháveis do início ao fim | P1 | 5 | 12 | Dúvida | A compra termina na tela de confirmação (E4), mas histórico e detalhe do pedido (LB-67, LB-68) são P0 no Notion e esperados num e-commerce. |
| E17 | Site encontrável, instalável e rápido | P1 | 5 | 15 | Pós-MVP | SEO, PWA instalável e analytics não bloqueiam a compra. |
| E18 | Favoritos e avaliações reais | P2 | 3 | 8 | Pós-MVP | Engajamento, não compra. |

## Cards adiáveis dentro dos épicos MVP

Podem sair do MVP sem quebrar a compra de ponta a ponta:

| Épico | Cards | Pontos | Observação |
| --- | --- | --- | --- |
| E1 | LB-123 Filas e agendamentos | 3 | Só se o cancelamento de pedidos expirados (LB-60) usar outro mecanismo de agendamento. Depende da hospedagem da API. |
| E2 | LB-9 Validar env com Zod; LB-10 README de setup | 3 | Úteis, mas não bloqueiam. |
| E3 | LB-32 Banner rotativo; LB-37 Busca; LB-39 Chamada do Clube | 9 | O catálogo com filtros (LB-36) já permite achar a cerveja; o Clube é Pós-MVP. |
| E5 | LB-26 Login social | 3 | E-mail e senha bastam para comprar. |
| E6 | LB-65 Estimar tempo de entrega | 3 | Frete e área de entrega já cobrem o checkout. |
| E7 | LB-48 Mesclar Geladeira do convidado; LB-53 Cupom | 6 | Sem cupom no MVP, LB-80 também sai. |
| E8 | LB-16 Ícones do PWA; LB-17 Fundo de folhagem; LB-18 Páginas de erro | 6 | Acabamento; PWA é Pós-MVP. |
| E9 | LB-74 Categorias no admin; LB-78 Dashboard; LB-79 Banners; LB-80 Cupons | 13 | Categorias podem vir do seed; dashboard, banners e cupons não afetam a compra. |
| E10 | LB-43 Abas; LB-44 Quanto falta para frete grátis; LB-45 Sugestões; LB-46 Compartilhar | 9 | A ficha técnica (LB-40) já mostra o essencial. |

> [!todo] Diego: revisar os grupos (principalmente os 4 épicos em Dúvida) e os cards adiáveis; depois marcar `aprovado: true`.
