---
status: rascunho
modulo: acesso
card-notion: https://app.notion.com/p/3fd490a7ac7d815c9785f1be8cd09271
prioridade: P1
criado: 2026-10-29
atualizado: 2026-10-29
issues:
  - "#100 LB-22"
tags:
  - feature
---

# Termos, privacidade e aviso de projeto de portfólio

> [!info] Origem
> Derivada do card do Notion **LB-22** (#100), que o Diego puxou do MVP+ para o MVP em 2026-10-29, na fase 1 do acesso, antes do cadastro ([[roteiro-mvp]]): os links "Termos de Uso" e "Política de Privacidade" de "Criar sua conta" ([[cadastro-login]]) precisam de destino. A página do projeto no Notion registra que os dados da empresa (CNPJ, endereço) são fictícios e que os pagamentos rodam em modo de teste ([[visao]]).

## História de usuário

- **Como** pessoa que visita a Leguelé Beer (cliente, convidado ou recrutador)
- **Quero** ver que o site é um projeto de portfólio e ler os termos e a política de privacidade
- **Para** saber que nada é vendido de verdade e o que acontece com os dados que eu informo

## Cenários

```gherkin
# language: pt
Funcionalidade: Termos, privacidade e aviso de portfólio

  Esquema do Cenário: Aviso de portfólio em todas as páginas
    Dado que abro <página> num celular de 360 px
    Quando a página carrega
    Então vejo a faixa "Projeto de portfólio · pagamentos em modo de teste" no topo

    Exemplos:
      | página                      |
      | a pergunta de maioridade    |
      | /boas-vindas                |
      | /criar-conta                |
      | /termos                     |

  Cenário: Rodapé com avisos e links
    Dado que confirmei a maioridade
    Quando abro /boas-vindas e rolo até o fim
    Então vejo "Aprecie com moderação" e "Venda proibida para menores de 18 anos"
    E vejo os links "Termos de Uso", "Política de Privacidade" e "Entregas"
    E vejo os dados da empresa marcados como fictícios

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
- **Faixa de portfólio:** fixa no topo de todas as páginas do site, incluindo a pergunta de maioridade e as páginas legais; não pode ser fechada.
- **Rodapé:** em todas as páginas, menos na pergunta de maioridade: os avisos (texto em "Textos", linha "Rodapé, avisos", fonte única também para a pergunta de maioridade e o checkout), links para as três páginas e os dados fictícios da empresa.
- **Sem pergunta de maioridade** em `/termos` e `/privacidade`, para quem quer ler antes de entrar ([[maioridade-entrada]]). `/entregas` segue a regra normal.
- **Links do cadastro** abrem em nova aba.
- **Checkout:** o resumo do pedido mostra o primeiro aviso do rodapé e o link dos Termos de Uso. Vale quando o checkout existir; o teste entra com o LB-55 (#31, [[checkout]]).
- **Revisão jurídica:** fora do escopo, como no card. Os textos são de um projeto de portfólio.

## Textos

Escritos pelo Spec com a autorização do Diego de 2026-10-29 (pergunta 4: "adicione/crie o que for necessário").

### Faixa e rodapé

| Lugar | Texto |
| --- | --- |
| Faixa | "Projeto de portfólio · pagamentos em modo de teste" |
| Rodapé, avisos | "Aprecie com moderação." e "Venda proibida para menores de 18 anos." |
| Rodapé, empresa | "Leguelé Beer Cervejaria Artesanal Ltda. (empresa fictícia) · CNPJ 00.000.000/0001-00 (fictício) · Maceió, AL" |
| Rodapé, nota | "Leguelé Beer é um projeto de portfólio. Nenhuma venda é real e nenhum valor é cobrado." |

### Termos de Uso (`/termos`)

1. **Sobre este site.** A Leguelé Beer é um projeto de portfólio de desenvolvimento de software. A cervejaria, os produtos, os preços e os dados da empresa são fictícios. Nenhum pedido é entregue e nenhum valor é cobrado: os pagamentos usam o ambiente de teste do provedor.
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

1. **Projeto de portfólio.** Nenhum pedido é entregue de verdade; esta página descreve como a entrega funcionaria.
2. **Área de entrega.** Só Maceió e região.
3. **Frete.** Calculado pela distância até a cervejaria, com frete grátis para pedidos acima de R$ 150.
4. **Retirada.** Não há retirada no local.

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada do plano de testes do card.

- **Faixa e rodapé:** testes de componente com os textos e os links.
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

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, pela política de autonomia. Qualquer uma pode ser vetada.

- **Faixa sem botão de fechar.**
- **Páginas legais sem a pergunta de maioridade.**
- **Links do cadastro em nova aba,** para não perder o formulário.
- **Texto da faixa** com "·" no lugar do travessão do card.

## Tickets propostos

| Issue | Ajuste proposto | Motivo |
| --- | --- | --- |
| #100 LB-22 | Milestone movido para MVP em 2026-10-29 (decisão do Diego). Depois do merge desta spec: link para ela e critérios com os 5 cenários | O Diego puxou o card para a fase 1 do acesso |
