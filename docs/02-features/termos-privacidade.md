---
status: rascunho
modulo: acesso
card-notion: https://app.notion.com/p/3fd490a7ac7d815c9785f1be8cd09271
prioridade: P1
criado: 2026-10-29
atualizado: 2026-10-31
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
    Dado que confirmei a maioridade
    Quando abro /criar-conta e rolo até o fim
    Então vejo "Aprecie com moderação" e "Venda proibida para menores de 18 anos"
    E vejo os links "Termos de Uso", "Política de Privacidade" e "Entregas"
    E não vejo a razão social nem o CNPJ da empresa

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
- **Rodapé:** em todas as páginas, menos na pergunta de maioridade: os avisos (texto em "Textos", linha "Rodapé, avisos", fonte única também para a pergunta de maioridade e o checkout), e os links para as três páginas. A linha da empresa (razão social, CNPJ e cidade) sai do rodapé (decisão do Diego, 2026-10-31).
  - **Rodapé discreto:** pequeno, praticamente um detalhe (decisão do Diego, 2026-10-31). Por isso os links do rodapé têm área de toque de 24 px (WCAG 2.5.8, nível AA), e não os 44 px dos botões. É deliberado: não aumentar para 44 px.
- **Sem pergunta de maioridade** em `/termos` e `/privacidade`, para quem quer ler antes de entrar ([[maioridade-entrada]]). `/entregas` segue a regra normal.
- **Boas-vindas sem rodapé:** além da pergunta de maioridade, a [[boas-vindas]] também fica sem o rodapé, porque não tem rolagem (decisão do Diego, 2026-10-30). Os links legais continuam nas outras páginas e no cadastro.
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

1. **Quais dados coletamos.** Os que você informa ao criar a conta (nome, e-mail, telefone e senha) e, quando usar o checkout, endereço de entrega. A senha é guardada pelo serviço de autenticação apenas como hash; ninguém do projeto tem acesso a ela.
2. **Para que usamos.** Só para o funcionamento do site: entrar na conta, simular pedidos e enviar e-mails da conta (confirmação de cadastro e recuperação de senha).
3. **Com quem compartilhamos.** Com os serviços que hospedam o site, o banco de dados, a autenticação e o envio de e-mails, só na medida necessária para o site funcionar. Não vendemos nem cedemos dados a terceiros.
4. **Cookies.** Usamos cookies necessários: a confirmação de maioridade (30 dias) e a sessão da conta.
5. **Seus direitos.** Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir acesso, correção ou exclusão dos seus dados pelo contato do responsável, abaixo.
6. **Responsável e contato.** O responsável pelos dados (controlador) é Diego Lins Cirqueira, autor do projeto. Pedidos sobre os seus dados vão para diegopantanalstudio@gmail.com.
7. **Mudanças nesta política.** A data da última atualização fica no topo da página.

### Entregas (`/entregas`)

1. **Como funciona.** Os pedidos feitos neste site não são entregues; esta página descreve como a entrega funcionaria.
2. **Área de entrega.** Só Maceió e região.
3. **Frete.** Calculado pela distância até a cervejaria, com frete grátis para pedidos acima de R$ 150.
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
