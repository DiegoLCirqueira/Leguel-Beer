---
status: rascunho
modulo: acesso
card-notion: https://app.notion.com/p/3fd490a7ac7d81caab51c2698587fd52
prioridade: P0
criado: 2026-10-29
atualizado: 2026-10-30
issues:
  - "#97 LB-19"
tags:
  - feature
---

# Confirmação de maioridade na entrada

> [!info] Origem
> Derivada do card do Notion **LB-19** (#97), no escopo reduzido do [[mvp-corte]]: confirmação de maioridade na entrada do site, sem validação de documento. É a primeira tela do acesso ([[roteiro-mvp]]); depois dela vem a [[boas-vindas]]. A confirmação no checkout (LB-20, #98) é outra spec.

## História de usuário

- **Como** pessoa que abre o site da Leguelé Beer pela primeira vez
- **Quero** confirmar que tenho 18 anos ou mais antes de ver o site
- **Para** que a loja de bebida alcoólica só seja exibida a maiores de idade

## Cenários

```gherkin
# language: pt
Funcionalidade: Confirmação de maioridade na entrada

  Cenário: Maior de idade confirma e a resposta é lembrada
    Dado que abro o site pela primeira vez neste navegador
    E vejo a pergunta "Você tem 18 anos ou mais?"
    Quando confirmo que tenho 18 anos ou mais
    Então vejo a tela de boas-vindas
    E ao voltar ao site 29 dias depois a pergunta não aparece

  Cenário: Menor de idade não acessa o site
    Dado que abro o site pela primeira vez neste navegador
    Quando respondo que não tenho 18 anos
    Então vejo "Acesso não permitido" e o botão "Voltar para a página inicial"
    E ao tocar em "Voltar para a página inicial" vejo a pergunta "Você tem 18 anos ou mais?" de novo
    E ao abrir /catalogo continuo vendo a pergunta de maioridade, sem o catálogo

  Cenário: Link direto volta para a página pedida depois da confirmação
    Dado que não confirmei a maioridade
    Quando abro um link de uma página do site, como /catalogo?categoria=ipa
    Então vejo a pergunta de maioridade
    E ao confirmar sou levado a /catalogo?categoria=ipa

  Cenário: Endereço de retorno externo é ignorado
    Dado que não confirmei a maioridade
    Quando abro a pergunta com um endereço de retorno de outro site
    E confirmo que tenho 18 anos ou mais
    Então continuo no site da Leguelé Beer, na tela de boas-vindas

  Cenário: Confirmação vencida pergunta de novo
    Dado que confirmei a maioridade há 31 dias neste navegador
    Quando abro o site
    Então vejo a pergunta "Você tem 18 anos ou mais?" de novo

  Cenário: Robôs de busca veem o site sem a pergunta
    Dado uma requisição de um robô de busca conhecido, sem confirmação de maioridade
    Quando ele abre /catalogo
    Então recebe a página do catálogo, sem a pergunta de maioridade
```

## Regras de negócio

- **Quando aparece:** em qualquer página do site, para quem ainda não confirmou a maioridade neste navegador. Arquivos estáticos (imagens, fontes, ícones) e a API não passam pela pergunta.
- **Validade:** a confirmação vale 30 dias no navegador. Depois disso, a pergunta volta.
- **Resposta "não":** mostra "Acesso não permitido", com o botão "Voltar para a página inicial", que volta para a pergunta de maioridade (decisão do Diego, 2026-10-30). A resposta não é lembrada; ao abrir o site de novo, a pergunta volta. Nenhuma página do site é exibida a quem respondeu "não".
- **Retorno:** depois de confirmar, a pessoa vai para a página que tentou abrir, com os mesmos parâmetros. Sem página pedida, ou quando ela é a home, vai para a [[boas-vindas]]. Só endereços do próprio site são aceitos como retorno; qualquer outro é ignorado.
- **Robôs de busca:** uma lista de user-agents conhecidos (ex.: Googlebot, Bingbot) passa sem a pergunta, para não atrapalhar a indexação.
- **Risco aceito:** o user-agent é informado pelo próprio navegador, então qualquer pessoa pode se passar por robô e pular a pergunta. É aceito porque a pergunta é uma confirmação declarada, sem validação; a compra continua exigindo conta e a confirmação no checkout (LB-20).
- **Sem documento:** não há validação de documento nem de data de nascimento na entrada.
- **Textos do card:** "Você tem 18 anos ou mais?" e "Acesso não permitido".

## Textos

Aprovados pelo Diego em 2026-10-29 (pergunta 4), que autorizou acrescentar os textos necessários; os acrescentados pelo Spec estão marcados com *. A tela segue o visual da [[boas-vindas]]: logo, folhagem e botões de [[identidade-visual]].

| Lugar | Texto proposto |
| --- | --- |
| Botão "sim" (primário) | "Sim, tenho 18 anos ou mais" |
| Botão "não" (contorno) | "Não" |
| Aviso abaixo dos botões | Os avisos do rodapé, com o texto definido em [[termos-privacidade]] ("Textos", linha "Rodapé, avisos") |
| Texto de apoio em "Acesso não permitido" | "Este site é só para maiores de 18 anos." |
| Botão em "Acesso não permitido" (primário) | "Voltar para a página inicial" |
| Texto de apoio da pergunta * | "Para entrar, confirme sua idade." |

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada do plano de testes do card.

- **Decisão de acesso:** função pura que recebe o caminho pedido, o cookie de confirmação (com a data) e o user-agent, e devolve "seguir", "perguntar com retorno" ou "liberar robô" (teste unitário).
- **Retorno seguro:** função pura que aceita só caminhos internos (teste unitário).
- **Cenários desta spec:** E2E com viewport de celular; a validade de 30 dias é testada com a data do cookie, sem esperar.

## Fora de escopo

- Validação de documento ou de data de nascimento.
- Confirmação de maioridade no checkout (LB-20, #98).
- Banner de cookies (LB-21, MVP+).

## Decisões relacionadas

- [[mvp-corte]]: escopo reduzido do E12.
- [[boas-vindas]]: a tela seguinte.
- [[identidade-visual]]: componentes da tela.

### Decisões do Diego (2026-10-30)

- **Botão no acesso negado:** "adicionar botão de retornar pra página inicial quando o acesso ao site for negado". O botão "Voltar para a página inicial" volta para a pergunta de maioridade.

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, pela política de autonomia. Qualquer uma pode ser vetada.

- **"Não" não é lembrado:** a pergunta volta na próxima visita, em vez de bloquear o navegador.
- **Retorno só para endereços internos:** evita redirecionamento aberto.
- **Home sem página pedida leva à boas-vindas;** link direto leva à página pedida.
- **Botão "Voltar para a página inicial" como primário:** é a única ação da tela de acesso negado. O cenário entrou no de menor de idade, porque a spec já tem 6 cenários.

## Tickets propostos

| Issue | Ajuste proposto | Motivo |
| --- | --- | --- |
| #97 LB-19 | Link para esta spec; critérios: os 6 cenários; "não" não é lembrado e mostra o botão "Voltar para a página inicial"; retorno só interno | O card não define o retorno externo, a validade vencida nem o que acontece depois do "não" |
