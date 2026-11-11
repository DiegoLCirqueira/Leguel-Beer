---
status: pronto
modulo: catalogo
card-notion: https://app.notion.com/p/3fd490a7ac7d818f8902cacfd96e2c0b
prioridade: P0
criado: 2026-10-28
atualizado: 2026-11-10
issues:
  - "#24 LB-35"
tags:
  - feature
---

# Adicionar direto do card

> [!info] Origem
> Derivada do card do Notion **LB-35** (#24), parte do épico E3 junto com [[catalogo]] e [[destaques-home]]. O Diego pôs o LB-35 no escopo (pergunta 2 da entrevista do [[catalogo]]); a separação em spec própria, pelo limite de 6 cenários por spec, foi proposta do Spec adotada pelo Orchestrator. Fechada para implementação em 10/11 (item 3 da [[sequencia-telas]]), junto com a [[geladeira]], de onde vêm o estado, a persistência e o limite. Os termos seguem o [[GLOSSARY]].

## História de usuário

- **Como** cliente ou convidado no celular
- **Quero** colocar uma cerveja na Geladeira direto do card, sem abrir a página do produto
- **Para** montar a compra rápido enquanto exploro o catálogo

## Cenários

```gherkin
# language: pt
Funcionalidade: Adicionar cerveja à Geladeira direto do card

  Cenário: Adicionar uma unidade
    Dado que a Geladeira tem 2 itens
    Quando toco em "Adicionar" no card da Ponta Verde Pilsen
    Então vejo o toast "Ponta Verde Pilsen foi para a geladeira" com a ação "Desfazer"
    E o contador da Geladeira no header mostra 3

  Cenário: Limite da quantidade disponível
    Dado que a Ponta Verde Pilsen tem quantidade disponível 2 e já tenho 2 na Geladeira
    Quando toco em "Adicionar" no card da Ponta Verde Pilsen
    Então vejo "Só temos 2 unidades"
    E a quantidade na Geladeira continua 2

  Cenário: Desfazer
    Dado que acabei de adicionar uma cerveja pelo card
    Quando toco em "Desfazer" no toast
    Então a Geladeira volta ao estado anterior
    E o contador do header volta ao número de antes

  Cenário: Convidado adiciona sem entrar na conta
    Dado que sou convidado
    Quando toco em "Adicionar" no card de uma cerveja com quantidade disponível
    Então a cerveja vai para a Geladeira sem pedir login
    E continua lá depois de eu recarregar o site

  Cenário: Cerveja esgotada não pode ser adicionada
    Dado uma cerveja esgotada
    Quando vejo o card dela
    Então o botão "Adicionar" está desabilitado
```

## Regras de negócio

- "Adicionar" coloca 1 unidade na Geladeira; a escolha de quantidade fica na página do produto ([[produto]], LB-42).
- A cerveja nova entra no fim da ordem de entrada (é o que define a posição na prateleira, ver [[geladeira]]); se já estiver na Geladeira, só a quantidade aumenta e a posição não muda.
- O total na Geladeira de uma cerveja não passa da quantidade disponível do card (estoque menos reservas de pedidos pendentes). Ao tentar passar, mostra "Só temos N unidades" (singular: "Só temos 1 unidade") no toast, sem "Desfazer", e nada muda. O servidor confere de novo ao abrir a Geladeira ([[geladeira]], LB-52).
- Ao adicionar, mostra o toast "<nome da cerveja> foi para a geladeira" com "Desfazer" e atualiza o contador do header (soma das unidades).
- "Desfazer" devolve a Geladeira ao estado de antes daquele toque, enquanto o toast estiver visível (5 segundos). Um toque novo substitui o toast anterior, e só ele pode ser desfeito.
- O convidado pode adicionar à Geladeira; só precisa entrar na conta para finalizar a compra (decisão do Diego, 2026-10-28; ver [[visao]]). A persistência (navegador para o convidado, conta para o cliente) é a da [[geladeira]].
- Cerveja esgotada tem o botão "Adicionar" desabilitado (ver [[catalogo]]).
- Vale em todos os cards de cerveja: catálogo e [[destaques-home]].
- O toast fica acima da barra inferior da loja e é anunciado ao leitor de tela (`role="status"`).

## Contrato e componentes

Sem contrato novo: o card já recebe `CervejaCard` (com `quantidadeDisponivel` e `esgotada`) e o `CardCerveja` já tem `aoAdicionar` (hoje sem uso, por isso desabilitado). A ação de adicionar é a operação "adicionar com limite" do estado da Geladeira (fatia 4 da [[geladeira]]), que recebe o `CervejaCard` e a quantidade (1 no card; a escolhida na página de produto). Usa o `Toast` que já existe. Nenhum componente novo.

## Seams de teste

> [!info] Proposta do Spec, aplicada como recomendação (10/11), vetável pelo Diego

- **Regras da Geladeira:** adicionar (cerveja nova e já presente), limite pela quantidade disponível e desfazer (unitário, no estado da Geladeira da fatia 4 da [[geladeira]]).
- **Card:** `aoAdicionar` ligado, esgotada desabilitada e toast (componente).
- **Botão no card:** E2E dos cenários desta spec no catálogo e na home, com convidado e com cliente logado.

## Fatias, com dono e ordem

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | LB-35 (#24) | Front | Liga o "Adicionar" do card (catálogo e destaques) à operação de adicionar da Geladeira, com o toast, o limite e o contador; depende da fatia 4 da [[geladeira]] |

Pode sair no mesmo PR que a fatia 4 de [[produto]] (seletor e botão fixo, LB-42), que usa a mesma operação com a quantidade escolhida.

Candidatos a ADR: nenhum.

## Fora de escopo

- Escolher a quantidade (página do produto, LB-42).
- Somar a Geladeira do convidado com a da conta ao entrar (LB-48, #55, MVP+); a regra do MVP está na [[geladeira]].
- Exigir login ao finalizar a compra (LB-31, #46).
- Preço riscado ou desconto no card.

## Decisões relacionadas

- [[geladeira]]
- [[catalogo]]
- [[destaques-home]]
- [[produto]]
- [[mvp-corte]]

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, tomadas pela política de autonomia do Diego. Qualquer uma pode ser vetada.

- **História de usuário:** escrita a partir do card, incluindo o convidado conforme a pergunta 8 da entrevista do [[catalogo]], decidida pelo Diego.
- **Duração do toast:** 5 segundos; "Desfazer" só vale enquanto o toast estiver visível. O card não definia a duração.
- **Singular da mensagem de limite:** "Só temos 1 unidade", seguindo o padrão de "1 cerveja" aprovado pelo Diego.
- **Limite com reservas:** o limite usa a quantidade disponível (com reservas), e não o estoque bruto, para bater com a regra de esgotada do [[catalogo]].
- **Exemplo dos cenários** (10/11): "Munich Lager" virou Ponta Verde Pilsen, que está no catálogo de 16 cervejas da marca.
- **Mensagem de limite no toast**, sem "Desfazer" (10/11).
- **Só o toque mais recente pode ser desfeito** (10/11).
- **Cerveja já presente não muda de posição** ao receber mais uma unidade (10/11).

## Tickets propostos

Coberto pela issue #24 (ver a reconciliação em [[catalogo]]). Depois do merge, reconciliar a #24 com o novo exemplo (Ponta Verde Pilsen) e a dependência da fatia 4 da [[geladeira]] (#54). Nenhuma issue nova.
