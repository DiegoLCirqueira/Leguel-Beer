---
status: rascunho
modulo: acesso
card-notion: https://app.notion.com/p/3fd490a7ac7d8172b935df8e794f5411
prioridade: P0
criado: 2026-10-29
atualizado: 2026-10-30
issues:
  - "#39 LB-24"
tags:
  - feature
---

# Tela de boas-vindas

> [!info] Origem
> Derivada do card do Notion **LB-24** (#39) e da tela inicial do Figma (primeira das 15 telas de `figma-pagina-completa.png`). Vem depois da [[maioridade-entrada]] e leva a [[cadastro-login]] ou à home como convidado. É a primeira página da entrega de acesso ([[roteiro-mvp]]).

## História de usuário

- **Como** convidado que acabou de confirmar a maioridade
- **Quero** escolher entre entrar, criar conta ou seguir sem conta
- **Para** começar a usar a loja do jeito que eu preferir

## Cenários

```gherkin
# language: pt
Funcionalidade: Tela de boas-vindas

  Cenário: Tela inicial como no Figma
    Dado que confirmei a maioridade e não entrei numa conta
    Quando abro o site num celular de 360 px de largura
    Então vejo o logo e o slogan "Cervejas artesanais"
    E não vejo "e muito mais!"
    E não vejo "Sabor Qualidade e Tradição" nem o texto lateral "Sabor Qualidade Tradição"
    E vejo os botões "Entrar", "Criar conta" e "Continuar como convidado"
    E vejo "Manter-me conectado" marcado
    E a página não tem rolagem horizontal

  Cenário: Continuar como convidado
    Dado que estou na tela de boas-vindas
    Quando toco em "Continuar como convidado"
    Então vou para a home e posso abrir o catálogo
    E ao abrir a home de novo na mesma sessão do navegador a tela de boas-vindas não aparece

  Esquema do Cenário: Entrar levando a escolha de "Manter-me conectado"
    Dado que estou na tela de boas-vindas
    E "Manter-me conectado" está <estado>
    Quando toco em "Entrar"
    Então vou para a tela de entrar
    E lá "Manter-me conectado" aparece <estado>

    Exemplos:
      | estado     |
      | marcado    |
      | desmarcado |

  Cenário: Criar conta
    Dado que estou na tela de boas-vindas
    Quando toco em "Criar conta"
    Então vou para a tela "Criar sua conta"

  Cenário: Cliente com sessão ativa não vê a boas-vindas
    Dado que entrei na minha conta e a sessão está ativa
    Quando abro a home
    Então vejo a home direto, sem a tela de boas-vindas

  Esquema do Cenário: Boas-vindas cabe na tela sem rolagem
    Dado que estou na tela de boas-vindas num celular de <tamanho>
    Quando tento rolar a página na vertical e na horizontal
    Então a página não rola
    E não vejo o rodapé

    Exemplos:
      | tamanho   |
      | 360 × 780 |
      | 390 × 844 |
```

## Regras de negócio

- **Endereço:** `/boas-vindas`.
- **Quem vê:** quem abre a home sem sessão ativa e sem ter escolhido "convidado" nesta sessão do navegador. Links diretos para outras páginas (ex.: um link do catálogo) abrem a página pedida, sem passar pela boas-vindas.
- **Convidado:** a escolha vale até o navegador ser fechado. O convidado navega e monta a Geladeira, mas só finaliza a compra entrando numa conta ([[GLOSSARY]], [[adicionar-do-card]]).
- **"Manter-me conectado":** começa marcado (como no Figma) e é levado para a tela de entrar. O efeito na sessão está em [[cadastro-login]].
- **Textos do Figma** (decisão do Diego já tomada): "Entrar", "Criar conta", "ou", "Continuar como convidado", "Manter-me conectado".
- **Slogan:** "Cervejas artesanais", da arte original do Figma, sem a linha "e muito mais!" (decisão final do Diego, 2026-10-30). Fica na posição e no estilo de pincel da arte original. "Sabor Qualidade e Tradição" não aparece na tela; as tentativas anteriores ficam só como histórico, em "Decisões do Diego".
- **Sem rolagem:** a boas-vindas cabe inteira na tela do celular e não rola (decisão do Diego, 2026-10-30). Por isso não mostra o rodapé de [[termos-privacidade]], como a pergunta de maioridade. Os links legais continuam nas outras páginas e no cadastro ([[cadastro-login]]).
- **Sem o texto lateral "Sabor Qualidade Tradição":** o texto lateral do Figma sai da tela (decisão do Diego, 2026-10-30, #136). Com o slogan final "Cervejas artesanais", essas palavras não aparecem em lugar nenhum da tela.
- **Imagens:** logo, garrafa com copo, barril e folhagem de `Imagens/`, otimizadas para celular. A imagem principal tem texto alternativo.
- **Componentes:** "Entrar" é o botão primário com ícone e seta; "Criar conta", o botão de contorno; "Continuar como convidado", o botão discreto ([[identidade-visual]]).

- **Ícone (i) de "Manter-me conectado":** ao ser tocado, mostra a dica da tabela abaixo.

## Textos

Aprovados pelo Diego em 2026-10-29 (pergunta 4), que autorizou acrescentar os textos necessários; os escritos pelo Spec estão marcados com *.

| Lugar | Texto proposto |
| --- | --- |
| Dica do ícone (i) de "Manter-me conectado" * | "Sua sessão continua ativa neste aparelho por até 30 dias, mesmo depois de fechar o navegador." |
| Texto alternativo da imagem principal * | "Garrafa de IPA Leguelé Beer ao lado de um copo cheio, entre folhas de lúpulo" |

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada do plano de testes do card.

- **Decisão de rota da home:** função pura que recebe "tem sessão" e "escolheu convidado" e devolve home ou boas-vindas (teste unitário).
- **Tela:** teste de componente para os três botões e o estado de "Manter-me conectado".
- **Cenários desta spec:** E2E com viewport de celular, com o Supabase local.

## Fora de escopo

- Formulários de entrar e de criar conta ([[cadastro-login]]).
- Login social com Google e Facebook (LB-26, #41, MVP+): a tela não mostra esses botões no MVP.
- Mesclar a Geladeira do convidado ao entrar (LB-48, MVP+).

## Decisões relacionadas

- [[maioridade-entrada]], [[cadastro-login]], [[identidade-visual]]
- [[GLOSSARY]]: Convidado, Cliente.

### Decisões do Diego (2026-10-30)

- **"Sabor Qualidade Tradição":** o texto lateral foi retirado da tela de boas-vindas, embora apareça no Figma (#136).
- **Slogan (histórico, substituído pela decisão final abaixo):** "mude o "Cervejas artesanais e muito mais" por "Sabor Qualidade e Tradição"". O slogan da tela passa a ser "Sabor Qualidade e Tradição", na posição e no estilo do slogan original da arte. Retoma as palavras do texto lateral retirado, agora como slogan.
- **Estilo do slogan (histórico, substituído pela decisão final abaixo):** "melhorar a fonte que ficou escrito 'Sabor Qualidad e Tradição' (ficou péssimo) pode deixar igual na imagem do figma se ficar mais fácil". Duas possibilidades, com a escolha final depois que o Diego vir o resultado: (1) "Sabor Qualidade e Tradição" recriado no estilo de pincel da arte original; (2) se não ficar fiel, voltar à arte original do Figma, com "Cervejas artesanais e muito mais!".
- **Slogan, decisão final:** 'deixe só "Cervejas artesanais"'. O slogan é "Cervejas artesanais", da arte original do Figma sem a linha "e muito mais!". As duas possibilidades acima ("Sabor Qualidade e Tradição" recriado e a arte original completa) ficam só como histórico.
- **Sem rolagem:** "Retirar rolagem da página principal". A boas-vindas não rola e fica sem o rodapé.

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, pela política de autonomia. Qualquer uma pode ser vetada.

- **Só a home leva à boas-vindas;** links diretos abrem a página pedida.
- **"Convidado" lembrado até fechar o navegador** ("lembrada na sessão", do card).
- **"Manter-me conectado" na boas-vindas é levado à tela de entrar,** que também mostra a opção (quem chega ao entrar por outro caminho também escolhe).

## Tickets propostos

| Issue | Ajuste proposto | Motivo |
| --- | --- | --- |
| #39 LB-24 | Link para esta spec; critérios: os 6 cenários; só a home leva à boas-vindas; "Manter-me conectado" levado à tela de entrar; sem botões de login social no MVP | O card não diz o que fazer com "Manter-me conectado" nem com links diretos |
