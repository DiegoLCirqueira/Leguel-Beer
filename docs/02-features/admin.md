---
status: pronto
modulo: admin
card-notion: https://app.notion.com/p/3fd490a7ac7d815b85f5ed27a5c4424f
prioridade: P0
criado: 2026-11-13
issues:
  - "#72 LB-72"
  - "#73 LB-73"
  - "#75 LB-75"
  - "#76 LB-76"
  - "#77 LB-77"
tags:
  - feature
---

# Admin

> [!info] Origem
> Item 8 da [[sequencia-telas]] (grupo I). Derivada dos cards do Notion **LB-72** (#72, área admin protegida por papel), **LB-73** (#73, cadastro de cervejas com foto), **LB-75** (#75, estoque com alerta), **LB-76** (#76, pedidos e status) e **LB-77** (#77, regras de entrega), e das telas 21 (Área Admin), 22 (Cerveja) e 23 (Painel). Ficam fora as categorias (LB-74, vêm do seed), o dashboard de vendas (LB-78), banners (LB-79) e cupons (LB-80), adiados pelo [[mvp-corte]]. Os termos seguem o [[GLOSSARY]]; o acesso segue [[guards-api]] e [[ADR-014-admin-so-com-email-confirmado]].

As perguntas de produto, pagamento e LGPD foram ao Diego em 13/11 pelo Orchestrator; as respostas estão em "Decisões do Diego (13/11)".

## História de usuário

- **Como** admin da Leguelé Beer
- **Quero** cadastrar as cervejas, controlar o estoque, andar com os pedidos e ajustar o frete pelo celular
- **Para** operar a loja sozinho, sem novo deploy e sem mexer no banco

## Cenários

```gherkin
# language: pt
Funcionalidade: Admin

  Cenário: Cliente comum tenta entrar no admin
    Dado que entrei como cliente sem o papel admin
    Quando abro "/admin/cervejas" ou chamo uma rota de admin da API
    Então vejo a página "não encontrada" no site
    E a API responde "proibido" sem alterar nada

  Cenário: Cadastrar uma cerveja com foto
    Dado que sou admin e a categoria "Lager" tem 3 cervejas ativas
    Quando cadastro a "Sururu Lager" na categoria "Lager", com preço R$ 24,90, 5,0 %, 18 IBU, 600 ml, estoque inicial 24 e uma foto JPG de 3 MB, e salvo
    Então a "Sururu Lager" aparece no catálogo público com a foto em WebP
    E o estoque dela mostra o movimento "Entrada inicial" de 24 unidades

  Cenário: Limite de 4 cervejas ativas por categoria
    Dado que a categoria "IPA" já tem 4 cervejas ativas
    Quando tento cadastrar, ativar ou mover para "IPA" outra cerveja ativa
    Então vejo "A categoria IPA já tem 4 cervejas ativas. Desative uma antes."
    E nada é salvo

  Esquema do Cenário: Ajustar o estoque
    Dado que a "Ponta Verde Pilsen" tem <fisico> unidades físicas, <reservado> reservadas e mínimo 6
    Quando registro <ajuste>
    Então <resultado>

    Exemplos:
      | fisico | reservado | ajuste                        | resultado                                                                                          |
      | 3      | 0         | entrada de 24, "Produção"     | o físico passa a 27, o disponível a 27, o movimento fica no histórico e o selo "Baixo" some       |
      | 13     | 6         | perda de 1, "Garrafa quebrada" | o físico passa a 12, o disponível a 6 e a cerveja sobe para o topo com o selo "Baixo"             |
      | 2      | 0         | perda de 5                    | vejo "O estoque físico não pode ficar negativo." e nada muda                                       |
      | 8      | 6         | correção de -3                | vejo "O estoque físico não pode ficar abaixo das 6 unidades reservadas." e nada muda               |

  Esquema do Cenário: Andar com o status do pedido
    Dado um pedido "<status>"
    Quando abro o pedido no admin
    Então vejo as ações <acoes>

    Exemplos:
      | status               | acoes                                   |
      | Aguardando pagamento | "Cancelar pedido"                       |
      | Pago                 | "Iniciar preparo" e "Cancelar pedido"   |
      | Em preparo           | "Saiu para entrega" e "Cancelar pedido" |
      | Saiu para entrega    | "Marcar como entregue"                  |
      | Entregue             | nenhuma                                 |
      | Cancelado            | nenhuma                                 |

  Cenário: Alterar o valor por km
    Dado as configurações de entrega com R$ 1,50 por km e um endereço salvo a 5,2 km de rota
    Quando altero o valor por km para R$ 2,00 e salvo
    Então o simulador mostra o frete de R$ 15,50 para 5,2 km
    E o resumo da Geladeira de um cliente com esse endereço e subtotal de R$ 90,50 mostra o frete de R$ 15,50
```

## Regras de negócio

### Acesso e navegação (LB-72, tela 21)

- **Quem entra:** só a conta com o papel admin ([[guards-api]]; o papel exige e-mail confirmado, [[ADR-014-admin-so-com-email-confirmado]]). Um admin só, sem perfis de acesso.
- **Site:** toda rota `/admin/*` mostra a página "não encontrada" para quem não é admin, como o `/admin` já faz; sem sessão, também "não encontrada" (não convida a entrar). As páginas do admin não são indexadas.
- **API:** toda rota de admin (cervejas, caminho de envio da foto, estoque, fila e detalhe de pedidos, ações de status, configurações e simulador de entrega) responde 401 sem token e 403 para cliente comum, sem alterar nada e sem dados no corpo do erro nem no log ([[guards-api]]). O papel é lido do banco, nunca de um campo do token: um token com papel admin forjado nos metadados não dá acesso ([[ADR-014-admin-so-com-email-confirmado]]).
- **Pedidos de qualquer cliente:** as rotas de admin leem os pedidos de todos os clientes; a regra de posse das rotas do cliente ([[pedidos-cliente]]) não se aplica a elas.
- **Layout próprio**, mobile-first como o resto do site, sem a barra inferior da loja: cabeçalho com "Admin" e o menu **Início, Cervejas, Estoque, Pedidos e Entrega**. Itens fora do MVP (Categorias, Clube, Banners, Cupons, Dashboard) não aparecem.
- **Início** (`/admin`): os atalhos do menu e dois alertas tocáveis: "N cervejas com estoque baixo" (leva a Estoque) e "N pedidos pagos aguardando preparo" (leva a Pedidos filtrado por "Pago"). Sem faturamento, comparativos nem gráficos (pergunta 1; LB-78 fora).

### Cervejas (LB-73, tela 22)

- **Lista** `/admin/cervejas`: todas as cervejas, ativas e inativas, com foto, nome, categoria, preço, disponível e o selo "Inativa"; busca por nome e filtro Todas / Ativas / Inativas; botão "Nova cerveja".
- **Formulário** (novo e editar), com o mesmo schema na API e no site ([[ADR-010-validacao-com-zod]]):
  - **Nome**, obrigatório, até 80 caracteres, único (sem diferenciar maiúsculas).
  - **Categoria**, obrigatória, uma das categorias do cadastro (vêm do seed; LB-74 fora).
  - **Estilo**, obrigatório, texto até 40 caracteres (ex.: "American IPA").
  - **Descrição curta**, opcional, até 200 caracteres ([[produto]]).
  - **Preço**, obrigatório, maior que zero. **Preço anterior**, opcional; se informado, maior que o preço: "O preço anterior deve ser maior que o atual" (texto do card). O design chama de "Preço promocional" e inverte os valores; vale o [[produto]] (desconto calculado a partir do preço anterior).
  - **Volume** em ml, inteiro de 100 a 2000. **Teor alcoólico** em %, de 0,0 a 20,0, uma casa decimal. **IBU**, inteiro de 0 a 150.
  - **Estoque inicial** e **estoque mínimo** só no cadastro (inteiros, 0 ou mais; mínimo padrão 6, pergunta 3); depois, o estoque muda só pela tela de Estoque e o mínimo pode ser editado aqui.
  - **Destaque** (liga ou desliga; [[destaques-home]]) e **Disponível no catálogo** (cerveja ativa).
  - **Foto** (pergunta 2): uma por cerveja. O admin escolhe um PNG, JPG ou WebP de até 5 MB (limite do arquivo original), com a garrafa recortada em fundo transparente, como as fotos atuais ([[geladeira]]). O site converte para WebP otimizado de até 40 KB (o tamanho servido pela [[geladeira]]), mostra a prévia e só envia esse WebP. PDF, outro formato ou original acima de 5 MB: "Envie uma imagem PNG, JPG ou WebP de até 5 MB." e nada é enviado; se a otimização não chegar a 40 KB: "Não conseguimos otimizar esta foto. Tente uma imagem menor." e nada é enviado. Sem foto, vale a imagem padrão do [[catalogo]].
- **Slug** gerado do nome (sem acento, minúsculo, com hífen), único; se já existir, ganha "-2", "-3". Fica fixo depois de criado, para não quebrar links; `destaques` é reservado ([[produto]]).
- **Desativar em vez de excluir:** não há exclusão. A cerveja inativa some do catálogo, da home e dos contadores, e continua nos pedidos antigos com o nome e o preço da compra ([[pedidos-cliente]]).
- **Limite de 4 cervejas ativas por categoria**, conferido pela API (não só no formulário) ao cadastrar, ativar e trocar de categoria: "A categoria IPA já tem 4 cervejas ativas. Desative uma antes." (texto do card, com o nome da categoria). Cerveja inativa não conta. É o limite das 4 posições por prateleira da [[geladeira]]. Duas gravações simultâneas que disputam a 4ª vaga da mesma categoria: só uma passa.
- **Fotos no armazenamento** (armazenamento de arquivos do Supabase, [[ADR-001-stack]]; rascunho em [[ADR-017-fotos-com-sessao-do-admin]]):
  - um bucket só para as fotos das cervejas, que aceita só `image/webp` até 40 KB; leitura pública, escrita pública negada;
  - o caminho e o nome do arquivo são gerados pela API (aleatórios, um por envio) e valem 10 minutos; o envio nunca sobrescreve um arquivo existente;
  - o navegador converte para WebP e manda o arquivo ao **servidor do site**, que o envia ao armazenamento com o token da sessão do admin (o navegador nunca vê o token nem a chave, que ficam no servidor do site, [[ADR-012-sessao-em-cookies-httponly]]); uma política do armazenamento só deixa gravar nesse bucket quem tem o papel admin no banco, por uma função dedicada que não abre a tabela de perfis. A chave de serviço do Supabase não entra na API nem no site (ela é só do seed);
  - antes de gravar o endereço na cerveja, a API confere que o arquivo existe no caminho que ela gerou (dentro dos 10 minutos), que os bytes são de fato WebP (não só o tipo ou a extensão declarados) e que tem até 40 KB; senão, recusa e nada muda na cerveja. O limite e o formato valem no caminho confiável (bucket e API), não só no site;
  - foto trocada: o arquivo antigo pode ficar no bucket (limpeza fora do MVP); as fotos atuais em `apps/web/public/cervejas/` continuam valendo até o admin trocar cada uma.
- **Depois de salvar:** o catálogo, a home e a página de produto mostram a mudança na próxima abertura.

### Estoque (LB-75, tela 23)

- **Tela** `/admin/estoque`: por cerveja, físico, reservado e disponível ([[GLOSSARY]], "Quantidade disponível"), mínimo e o selo "Baixo" quando o disponível fica igual ou abaixo do mínimo. As com "Baixo" vêm primeiro; depois, por nome.
- **Ajuste** com tipo e motivo: **Entrada** (soma; motivo padrão "Produção"), **Perda** (subtrai) e **Correção** (soma ou subtrai). Quantidade inteira diferente de zero; motivo livre até 80 caracteres, obrigatório em Perda e Correção.
- **Recusas:** físico negativo ("O estoque físico não pode ficar negativo.") e físico abaixo do reservado ("O estoque físico não pode ficar abaixo das N unidades reservadas.").
- **Histórico** por cerveja: data e hora, tipo, quantidade, motivo e saldo físico depois do movimento, do mais recente ao mais antigo. Vendas e cancelamentos de pedido também entram no histórico, com o número do pedido.
- **Concorrência:** o ajuste usa a mesma trava por cerveja da criação do pedido (LB-56), para um ajuste e uma venda simultâneos não deixarem o estoque errado.
- O "Baixo" do admin (mínimo por cerveja) é diferente do aviso ao cliente de 1 a 5 unidades da [[produto]].

### Pedidos (LB-76, tela 23)

- **Fila** `/admin/pedidos`: número, data e hora, status, total e bairro, do mais recente ao mais antigo, 20 por vez, com filtro por status (os 6 de [[pedidos-cliente]]). Sem tempo real e sem som ([[ADR-002-hospedagem-api]]: sem WebSocket): a lista se atualiza ao abrir e pelo botão "Atualizar".
- **Detalhe** `/admin/pedidos/[id]`: itens com quantidade e preço da compra, subtotal, frete, total, forma de pagamento, status e os dados de entrega da pergunta 5 (nome, telefone, endereço completo e "Abrir no mapa").
- **"Abrir no mapa":** link externo para o Google Maps com só o endereço (sem nome nem telefone), aberto em outra aba com `rel="noopener noreferrer"` e só quando o admin toca; sem mapa embutido nem pré-carregamento.
- **Transições**, só para a frente: Pago → Em preparo ("Iniciar preparo") → Saiu para entrega → Entregue ("Marcar como entregue"). Pago só pelo pagamento (item 6), nunca pelo admin. A API recusa qualquer outra transição com 409, mesmo que o botão não apareça.
- **Cancelar** (pergunta 4): em "Aguardando pagamento", "Pago" e "Em preparo", com motivo obrigatório (até 120 caracteres). O motivo é interno: o cliente vê só "Cancelado". As unidades voltam a ficar disponíveis (a reserva é liberada ou o físico volta, conforme o modelo do LB-56) e entram no histórico do estoque. Se o pedido estava pago, a tela avisa "Faça o reembolso no painel do Mercado Pago." (reembolso manual; automático fora).
- **Concorrência:** toda mudança de status (avançar, cancelar, aprovar pelo pagamento, expirar) só acontece se o pedido ainda estiver no status que a ação espera, na mesma transação que mexe no estoque e no histórico do estoque e do pedido (efeito único); a segunda tentativa responde 409 e não muda nada. Assim:
  - dois toques em "Cancelar pedido" devolvem o estoque uma vez só;
  - cancelar um pedido "Aguardando pagamento" enquanto chega a aprovação do pagamento ou a expiração: uma das ações vence; o pedido nunca fica pago e cancelado ao mesmo tempo, nem com estoque devolvido e baixado, e um "Cancelado" nunca volta a outro status;
  - cancelar enquanto outro toque marca "Saiu para entrega": uma das duas vence; se o despacho vencer, o cancelamento responde 409;
  - aprovação que chega para pedido já cancelado segue a resposta 5 do item 6 ([[checkout]]): o pedido continua "Cancelado" e o detalhe mostra "Pagamento recebido após o cancelamento: faça o reembolso no painel do Mercado Pago.".
- Cada mudança de status grava quem, quando e o status anterior (histórico do pedido, base do LB-68).
- O cliente vê o novo status em "Meus pedidos" na próxima abertura ([[pedidos-cliente]]).

### Entrega (LB-77, tela 23)

- **Tela** `/admin/entrega`: as configurações de entrega de [[enderecos-entrega]]: origem, taxa base, valor por km, raio máximo e mínimo do frete grátis (pergunta 6). Sem tempo de preparo, horário de funcionamento nem WhatsApp.
- **Validação:** taxa base e valor por km de R$ 0,00 a R$ 100,00; raio de 1 a 100 km; mínimo do frete grátis de R$ 0,00 a R$ 10.000,00. Valor negativo ou fora da faixa mostra o erro no campo e nada é salvo.
- **Origem** editada como endereço (CEP, rua, número, bairro, cidade); a API calcula as coordenadas pelo serviço de mapas do LB-62. Serviço fora do ar: nada é salvo e aparece "Não conseguimos calcular o frete agora. Tente de novo em instantes.". Mudar a origem faz as distâncias dos endereços serem recalculadas na próxima cotação ([[enderecos-entrega]]).
- **Simulador:** o admin informa CEP e número (ou escolhe a origem como teste) e um subtotal, e vê a distância, o frete ou "Grátis" e se está na área, com as configurações salvas. Não grava endereço.
- A mudança vale na próxima cotação da Geladeira e na criação do pedido, sem deploy.

### LGPD

- O admin vê dados pessoais só no detalhe do pedido e só o necessário para a entrega (pergunta 5). Endereços não aparecem completos em listas ([[enderecos-entrega]]). Os logs da API não registram dados pessoais dos clientes.

## Fora de escopo

- Categorias no admin (LB-74), dashboard de vendas (LB-78), banners (LB-79), cupons (LB-80), Clube.
- Fila em tempo real, som de novo pedido, impressão de comanda, lançar pedido manual.
- Reembolso automático; várias fotos por cerveja; importação por planilha; variantes de volume; lote e validade.
- Tempo de preparo, horário de funcionamento, WhatsApp, bairros atendidos e pedido mínimo (o frete é por distância).
- Vários admins ou perfis de acesso.

## Referência visual

- **Tela 21 (Área Admin):** atalhos em cards com ícone e os alertas. Sem faturamento, "vs. ontem", "Visão geral" com período, "Relatórios" nem "Nova regra".
- **Tela 22 (Cerveja):** formulário com foto, prévia ao vivo do card e "Dicas de preenchimento". Uma foto só (sem reordenar), sem favoritar na prévia, "Preço anterior" no lugar de "Preço promocional", volume livre em ml.
- **Tela 23 (Painel):** as abas Estoque, Pedidos e Entrega viram páginas do menu. Sem "Pedido mínimo", "Bairros atendidos", "Prazo estimado", "Entrega ativada" nem "Lançar pedido manual"; a taxa é por distância.
- Normalizado ao padrão aprovado (regra da revisão em [[sequencia-telas]]); componentes novos em `components/ui` com vitrine em `/dev/tokens`.

## Seams de teste

> [!info] Proposta do Spec, vetável

- **Contrato** (shared, unitário): schema da cerveja (preço anterior maior, limites de volume, teor e IBU, nome até 80), gerador de slug (acento, repetido, `destaques`), schema do ajuste de estoque e das configurações de entrega (faixas).
- **Cervejas** (API): caso de uso de cadastro e edição com repositório em memória (limite de 4 ao criar, ativar e trocar de categoria; inativa não conta; nome repetido); rotas com Supertest e banco real (cliente 403, sem token 401, só admin pede o caminho de envio; endereço de foto fora do caminho gerado, arquivo ausente, não WebP ou acima de 5 MB recusados sem mudar a cerveja). Política do armazenamento testada no Supabase local, com envio direto (sem o site): admin grava no caminho gerado; cliente comum e sem sessão não gravam; escrita pública negada; caminho diferente do autorizado ou vencido (mais de 10 min) recusado pela API; envio para um caminho existente não sobrescreve; tipo ou extensão falsos (PNG com nome .webp), arquivo inválido e acima de 40 KB recusados pelo bucket ou pela API antes de publicar. Nenhuma chave de serviço no processo da API. A API recusa o que não for WebP ou passar de 40 KB (o limite de 5 MB vale só para o original, no navegador). Integração com banco real: duas gravações simultâneas pela 4ª vaga da categoria, só uma passa.
- **Estoque** (API): caso de uso de ajuste com repositório em memória (as 4 linhas do Esquema); integração com banco real para ajuste e venda simultâneos na mesma cerveja.
- **Pedidos** (API): máquina de status pura (todas as transições, válidas e inválidas) e cancelamento com devolução ao estoque; rotas com Supertest (cliente 403, transição inválida 409). A máquina pura não prova a concorrência; integração com banco real: dois cancelamentos simultâneos devolvem o estoque e gravam o histórico uma vez (o segundo 409); cancelar × expirar × aprovar o mesmo pedido "Aguardando pagamento" ao mesmo tempo deixa um só resultado, sem saldo duplicado nem "Cancelado" ressuscitado; cancelar × "Saiu para entrega" deixa um só; aprovação de pedido já cancelado mantém "Cancelado" e grava a marca de reembolso.
- **Acesso** (API, Supertest e banco real): matriz de todas as rotas de admin com sem token (401), cliente comum (403) e token de cliente com papel admin forjado nos metadados (403), sem dados no erro nem no log; o admin lê pedidos de clientes diferentes.
- **Dados pessoais** (API e telas): a resposta da fila não traz nome, telefone nem endereço completo (só o bairro); os logs de sucesso e de erro das rotas de pedidos não registram dados pessoais; no detalhe, nenhuma requisição ao serviço de mapas antes do toque em "Abrir no mapa", e o link leva só o endereço.
- **Entrega** (API): salvar configurações e simular com o serviço de mapas fake; mapas fora do ar não salva a origem.
- **Telas** (componente): formulário da cerveja (erros por campo, arquivo inválido, original de 5 MB que vira WebP maior é recusado), "Abrir no mapa" só com o endereço e `rel="noopener noreferrer"`, motivo do cancelamento fora da tela do cliente, estoque com "Baixo" no topo, ações por status, simulador.
- **E2E** (celular, 360 × 640): cliente em `/admin/cervejas` vê "não encontrada"; admin cadastra cerveja com foto e ela aparece no catálogo; ajuste de estoque; avançar um pedido criado pela API de teste; alterar o valor por km e ver o simulador.

## Fatias, com dono e ordem

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | Contrato (LB-73, LB-75, LB-77) | Back | PR só em `@leguele/shared`: schemas da cerveja, do ajuste e das configurações, e o gerador de slug |
| 2 | LB-72 (#72) | Front | Layout do admin, menu, início com os alertas (contadores vindos da API) e "não encontrada" em `/admin/*` |
| 3 | LB-73 (#73), API | Back | Cadastro e edição com limite por categoria, mínimo e estoque inicial; bucket, política do armazenamento e conferência da foto |
| 4 | LB-73 (#73), site | Front | Lista, formulário, envio da foto em WebP e prévia |
| 5 | LB-75 (#75) | Back e Front | Movimentos de estoque (migration), ajuste com trava, histórico e a tela |
| 6 | LB-77 (#77) | Back e Front | Rotas de admin das configurações de entrega, simulador e a tela; depende das configurações do item 4 |
| 7 | LB-76 (#76) | Back e Front | Fila, detalhe, transições e cancelamento; depende do modelo de pedido (item 5) e do pagamento (item 6) |

A 1 vem antes das 3 a 6. A 2 pode andar junto. A 7 vem por último.

Candidatos a ADR: [[ADR-017-fotos-com-sessao-do-admin]] (rascunho neste PR; o Back o confirma ou ajusta na fatia 3).

## Decisões relacionadas

- [[guards-api]], [[catalogo]], [[produto]], [[destaques-home]], [[geladeira]], [[enderecos-entrega]], [[pedidos-cliente]], [[checkout]]
- [[mvp-corte]], [[sequencia-telas]], [[ADR-001-stack]], [[ADR-002-hospedagem-api]], [[ADR-009-guard-global-fechado]], [[ADR-010-validacao-com-zod]], [[ADR-014-admin-so-com-email-confirmado]]

## Decisões do Diego (13/11)

Perguntas levadas pelo Orchestrator. Resposta do Diego: "todas as recomendadas".

1. **Início do admin: A.** Menu e 2 alertas ("N cervejas com estoque baixo" e "N pedidos pagos aguardando preparo"); sem faturamento nem comparativos (LB-78 fora).
2. **Fotos da cerveja: A.** Uma foto por cerveja, convertida para WebP no navegador, até 5 MB (o original; o WebP final tem até 40 KB), no armazenamento de arquivos do Supabase.
3. **Estoque mínimo: A.** 6 unidades por padrão, editável por cerveja.
4. **Cancelar pedido pago: A.** O admin cancela até antes de "Saiu para entrega", com motivo; o estoque volta; pedido pago mostra "Faça o reembolso no painel do Mercado Pago." (reembolso manual).
5. **Dados do cliente no pedido (LGPD): A.** Na fila, número, data, status, total e bairro; no detalhe, nome, telefone, endereço completo e "Abrir no mapa" (Google Maps, aberto só quando o admin toca).
6. **Regras de entrega: A.** Só os 5 campos do frete e o simulador, sem prazo.

As 6 respostas acima são do Diego. As escolhas operacionais abaixo, tomadas sem consulta, ficam valendo e continuam vetáveis por ele.

## Decisões tomadas sem consulta

Recomendações aplicadas pelo Spec em 13/11; qualquer uma pode ser vetada.

- **Envio da foto pelo servidor do site com a sessão do admin** e política do armazenamento pelo papel admin, sem chave de serviço ([[ADR-017-fotos-com-sessao-do-admin]]); original até 5 MB e WebP final otimizado até 40 KB, foto recortada com fundo transparente, caminho gerado pela API e válido por 10 min, sem sobrescrever.
- **Motivo do cancelamento interno**; "Abrir no mapa" só com o endereço.
- **"Baixo" com o disponível igual ou abaixo do mínimo.**
- **Menu só com o que está no MVP** (Início, Cervejas, Estoque, Pedidos, Entrega).
- **Fila sem tempo real**, com "Atualizar".
- **Transições só para a frente**; cancelar até "Em preparo".
- **Slug fixo depois de criado**, com "-2" para repetido.
- **Estoque inicial e mínimo no cadastro;** depois, estoque só pela tela de Estoque (Entrada, Perda, Correção), sem deixar o físico abaixo do reservado.
- **Origem editada por endereço**, com as coordenadas calculadas pela API.
- **Faixas dos campos** (nome 80, estilo 40, volume 100 a 2000 ml, teor 0 a 20 %, IBU 0 a 150, frete e raio nas faixas acima).
- **Sem sessão em `/admin/*`, "não encontrada"** (não leva a `/entrar`).
- **Textos novos:** "Nova cerveja", "Inativa", "Baixo", "Entrada inicial", "Envie uma imagem PNG, JPG ou WebP de até 5 MB.", "O estoque físico não pode ficar negativo.", "O estoque físico não pode ficar abaixo das N unidades reservadas.", "Iniciar preparo", "Saiu para entrega", "Marcar como entregue", "Cancelar pedido", "Faça o reembolso no painel do Mercado Pago.", "Atualizar" e os alertas do início.

## Tickets propostos

Reconciliação das issues #72, #73, #75, #76 e #77, a pedir ao Orchestrator depois do merge desta spec (aprovação permanente para reconciliar issue com spec mergeada): link para esta spec e o recorte de cada card (no #73, 1 foto; no #76, sem tempo real nem som; no #77, sem prazo, horário e WhatsApp). Nenhuma issue nova.
