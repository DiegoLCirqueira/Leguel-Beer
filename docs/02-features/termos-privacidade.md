---
status: rascunho
modulo: acesso
card-notion: https://app.notion.com/p/3fd490a7ac7d815c9785f1be8cd09271
prioridade: P1
criado: 2026-10-29
atualizado: 2026-11-03
issues:
  - "#100 LB-22"
tags:
  - feature
---

# Termos, privacidade e entregas

> [!info] Origem
> Derivada do card do Notion **LB-22** (#100), que o Diego puxou do MVP+ para o MVP em 2026-10-29, na fase 1 do acesso, antes do cadastro ([[roteiro-mvp]]): os links "Termos de Uso" e "Política de Privacidade" de "Criar sua conta" ([[cadastro-login]]) precisam de destino. A página do projeto no Notion registra que os dados da empresa (CNPJ, endereço) são fictícios e que os pagamentos rodam em modo de teste ([[visao]]).

## História de usuário

- **Como** pessoa que visita a Leguelé Beer (cliente, convidado ou recrutador)
- **Quero** ler os termos de uso, a política de privacidade e as regras de entrega
- **Para** saber as regras do site e o que acontece com os dados que eu informo

## Cenários

```gherkin
# language: pt
Funcionalidade: Termos, privacidade e entregas

  Cenário: Rodapé com avisos e links
    Dado que confirmei a maioridade e estou com sessão iniciada
    Quando abro /conta e rolo até o fim
    Então vejo "Aprecie com moderação" e "Venda proibida para menores de 18 anos"
    E vejo os links "Termos de Uso", "Política de Privacidade" e "Entregas"
    E não vejo a razão social nem o CNPJ da empresa
    E em /, /catalogo, /entregas, /entrar e /criar-conta não vejo o rodapé

  Cenário: Termos abertos do cadastro não apagam o formulário
    Dado que preenchi parte de "Criar sua conta"
    Quando toco em "Termos de Uso"
    Então os Termos de Uso abrem numa nova aba
    E na aba do cadastro os campos continuam preenchidos

  Cenário: Páginas legais abrem sem a pergunta de maioridade
    Dado que não confirmei a maioridade
    Quando abro /termos ou /privacidade
    Então vejo a página pedida, sem a pergunta de maioridade

  Cenário: Páginas mostram a data da última atualização
    Dado que abro /termos, /privacidade ou /entregas
    Quando a página carrega
    Então vejo "Última atualização:" seguido da data da versão do texto
```

## Regras de negócio

- **Páginas:** `/termos` (Termos de Uso), `/privacidade` (Política de Privacidade) e `/entregas` (Entregas). Conteúdo estático, versionado no repositório, com a data da última atualização.
- **Sem aviso de portfólio:** nenhuma página do site mostra faixa, nota ou texto dizendo que o site é um projeto de portfólio (decisão do Diego, 2026-10-30).
- **Rodapé:** só em `/conta`, `/termos` e `/privacidade`; sem rodapé na loja (`/`, `/catalogo` e demais páginas de compra), em `/entregas` nem nas telas de acesso (ver "Rodapé fora da loja e de /entregas" e "Rodapé fora das telas de acesso"): os avisos (texto em "Textos", linha "Rodapé, avisos", fonte única também para o checkout), e os links para as três páginas. A linha da empresa (razão social, CNPJ e cidade) sai do rodapé (decisão do Diego, 2026-10-31).
  - **Rodapé discreto:** pequeno, praticamente um detalhe (decisão do Diego, 2026-10-31). Por isso os links do rodapé têm área de toque de 24 px (WCAG 2.5.8, nível AA), e não os 44 px dos botões. É deliberado: não aumentar para 44 px.
- **Sem pergunta de maioridade** em `/termos` e `/privacidade`, para quem quer ler antes de entrar ([[maioridade-entrada]]). `/entregas` segue a regra normal.
- **Sem avisos nas telas de maioridade:** nem a pergunta de maioridade nem "Acesso não permitido" ([[maioridade-entrada]]) mostram os avisos do rodapé (decisões do Diego, 2026-11-02: "Acesso não permitido" na 1ª rodada, a pergunta na 2ª). Os avisos ficam só em `/conta`, `/termos`, `/privacidade` e no resumo do checkout. Os Termos e a Privacidade, aprovados sem mudança na inspeção, não mudam.
- **Rodapé fora das telas de acesso:** o Diego pediu "retire o footer de todas as páginas" (2026-11-03) e, avisado de que o rodapé tem os avisos legais e os links de Termos, Privacidade e Entregas, escolheu a opção A ("1- A"): retirar só das telas de acesso (`/entrar`, `/criar-conta`, `/recuperar-senha`, `/nova-senha` e `/auth/confirmar`). Continuava na loja, em `/conta` e nas páginas legais (a loja e `/entregas` saíram em 2026-11-08). Maioridade, acesso negado e boas-vindas já não tinham rodapé. Isso substitui a regra "Rodapé e rolagem" de 2026-11-02 (conteúdo mais rodapé em 100dvh). Os links dos Termos e da Privacidade continuam no aceite de `/criar-conta` ([[cadastro-login]]).
- **Rodapé fora da loja e de /entregas:** o Diego aprovou na inspeção "Home, catálogo, entregas: ok (retire o footer)" (2026-11-08), já avisado em 2026-11-03 de que o rodapé tem os avisos legais e os links. Sem rodapé em `/`, `/catalogo`, demais páginas de compra e `/entregas`; continua em `/termos`, `/privacidade` e `/conta`. Os avisos ("Aprecie com moderação." e "Venda proibida para menores de 18 anos.") e os links legais continuam em `/conta` e no resumo do checkout (abaixo). Na loja, a barra inferior fixa fica sem rodapé acima dela. Substitui, para a loja e `/entregas`, a regra de 2026-11-03 que mantinha o rodapé ali.
- **Boas-vindas sem rodapé:** além da pergunta de maioridade, a [[boas-vindas]] também fica sem o rodapé, porque não tem rolagem (decisão do Diego, 2026-10-30). Os links legais continuam nas páginas que têm rodapé e no aceite do cadastro. Consequência da decisão de 2026-11-08 (o Diego aceitou ao tirar o rodapé da loja): o convidado só vê os avisos em `/termos`, `/privacidade` e no checkout, porque `/conta` exige login.
- **Links do cadastro** abrem em nova aba.
- **Checkout:** o resumo do pedido mostra o primeiro aviso do rodapé e o link dos Termos de Uso. Vale quando o checkout existir; o teste entra com o LB-55 (#31, [[checkout]]).
- **Revisão jurídica:** fora do escopo, como no card. Os textos são de um projeto de portfólio.

## Textos

Escritos pelo Spec com a autorização do Diego de 2026-10-29 (pergunta 4: "adicione/crie o que for necessário").

### Rodapé

| Lugar | Texto |
| --- | --- |
| Rodapé, avisos | "Aprecie com moderação." e "Venda proibida para menores de 18 anos." |

### Termos de Uso (`/termos`)

1. **Sobre este site.** A cervejaria, os produtos, os preços e os dados da empresa são fictícios. Nenhum pedido é entregue e nenhum valor é cobrado: os pagamentos usam o ambiente de teste do provedor.
2. **Maioridade.** O site é destinado a maiores de 18 anos. Ao confirmar a maioridade na entrada, você declara ter 18 anos ou mais.
3. **Conta.** Para simular uma compra é preciso criar uma conta com nome, e-mail, telefone e senha. Você é responsável pelos dados que informa e pela guarda da sua senha. Não use dados de cartão reais.
4. **Uso permitido.** É proibido usar o site para fins ilegais, tentar acessar contas de outras pessoas ou atrapalhar o funcionamento do serviço.
5. **Disponibilidade.** O site roda em planos gratuitos e pode ficar fora do ar, ser alterado ou ser desligado a qualquer momento, sem aviso.
6. **Mudanças nestes termos.** Estes termos podem mudar; a data da última atualização fica no topo da página.

### Política de Privacidade (`/privacidade`)

1. **Quais dados coletamos.** Os que você informa ao criar a conta (nome, e-mail, telefone e senha), a data de nascimento, se você a informar em "Dados pessoais", e os endereços de entrega que você salvar, com a localização (latitude e longitude) e a distância até a cervejaria calculadas a partir deles. A senha é guardada pelo serviço de autenticação apenas como hash; ninguém do projeto tem acesso a ela. Também guardamos as cervejas e as quantidades que você coloca na Geladeira: com a conta, elas ficam salvas na conta, para a Geladeira valer em outros aparelhos, e o navegador guarda uma cópia que é apagada quando você sai da conta; sem conta, ficam só no armazenamento do navegador deste aparelho.
2. **Para que usamos.** Só para o funcionamento do site: entrar na conta, simular pedidos, conferir a maioridade na compra, calcular o frete e enviar e-mails da conta (confirmação de cadastro e recuperação de senha).
3. **Com quem compartilhamos.** Com os serviços que hospedam o site, o banco de dados, a autenticação e o envio de e-mails, e com os serviços de CEP e de mapas, que recebem o CEP e o endereço para preencher o endereço e calcular a distância, só na medida necessária para o site funcionar. Não vendemos nem cedemos dados a terceiros.
4. **Cookies.** Usamos cookies necessários: a confirmação de maioridade (30 dias) e a sessão da conta.
5. **Seus direitos.** Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir acesso, correção ou exclusão dos seus dados pelo contato do responsável, abaixo.
6. **Responsável e contato.** O responsável pelos dados (controlador) é Diego Lins Cirqueira, autor do projeto. Pedidos sobre os seus dados vão para diegopantanalstudio@gmail.com.
7. **Mudanças nesta política.** A data da última atualização fica no topo da página.

### Entregas (`/entregas`)

1. **Como funciona.** Os pedidos feitos neste site não são entregues; esta página descreve como a entrega funcionaria.
2. **Área de entrega.** Só Maceió e região.
3. **Frete.** Calculado pela distância até a cervejaria, com frete grátis para pedidos a partir de R$ 150.
4. **Retirada.** Não há retirada no local.

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada do plano de testes do card.

- **Rodapé:** teste de componente com os textos e os links.
- **Liberação das páginas legais na pergunta de maioridade:** caso a mais na função pura de decisão de acesso de [[maioridade-entrada]] (teste unitário).
- **Cenários desta spec:** E2E com viewport de celular.

## Fora de escopo

- Revisão jurídica.
- Banner de consentimento de cookies (LB-21, MVP+): só há cookies necessários.
- Exportar e excluir os dados da conta pelo próprio site (LB-23, MVP+); por ora, o pedido vai pelo contato do responsável.

## Decisões relacionadas

- [[cadastro-login]], [[maioridade-entrada]], [[checkout]], [[visao]], [[roteiro-mvp]]

### Decisões do Diego (2026-10-29)

- **Pergunta 5:** o LB-22 entra no MVP, na fase 1 do acesso, antes do LB-25.
- **Pergunta 4:** o Spec escreve os textos necessários.
- **LGPD:** Diego Lins Cirqueira é o responsável pelos dados (controlador), com o contato diegopantanalstudio@gmail.com na Política de Privacidade.
- **Pergunta 8:** razão social "Leguelé Beer Cervejaria Artesanal Ltda. (empresa fictícia)" e CNPJ 00.000.000/0001-00 (fictício), sempre marcados como fictícios.

### Decisões do Diego (2026-10-30)

- **Sem aviso de portfólio:** "quero que retire o 'Projeto de portfóio pagamentos em modo de teste', isso não deve aparecer em lugar algum já que é desnecessário". Saem a faixa do topo, a nota do rodapé e o item "Projeto de portfólio." de Entregas. O rodapé e as páginas legais continuam, e a empresa segue marcada como fictícia.

### Decisões do Diego (2026-11-12)

- **Dados pessoais e endereços na Política (opção A, LGPD, sem novo aceite):** "Quais dados coletamos" passa a citar a data de nascimento e os endereços com localização e distância; "Para que usamos", a maioridade e o frete; "Com quem compartilhamos", os serviços de CEP e de mapas. Quem já tem conta não aceita de novo; muda só a data de "última atualização" de `/privacidade`, para o dia em que o texto entrar no site. O Front acerta o texto espelhado e a data junto com a primeira tela que coletar esses dados ([[dados-pessoais]] ou [[enderecos-entrega]]), e o Back atualiza a versão da Política no `LEGAL_VERSIONS` no mesmo dia. CPF não entra (fica para o spike do pagamento). Origem: perguntas 2 e 3 de 12/11.

### Decisões do Diego (2026-11-11)

- **Geladeira na Política de Privacidade (opção A, LGPD):** "Quais dados coletamos" passa a citar as cervejas e as quantidades da Geladeira: salvas na conta do cliente logado, para valer em outros aparelhos, com cópia no navegador apagada ao sair; do convidado, só no armazenamento do navegador. Origem: pendência 1 de [[geladeira]]. O texto espelhado no site e a data de "última atualização" de `/privacidade` são acertados pelo Front no código.
- **Data da Política sem novo aceite (opção A, LGPD):** a mudança da Geladeira só muda a data de "última atualização" de `/privacidade`; quem já tem conta não precisa aceitar de novo. Cada página legal passa a ter a própria data: Privacidade 2026-11-11; Termos e Entregas continuam em 2026-10-31.

### Decisões do Diego (2026-11-08)

- **Sem rodapé na loja nem em /entregas:** "Home, catálogo, entregas: ok (retire o footer)". Rodapé só em `/conta`, `/termos` e `/privacidade`. O cenário "Rodapé com avisos e links" passou a abrir `/conta` e confere a ausência em `/`, `/catalogo`, `/entregas`, `/entrar` e `/criar-conta`.

### Decisões do Diego (2026-11-03)

- **Rodapé só fora das telas de acesso ("1- A"):** "retire o footer de todas as páginas". Retirado de `/entrar`, `/criar-conta`, `/recuperar-senha`, `/nova-senha` e `/auth/confirmar`; mantido na loja, em `/conta` e nas páginas legais. Sem cenário novo: o cenário "Rodapé com avisos e links" passou a abrir `/catalogo` e confere a ausência em `/entrar` e `/criar-conta`.

### Decisões do Diego (2026-10-31)

- **Rodapé enxuto:** 'o footer está com muita informação, retire o "Leguelé Beer Cervejaria Artesanal Ltda. (empresa fictícia) · CNPJ 00.000.000/0001-00 (fictício) · Maceió, AL" e ajuste o tamanho'. O rodapé fica só com o aviso de consumo e os links, sem a linha da empresa.
- **Empresa fora do site ("1- A"):** a razão social e o CNPJ fictícios não aparecem em nenhuma página do site. Os Termos já dizem que a empresa é fictícia, e a Política de Privacidade nomeia o responsável pelos dados e o contato. Substitui a parte "sempre marcados como fictícios" da pergunta 8 (2026-10-29), que só valia enquanto os dados apareciam no rodapé.
- **Rodapé discreto:** "o footer está MUITO grande, deve ser pequeno, praticamente um detalhe". Links do rodapé com área de toque de 24 px, de propósito.

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, pela política de autonomia. Qualquer uma pode ser vetada.

- **Páginas legais sem a pergunta de maioridade.**
- **Links do cadastro em nova aba,** para não perder o formulário.
- **Termos e Entregas sem citar o portfólio (2026-10-30):** o item 1 dos Termos perde só a frase do portfólio e continua dizendo que a empresa e os produtos são fictícios, que nada é entregue e que os pagamentos são de teste, para o texto seguir verdadeiro. Em Entregas, o item 1 vira "Como funciona.", com o mesmo aviso de que os pedidos não são entregues.

## Tickets propostos

| Issue | Ajuste proposto | Motivo |
| --- | --- | --- |
| #100 LB-22 | Milestone movido para MVP em 2026-10-29 (decisão do Diego). Depois do merge desta spec: título "[LB-22] Publicar termos, privacidade e entregas", link para ela e critérios com os 4 cenários, sem aviso de portfólio | O Diego puxou o card para a fase 1 do acesso e depois retirou o aviso de portfólio (2026-10-30) |
