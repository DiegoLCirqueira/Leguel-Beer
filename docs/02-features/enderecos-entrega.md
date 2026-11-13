---
status: pronto
modulo: entrega
card-notion: https://app.notion.com/p/3fd490a7ac7d8112990dd5d423575b82
prioridade: P0
criado: 2026-11-12
issues:
  - "#45 LB-30"
  - "#48 LB-62"
  - "#49 LB-63"
  - "#50 LB-64"
  - "#52 LB-66"
tags:
  - feature
---

# Endereços e entrega

> [!info] Origem
> Item 4 da [[sequencia-telas]] (grupos E e F, parte da entrega). Derivada dos cards do Notion **LB-30** (#45, endereços com busca por CEP), **LB-62** (#48, spike de geocodificação e rota), **LB-63** (#49, frete por distância), **LB-64** (#50, área de entrega) e **LB-66** (#52, frete grátis), e das telas 20 (Meus endereços) e 29 (Endereço fora da área). Dados pessoais e maioridade ficam em [[dados-pessoais]]. As perguntas de produto foram ao Diego em 12/11 pelo Orchestrator; as respostas estão em "Decisões do Diego". Os termos seguem o [[GLOSSARY]].

## História de usuário

- **Como** cliente
- **Quero** guardar meus endereços de entrega, escolher um padrão e saber o frete antes de pagar
- **Para** receber as cervejas em casa sabendo quanto vou pagar, ou saber logo se a loja ainda não entrega onde estou

## Cenários

```gherkin
# language: pt
Funcionalidade: Endereços e entrega

  Esquema do Cenário: Buscar o endereço pelo CEP
    Dado que estou adicionando um endereço em "Meus endereços"
    Quando informo o CEP <cep>
    Então <resultado>

    Exemplos:
      | cep                         | resultado                                                                                      |
      | 57035-000                   | rua, bairro, cidade "Maceió" e UF "AL" são preenchidos e o cursor vai para o número           |
      | 57999-999 (inexistente)     | vejo "CEP não encontrado." e posso preencher rua, bairro e cidade à mão                        |
      | 01432-000 (de São Paulo)    | vejo "Por enquanto só entregamos em Alagoas." e não consigo salvar                             |
      | 57035-000 com o serviço de CEP fora do ar | vejo "Não foi possível buscar o CEP agora." e posso preencher à mão              |

  Cenário: Salvar o primeiro endereço
    Dado que não tenho endereço salvo
    Quando preencho CEP, rua, número, bairro e cidade de um endereço em Maceió e toco em "Salvar endereço"
    Então o endereço aparece na lista com o selo "Padrão"
    E a latitude e a longitude dele ficam gravadas

  Esquema do Cenário: Frete pelo endereço padrão
    Dado a cervejaria como origem, taxa base de R$ 5,00, R$ 1,50 por km, raio de 25 km e frete grátis a partir de R$ 150,00
    E meu endereço padrão a <distancia> de rota da cervejaria
    E o subtotal da Geladeira de <subtotal>
    Quando abro o resumo da Geladeira
    Então vejo no frete <frete>

    Exemplos:
      | distancia | subtotal  | frete     |
      | 5,2 km    | R$ 90,50  | R$ 13,00  |
      | 5,2 km    | R$ 149,99 | R$ 13,00  |
      | 5,2 km    | R$ 150,00 | Grátis    |
      | 25 km     | R$ 90,50  | R$ 42,50  |

  Cenário: Endereço fora da área de entrega
    Dado que meu endereço padrão está a 26 km de rota da cervejaria
    Quando abro "Meus endereços"
    Então vejo o selo "Fora da área" nesse endereço
    E no resumo da Geladeira vejo "Ainda não entregamos neste endereço" no lugar do frete
    E o checkout não avança com esse endereço

  Cenário: Trocar o endereço padrão
    Dado que tenho os endereços "Casa" (padrão) e "Trabalho"
    Quando marco "Trabalho" como padrão
    Então "Trabalho" passa a ter o selo "Padrão" e "Casa" deixa de ter
    E o frete do resumo da Geladeira passa a usar "Trabalho"

  Cenário: Endereços de outro cliente
    Dado que o cliente B tem um endereço salvo
    Quando eu, cliente A, peço à API para ler, alterar ou excluir esse endereço
    Então recebo "não encontrado"
    E o endereço do cliente B não muda
```

## Regras de negócio

### Endereços (LB-30)

- **Tela** `/conta/enderecos` ("Meus endereços", tela 20), aberta por "Meus endereços" em `/conta`. Exige conta.
- **Lista:** cada endereço com apelido, "rua, número", "bairro — cidade/UF", "CEP 00000-000", selo "Padrão" no padrão e selo "Fora da área" quando estiver fora da área de entrega. Ações: editar, excluir e "Tornar padrão". Lista vazia: "Você ainda não tem endereço salvo." e o formulário aberto.
- **Formulário** ("Adicionar novo endereço"):
  - **Apelido**, opcional, até 30 caracteres (ex.: Casa, Trabalho). Sem apelido, a lista mostra "Endereço".
  - **CEP**, obrigatório, 8 dígitos, máscara "00000-000"; a busca roda ao completar os 8 dígitos e pelo botão de busca.
  - **Rua**, **número** e **bairro**, obrigatórios, até 120, 10 e 80 caracteres; **complemento** opcional, até 60.
  - **Cidade** e **UF**: preenchidas pelo CEP ou à mão; a UF só pode ser AL.
  - **Alagoas pelo CEP também:** o schema compartilhado (site e API) só aceita CEP da faixa de Alagoas, que começa com 57 (57000-000 a 57999-999), além da UF AL. Digitar AL com CEP de outra UF não passa.
  - Mensagens por campo: "Informe o CEP.", "Informe a rua.", "Informe o número.", "Informe o bairro.", "Informe a cidade.".
- **Busca por CEP:** um serviço público de CEP (o card cita o ViaCEP) preenche rua, bairro, cidade e UF. CEP inexistente ou serviço fora do ar (ou mais de 5 s sem resposta) não impedem o preenchimento à mão. CEP fora da faixa de Alagoas (ou busca que devolve outra UF): "Por enquanto só entregamos em Alagoas.".
- **Coordenadas:** ao salvar (e ao editar rua, número, bairro, cidade ou CEP), a API calcula a latitude e a longitude do endereço pelo serviço escolhido no spike (LB-62) e as grava. Se o serviço não achar o endereço, nada é salvo e aparece "Não encontramos este endereço. Confira a rua, o número e o CEP.". O site nunca manda coordenadas: elas vêm da API.
- **Serviço de mapas fora do ar:** a API espera no máximo 8 s pela geocodificação e pela rota. Erro ou tempo esgotado: nada é salvo, a API responde 503 `MAPS_UNAVAILABLE` e o site mostra a mensagem pendente do Diego (proposta: "Não conseguimos calcular o frete agora. Tente de novo em instantes."). Na edição, o endereço anterior continua salvo como estava (coordenadas e distância inclusive) até uma edição dar certo.
- **Sem rota até a cervejaria** (o serviço acha o endereço, mas não há caminho de carro): o endereço é salvo com o selo "Fora da área".
- **Linha reta só por decisão do spike:** se o spike LB-62 concluir que não há rota gratuita, a distância passa a ser em linha reta para todos os endereços, por configuração. Nunca há troca silenciosa para linha reta numa requisição em que o serviço de rota falhou.
- **Padrão:** cada cliente tem exatamente um endereço padrão quando tem algum. O primeiro endereço vira padrão; "Tornar padrão" troca; excluir o padrão torna padrão o endereço salvo mais recentemente; excluir o último deixa a lista vazia.
- **Limite:** até 5 endereços por cliente. Com 5, "Adicionar novo endereço" fica desabilitado com a dica "Você pode guardar até 5 endereços.".
- **Posse:** a API só lê, altera e exclui endereços do cliente da sessão; endereço de outro cliente responde 404, como se não existisse.
- **"Usar minha localização"** (tela 20) fica fora do MVP. Ver "Decisões do Diego", pergunta 7.

### Área de entrega (LB-64)

- **Área de entrega:** endereços a até 25 km de distância de rota da cervejaria (inclusive). Acima disso, o endereço está fora da área.
- Endereço fora da área pode ser salvo: ganha o selo "Fora da área" e não serve para o checkout.
- Fora da área, o resumo da Geladeira mostra "Ainda não entregamos neste endereço" no lugar do frete, e o checkout (item 5) mostra a tela 29 com "Alterar endereço" (botão primário verde, que leva a "Meus endereços") e "Voltar ao catálogo", sem avançar para o pagamento.
- A API confere a área de novo ao criar o pedido (item 5) e recusa endereço fora dela com 422 `OUT_OF_DELIVERY_AREA`.

### Frete (LB-63 e LB-66)

- **Origem:** a cervejaria, um ponto fixo e fictício em Maceió guardado nas configurações de entrega.
- **Valor:** taxa base + valor por km × distância de rota em km, arredondado para cima ao próximo múltiplo de R$ 0,50. Com os valores iniciais: R$ 5,00 + R$ 1,50 por km (5,2 km dá R$ 12,80, que vira R$ 13,00).
- **Frete grátis:** subtotal de R$ 150,00 ou mais (inclusive). O subtotal é sempre calculado pela API a partir da Geladeira revalidada (preços atuais e quantidades disponíveis), nunca recebido no corpo do pedido nem da cotação; cupom e desconto de assinante são MVP+ e Pós-MVP.
- **Configurações de entrega** no banco, uma só linha: origem (latitude e longitude), taxa base, valor por km, raio máximo e mínimo para frete grátis, com os valores iniciais acima pelo seed. Mudam sem novo deploy; a tela de admin para elas fica para o item 8.
- **Uma regra só:** o cálculo é uma função pura compartilhada, usada pela cotação e pela criação do pedido. O frete gravado no pedido é recalculado pela API na hora, com as configurações em vigor e o subtotal revalidado por ela.
- **Cotação:** a API recebe só o id de um endereço do cliente da sessão; o subtotal vem da Geladeira da conta ([[geladeira]], LB-47), revalidada pela API. Devolve o frete, se é grátis e se está na área. Para o convidado, a Geladeira continua com "Informe seu endereço para calcular o frete" ([[geladeira]]).
- **No resumo da Geladeira** (cliente com endereço padrão): a linha do frete mostra o valor ou "Grátis", e o Total passa a somar o frete. Sem endereço salvo: "Cadastre um endereço para calcular o frete", com link para "Meus endereços".
- **Distância de rota:** calculada pela API ao salvar o endereço e guardada com ele, junto com a origem usada no cálculo. Se a origem das configurações mudar, a próxima cotação (ou criação de pedido) desse endereço recalcula e guarda a distância nova, na própria requisição, sem processo em segundo plano ([[ADR-002-hospedagem-api]]). Mudar o endereço também recalcula. Prazo de entrega fica fora (LB-65, adiável).

### Spike de geocodificação e rota (LB-62)

- Pergunta: qual serviço gratuito transforma endereços de Maceió em coordenadas e dá a distância de rota de carro, dentro do plano gratuito e sem cartão.
- Timebox de 3 h, com 10 endereços de bairros de Maceió e 3 de cidades vizinhas; compara rota com linha reta.
- Se nenhum serviço gratuito der rota, a distância passa a ser em linha reta, com o mesmo raio (ver "Decisões do Diego", perguntas 5 e 11).
- **Minimização dos dados (LGPD), critério de aceite do spike e dos adaptadores:**
  - O serviço de CEP recebe só o CEP.
  - O serviço de mapas recebe só o necessário: rua, número, bairro, cidade, UF e CEP para a geocodificação, e só as coordenadas de origem e destino para a rota. Nunca nome, e-mail, telefone, data de nascimento, id do cliente, token de sessão, apelido nem complemento.
  - Os logs da API não registram endereço completo nem coordenadas do cliente.
  - Os testes (red primeiro) capturam a requisição enviada a cada serviço e os logs, e falham se aparecer qualquer campo fora dessa lista.
  - Antes de usar dados reais, o spike registra os termos de uso, a retenção dos dados e se há transferência internacional de cada serviço candidato. A decisão de não pedir novo aceite (pergunta 3) continua valendo; se o spike achar algo que a Política não cobre, volta ao Diego.
- O resultado vai na descrição do PR do spike; se a escolha atender aos três critérios de ADR, o Back escreve o ADR no mesmo PR.

### LGPD

- O endereço já está na Política de Privacidade; entram as coordenadas e o envio do CEP e do endereço aos serviços de CEP e de mapas ("Com quem compartilhamos"). Ver "Decisões do Diego", pergunta 3, e [[termos-privacidade]].
- Endereços não aparecem completos em listas do admin.

### Fora de escopo

- "Usar minha localização" e mapa com pino (pergunta 7).
- Endereços fora de Alagoas e lista de espera para novas regiões.
- Prazo de entrega (LB-65), frete dinâmico por horário ou chuva, retirada no local.
- Tela de admin das configurações de entrega (item 8).
- Etapa Entrega do checkout (item 5, [[checkout]]): usa esta spec, mas a tela é do LB-55.

## Referência visual

- **Tela 20 (Meus endereços):** título com ícone, subtítulo "Gerencie seus endereços de entrega", cards com ícone, selo "Padrão" e editar, botão "Adicionar novo endereço" e o formulário "Novo endereço". Sem o par "Buscar por CEP" / "Usar minha localização" (a busca fica no campo CEP), sem busca e sem a lista de cidades em select (cidade e UF vêm do CEP). Exemplos do design em São Paulo trocados por Maceió.
- **Tela 29 (Endereço fora da área):** decisão já registrada em [[sequencia-telas]]: texto "Ainda não entregamos neste endereço" e botão primário verde. O exemplo do design (Farol, Maceió) estaria dentro da área; o E2E usa um endereço fora do raio.
- Normalizado ao padrão aprovado (regra da revisão em [[sequencia-telas]]).

## Seams de teste

> [!info] Proposta do Spec, aplicada como recomendação (12/11), vetável pelo Diego

- **Frete** (shared, unitário): tabela da função de frete, com arredondamento (12,80 → 13,00; 13,00 → 13,00; 13,01 → 13,50), R$ 149,99 e R$ 150,00, raio de 25 km e 25,01 km, configurações diferentes (cenário 2 do LB-63: o valor por km mudou e a cotação muda).
- **Endereço** (shared, unitário): schema com CEP, UF só AL, CEP fora da faixa 57 recusado mesmo com UF AL (ex.: 01432-000 com AL) e limites de tamanho.
- **CEP e mapas** (API): portas para o serviço de CEP e o de geocodificação e rota; adaptadores testados com respostas gravadas (sucesso, não encontrado, sem rota, erro e tempo esgotado), sem rede no CI; captura da requisição enviada e dos logs contra a lista de campos permitidos (minimização); edição com o serviço fora do ar mantém o endereço anterior.
- **Endereços** (API): casos de uso com repositório em memória (um padrão por cliente, primeiro vira padrão, excluir o padrão, limite de 5); rotas com Supertest e banco real (sem token 401, endereço de outro cliente 404, coordenadas vindas do serviço fake).
- **Cotação** (API): caso de uso com configurações e distância fakes; subtotal tirado da Geladeira da conta revalidada (um subtotal mandado no corpo é ignorado); origem mudada recalcula e guarda a distância nova; HTTP com endereço de outro cliente (404).
- **Telas** (componente): busca por CEP nos quatro casos, selos, lista vazia e limite.
- **E2E** (celular, 360 × 640): salvar o primeiro endereço com o CEP e os mapas simulados pela API de teste; frete no resumo da Geladeira; endereço fora da área.

## Fatias, com dono e ordem

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | LB-62 (#48), spike | Back | Escolha do serviço de geocodificação e rota, com a tabela de precisão e limites na descrição do PR; ADR se couber |
| 2 | Contrato (LB-30, LB-63, LB-64, LB-66) | Back | PR só em `@leguele/shared`: schema de endereço e a função pura de frete e área, com a tabela de testes |
| 3 | LB-63, LB-64, LB-66 (#49, #50, #52), API | Back | Configurações de entrega (migration e seed) e cotação de frete |
| 4 | LB-30 (#45), API | Back | Modelo de endereço (migration), CRUD do cliente da sessão, padrão, limite, CEP e geocodificação ao salvar |
| 5 | LB-30 (#45), site | Front | `/conta/enderecos` com busca por CEP, lista, selos, padrão e exclusão |
| 6 | LB-63, LB-64 no site | Front | Frete e "fora da área" no resumo da Geladeira; a tela 29 entra com o checkout (item 5) |

A fatia 1 vem antes das 3 e 4. A 2 pode andar junto com a 1. A 5 depende da 4; a 6, da 3 e da 5.

Candidatos a ADR: a escolha do serviço de geocodificação e rota (fatia 1), se atender aos três critérios.

## Decisões relacionadas

- [[dados-pessoais]], [[geladeira]], [[checkout]], [[termos-privacidade]] (página Entregas)
- [[mvp-corte]], [[sequencia-telas]], [[ADR-002-hospedagem-api]], [[ADR-009-guard-global-fechado]], [[ADR-010-validacao-com-zod]]

## Decisões do Diego

Perguntas de 12/11, levadas pelo Orchestrator. Resposta do Diego: "todas as recomendadas".

3. **Política de Privacidade: A.** Texto e data de `/privacidade` atualizados, sem novo aceite. Ver "Texto novo de /privacidade" abaixo.
5. **Área de entrega e origem: A.** Raio de 25 km pela distância de rota, a partir de um ponto fictício de Maceió escolhido pelo Back no seed (ex.: Jaraguá). Se o spike LB-62 não achar rota gratuita, vale a opção C: linha reta, com o mesmo raio.
6. **Valores do frete: sim.** Taxa base de R$ 5,00, R$ 1,50 por km, arredondamento para cima em R$ 0,50 e frete grátis a partir de R$ 150,00, no banco, sem tela de admin no item 4.
7. **"Usar minha localização": A.** Fora do MVP: só CEP e número, com as coordenadas calculadas pela API ao salvar.
8. **Regras dos endereços: A.** Apelido livre opcional, até 5 endereços, exclusão permitida, o primeiro vira padrão, excluir o padrão torna padrão o mais recente, só Alagoas.
9. **Endereço fora da área: A.** Pode salvar, com o selo "Fora da área"; o checkout não avança com ele.
11. **Conta em serviço de mapas: sim.** O Back pode criar conta e chave só em plano gratuito sem cartão; senão, linha reta (C da pergunta 5). A chave fica só no `.env` da API (fora do git), com a chave sem valor no `.env.example`.

As perguntas 1, 2, 4 e 10 estão em [[dados-pessoais]].

### Texto novo de /privacidade (pergunta 3)

Fonte única em [[termos-privacidade]] ("Decisões do Diego (2026-11-12)"). Nesta spec, a parte dos endereços:

- "Quais dados coletamos" troca "quando usar o checkout, endereço de entrega" por: "os endereços de entrega que você salvar, com a localização (latitude e longitude) e a distância até a cervejaria calculadas a partir deles".
- "Para que usamos" ganha: "calcular o frete".
- "Com quem compartilhamos" ganha: "os serviços de CEP e de mapas, que recebem o CEP e o endereço para preencher o endereço e calcular a distância".
- Sem novo aceite: muda só a data de "última atualização" de `/privacidade` e a versão da Política no `LEGAL_VERSIONS` da API, no dia em que o texto entrar no site.

## Decisões tomadas sem consulta

Recomendações aplicadas pelo Spec em 12/11; qualquer uma pode ser vetada.

- **Geocodificação falhou, nada é salvo:** assim todo endereço salvo tem coordenadas e frete calculável.
- **Mapas fora do ar:** espera máxima de 8 s; na edição, o endereço anterior é mantido.
- **Sem rota:** o endereço é salvo como "Fora da área".
- **Distância guardada com o endereço e a origem usada**, recalculada na próxima cotação quando a origem muda ou quando o endereço muda (evita chamar o serviço de mapas a cada abertura da Geladeira).
- **Frete no resumo da Geladeira pelo endereço padrão**, como a [[geladeira]] já previa para o item 4; sem endereço, "Cadastre um endereço para calcular o frete".
- **Busca de CEP com tempo máximo de 5 s** antes de liberar o preenchimento à mão.
- **Limites de tamanho dos campos** (apelido 30, rua 120, número 10, bairro 80, complemento 60).
- **Textos novos:** "CEP não encontrado." (do card), "Por enquanto só entregamos em Alagoas.", "Não foi possível buscar o CEP agora.", "Não encontramos este endereço. Confira a rua, o número e o CEP.", "Você ainda não tem endereço salvo.", "Você pode guardar até 5 endereços.", "Cadastre um endereço para calcular o frete", "Tornar padrão" e as mensagens por campo.

## Tickets propostos

Reconciliação das issues #45, #48, #49, #50 e #52, a pedir ao Orchestrator depois do merge desta spec (aprovação permanente para reconciliar issue com spec mergeada): link para esta spec, os cenários e as regras de cada card, "Usar minha localização" fora do #45 e a tela 29 e a checagem no pedido (#50) dependentes do item 5. No #52, usar "a partir de R$ 150,00" (inclusive), não "acima de". Nenhuma issue nova.
