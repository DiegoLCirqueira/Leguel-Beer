---
status: pronto
modulo: conta
card-notion: https://app.notion.com/p/3fd490a7ac7d8162ad6cf31191864c1a
prioridade: P0
criado: 2026-11-12
issues:
  - "#44 LB-29"
  - "#98 LB-20"
  - "#46 LB-31"
tags:
  - feature
---

# Dados pessoais

> [!info] Origem
> Item 4 da [[sequencia-telas]] (grupo E, parte da conta). Derivada dos cards do Notion **LB-29** (#44, editar o perfil), **LB-20** (#98, bloquear a compra para menores, no escopo reduzido do [[mvp-corte]]) e **LB-31** (#46, exigir login ao finalizar a compra), e da tela 19 (Dados pessoais). Endereços, área de entrega e frete ficam em [[enderecos-entrega]]. As perguntas de produto e LGPD foram ao Diego em 12/11 pelo Orchestrator; as respostas estão em "Decisões do Diego". Os termos seguem o [[GLOSSARY]].

## História de usuário

- **Como** cliente
- **Quero** revisar e corrigir meus dados pessoais e informar minha data de nascimento
- **Para** que a loja fale comigo pelo telefone certo na entrega e só me venda cerveja se eu for maior de idade

## Cenários

```gherkin
# language: pt
Funcionalidade: Dados pessoais

  Cenário: Salvar os dados pessoais
    Dado que entrei na conta e abri "Dados pessoais"
    Quando altero o telefone para "(82) 99876-5432", informo a data de nascimento "15/03/1992" e toco em "Salvar alterações"
    Então vejo "Perfil atualizado"
    E, ao recarregar a página, vejo o telefone "(82) 99876-5432" e a data "15/03/1992"
    E vejo meu e-mail, sem poder editá-lo

  Esquema do Cenário: Dados inválidos não são salvos
    Dado que estou em "Dados pessoais"
    Quando <acao> e toco em "Salvar alterações"
    Então vejo "<mensagem>" junto ao campo <campo>
    E nada é salvo

    Exemplos:
      | acao                                         | campo              | mensagem                              |
      | deixo o nome completo vazio                  | Nome completo      | Informe seu nome completo.            |
      | escrevo o telefone "(82) 1234"               | Telefone           | Informe um telefone com DDD.          |
      | escrevo a data de nascimento "31/02/1990"    | Data de nascimento | Informe uma data válida.              |
      | escrevo a data de nascimento de amanhã       | Data de nascimento | Informe uma data válida.              |

  Esquema do Cenário: Maioridade conferida ao criar o pedido
    Dado que hoje é 12/11/2026 no horário de Maceió
    E que meu perfil tem a data de nascimento <nascimento>
    Quando tento criar um pedido
    Então <resultado>

    Exemplos:
      | nascimento   | resultado                                                                                     |
      | 13/11/2008   | vejo "Venda proibida para menores de 18 anos." e nenhum pedido é criado                       |
      | 12/11/2008   | o pedido é aceito                                                                             |
      | não informada | sou levado a "Dados pessoais" com "Informe sua data de nascimento para finalizar a compra." e nenhum pedido é criado |

  Cenário: Só o próprio perfil
    Dado que sou o cliente A e existe o cliente B
    Quando peço à API para alterar o perfil, mandando no corpo o e-mail ou o id do cliente B
    Então só o perfil do cliente A, dono da sessão, muda
    E o e-mail e o id continuam vindo da sessão, nunca do corpo

  Cenário: Dados pessoais exigem conta
    Dado que sou convidado
    Quando abro /conta/dados-pessoais
    Então sou levado a "Entrar"
    E, depois de entrar, volto a "Dados pessoais"

  Cenário: Convidado entra para finalizar a compra
    Dado que sou convidado com 2 Maré Alta na Geladeira
    Quando toco em "Finalizar compra"
    Então sou levado a "Entrar", com o link "Criar conta"
    E, depois de entrar numa conta com a Geladeira vazia, chego ao checkout com as 2 Maré Alta
```

## Regras de negócio

### Dados pessoais (LB-29)

- **Tela** `/conta/dados-pessoais`, aberta por "Dados pessoais" em `/conta`. Exige conta (sem sessão, vai a `/entrar` e volta depois, como em [[cadastro-login]]).
- **Campos:**
  - **Nome completo**, obrigatório, até 120 caracteres (mesma regra do cadastro).
  - **E-mail**, só leitura: mostra o e-mail da conta; trocar o e-mail fica fora (card LB-29).
  - **Telefone**, obrigatório, brasileiro, com DDD, 10 ou 11 dígitos, máscara "(00) 00000-0000" (mesma regra do cadastro). Ajuda: "Informe um número com DDD." (tela 19).
  - **Data de nascimento**, no formato DD/MM/AAAA, com máscara. Opcional para salvar o perfil, obrigatória para criar pedido. Precisa ser uma data real, não futura e a partir de 01/01/1900. Ajuda: "Você precisa ter 18 anos ou mais para comprar." Uma data que dá menos de 18 anos é aceita no perfil: o bloqueio é no pedido.
- **CPF:** não entra no perfil neste item. Ver "Decisões do Diego", pergunta 2.
- **Salvar:** "Salvar alterações" grava e mostra "Perfil atualizado" (toast). "Cancelar" volta a `/conta` sem salvar. Enquanto salva, o botão fica desabilitado e com indicador de carregamento.
- **Mesmas regras no site e na API:** os campos são validados pelo mesmo schema compartilhado ([[contratos-compartilhados]], [[ADR-010-validacao-com-zod]]); a API responde 400 `VALIDATION_ERROR` com dado inválido. O perfil alterado é sempre o da sessão; o e-mail, o id, o papel e o aceite dos termos não mudam por esta tela.
- **Perfil incompleto antes do checkout:** sem data de nascimento, o checkout (item 5) leva a "Dados pessoais" com a mensagem do cenário, e depois de salvar volta ao checkout.

### Maioridade no pedido (LB-20)

- Regra única "tem 18 anos ou mais na data de hoje", com hoje no fuso de Maceió (`America/Maceio`): quem faz 18 anos hoje pode comprar.
- A API confere ao criar o pedido (item 5, LB-55) e recusa com 422 `UNDERAGE` e a mensagem "Venda proibida para menores de 18 anos."; sem data de nascimento, recusa com 422 `BIRTH_DATE_REQUIRED`. O site também mostra o aviso antes, mas quem decide é a API.
- É uma declaração do cliente, sem validação de documento ([[mvp-corte]]). Complementa a [[maioridade-entrada]], que é só uma confirmação na entrada do site.
- A regra e os testes entram neste item; a chamada na criação do pedido entra com o pedido (item 5). A assinatura do Clube (citada no card) é Pós-MVP.

### Login ao finalizar (LB-31)

- "Finalizar compra" na Geladeira ([[geladeira]], resumo) leva o convidado a `/entrar`, com volta automática ao checkout depois de entrar ou de criar a conta e confirmar o e-mail. Sem bottom sheet.
- A Geladeira do convidado segue a regra "Ao entrar na conta" da [[geladeira]]: passa para a conta se a da conta estiver vazia; senão, vale a da conta.
- Ativa quando o checkout existir (item 5): até lá, "Finalizar compra" continua desabilitado ([[geladeira]]).

### LGPD

- A data de nascimento é dado pessoal novo: a Política de Privacidade passa a citá-la. Ver "Decisões do Diego", pergunta 3, e [[termos-privacidade]].
- A data de nascimento não aparece em listas do admin.

### Fora de escopo

- Foto de perfil e gênero (aparecem na tela 19, fora do card).
- Trocar o e-mail ou a senha por esta tela (a senha tem [[recuperacao-senha]]).
- CPF (pergunta 2) e validação de documento.
- Excluir ou exportar os dados da conta (LB-23, MVP+).
- Favoritos do convidado (cenário 2 do LB-31; favoritos são Pós-MVP).
- Tela de perfil completa (tela 12, "Minha conta"): este item só acrescenta em `/conta` o link "Dados pessoais" e o link "Meus endereços" ([[enderecos-entrega]]).

## Referência visual

Tela 19 (Dados pessoais), normalizada ao padrão aprovado (regra da revisão em [[sequencia-telas]]): título "Dados pessoais" com ícone, texto "Revise e edite suas informações pessoais.", campos com ícone no `Campo`, botão primário "Salvar alterações" e link "Cancelar". Sem barra de status, foto de perfil, gênero nem o selo "Mantenha seu perfil sempre atualizado!".

## Seams de teste

> [!info] Proposta do Spec, aplicada como recomendação (12/11), vetável pelo Diego

- **Schema do perfil** (shared, unitário): nome, telefone e data de nascimento, incluindo 29/02 em ano bissexto e não bissexto, data futura e antes de 1900.
- **Maioridade** (shared, unitário): tabela com véspera, dia e dia seguinte dos 18 anos, 29/02, e a virada do dia em UTC contra o horário de Maceió (ex.: 23h30 de Maceió já é o dia seguinte em UTC).
- **Editar perfil** (API): caso de uso com repositório em memória; rota com Supertest e banco real: sem token 401, dado inválido 400, corpo com e-mail ou id de outro cliente não muda nada além do perfil da sessão.
- **Tela** (componente): máscaras, mensagens por campo, toast, botão desabilitado ao salvar e e-mail só leitura.
- **E2E** (celular, 360 × 640): salvar e recarregar; convidado em `/conta/dados-pessoais`. O fluxo convidado → entrar → checkout entra no E2E do item 5.

## Fatias, com dono e ordem

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | Contrato (LB-29 e LB-20) | Back | PR só em `@leguele/shared`: schema de edição do perfil e a regra de maioridade, com testes |
| 2 | LB-29 (#44), API | Back | Campo de nascimento no perfil (migration), leitura e edição do perfil da sessão, Política com a data nova no `LEGAL_VERSIONS` se o texto mudar |
| 3 | LB-29 (#44), site | Front | `/conta/dados-pessoais`, links em `/conta` e o texto novo de `/privacidade` |
| 4 | LB-20 (#98) e LB-31 (#46) | Back e Front | Chamada da regra na criação do pedido e o desvio do convidado; entram com o item 5 ([[checkout]]) |

Candidatos a ADR: nenhum.

## Decisões relacionadas

- [[cadastro-login]]: nome e telefone do cadastro, perfil e retorno depois de entrar.
- [[enderecos-entrega]], [[geladeira]], [[checkout]], [[termos-privacidade]], [[maioridade-entrada]]
- [[mvp-corte]], [[sequencia-telas]], [[ADR-010-validacao-com-zod]], [[ADR-012-sessao-em-cookies-httponly]]

## Decisões do Diego

Perguntas de 12/11, levadas pelo Orchestrator. Resposta do Diego: "todas as recomendadas".

1. **Maioridade no checkout (LB-20): A.** Data de nascimento no perfil e a API recusa o pedido de menor; é declaração, sem validação de documento, dentro do escopo reduzido do [[mvp-corte]].
2. **CPF (LB-29, LGPD): B.** O CPF não entra no perfil neste item. O spike do Mercado Pago (LB-54) decide se o pagamento exige CPF; se exigir, ele é pedido só na etapa de pagamento ([[checkout]]).
3. **Política de Privacidade: A.** Texto e data de `/privacidade` atualizados, sem novo aceite de quem já tem conta. Ver "Texto novo de /privacidade" abaixo.
4. **Campos da tela 19: A.** Sem foto de perfil e sem gênero; e-mail só leitura; ajuda do nascimento "Você precisa ter 18 anos ou mais para comprar." (sem "no app"); sem a ajuda do CPF.
10. **Convidado em "Finalizar compra" (LB-31): A.** Vai a `/entrar` (com "Criar conta"), volta ao checkout e mantém a Geladeira; sem bottom sheet; favoritos fora.

As perguntas 5 a 9 e 11 estão em [[enderecos-entrega]].

### Texto novo de /privacidade (pergunta 3)

Fonte única em [[termos-privacidade]] ("Decisões do Diego (2026-11-12)"). Nesta spec, a parte da data de nascimento:

- "Quais dados coletamos" ganha: "a data de nascimento, se você a informar em "Dados pessoais"".
- "Para que usamos" ganha: "conferir a maioridade na compra".
- Sem novo aceite: muda só a data de "última atualização" de `/privacidade` e a versão da Política no `LEGAL_VERSIONS` da API, no dia em que o texto entrar no site, junto com a primeira tela que coleta dado novo (esta ou [[enderecos-entrega]]).

## Decisões tomadas sem consulta

Recomendações aplicadas pelo Spec em 12/11; qualquer uma pode ser vetada.

- **Duas specs para o item 4**, pelo limite de 6 cenários: esta e [[enderecos-entrega]].
- **Data de nascimento opcional no perfil e obrigatória no pedido:** o cliente pode salvar o resto sem ela; o pedido não sai sem ela.
- **Data a partir de 01/01/1900** e não futura.
- **Menor de idade pode salvar a data:** o bloqueio é no pedido, com a mensagem do card.
- **Textos novos:** "Informe uma data válida.", "Informe sua data de nascimento para finalizar a compra." e "Perfil atualizado" (este do card).

## Tickets propostos

Reconciliação das issues #44, #98 e #46, a pedir ao Orchestrator depois do merge desta spec (aprovação permanente para reconciliar issue com spec mergeada): link para esta spec, os cenários e as regras de cada card, CPF fora do #44, a chamada da regra no pedido e o desvio do convidado (#98 e #46) dependentes do item 5. Nenhuma issue nova.
