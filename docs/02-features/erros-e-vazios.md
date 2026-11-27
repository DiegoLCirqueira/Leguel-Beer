---
status: pronto
modulo: site
card-notion:
prioridade: P1
criado: 2026-11-27
tags:
  - feature
---

# Páginas de erro e estados vazios

> [!info] Origem
> Ordem do Diego em 27/11: completar todas as telas. Faltam a página "não encontrada" (404), a de erro inesperado (500) e uma regra única para os estados vazios e de falha de carregamento, hoje espalhados nas specs de cada tela. Esta spec reúne o que é comum e aponta as que já existem. Os textos novos são recomendação do Spec, vetáveis (marca, item 2 da política).

## História de usuário

- **Como** cliente ou convidado
- **Quero** ver uma mensagem clara quando a página não existe, algo dá errado ou não há nada para mostrar
- **Para** saber o que fazer em seguida, sem ficar numa tela em branco

## Cenários

```gherkin
# language: pt
Funcionalidade: Páginas de erro e estados vazios

  Cenário: Página que não existe
    Dado que abro um endereço do site que não existe
    Então vejo "Página não encontrada" com o botão "Voltar ao início"
    E o status HTTP é 404

  Cenário: Pedido ou cerveja que não são acessíveis
    Dado que abro o pedido de outro cliente ou uma cerveja inativa
    Então vejo a mesma página "Página não encontrada", sem dizer se o recurso existe

  Cenário: Erro inesperado numa página
    Dado que a API ou o site falha ao montar uma página
    Quando a página abre
    Então vejo "Algo deu errado" com o botão "Tentar de novo"
    E ao tocar nele a página tenta carregar de novo
    E nenhuma mensagem técnica, pilha ou dado de outra pessoa aparece

  Cenário: Falha de carregamento dentro de uma tela
    Dado que a lista de pedidos não consegue ser carregada
    Quando abro "Meus pedidos"
    Então vejo "Não foi possível carregar seus pedidos." e o botão "Tentar de novo", e o cabeçalho e a barra inferior continuam na tela

  Cenário: Lista vazia
    Dado que não há nada para mostrar numa lista
    Quando abro essa tela
    Então vejo a mensagem vazia daquela tela e uma ação que leva ao próximo passo, nunca uma área em branco

  Cenário: Sessão vencida
    Dado que a minha sessão venceu
    Quando abro uma página que exige conta
    Então sou levado a "Entrar" e volto à página depois de entrar
```

## Regras de negócio

- **404 global:** `app/not-found` do site, com o cabeçalho e a barra inferior da loja, o título "Página não encontrada" (Kaushan Script, como os outros títulos de destaque), o texto "O endereço que você abriu não existe ou foi removido." e o botão primário "Voltar ao início" (`/`). Vale para qualquer rota desconhecida, para `/admin/*` de quem não é admin ([[admin]]) e para o recurso de outro cliente ou inexistente ([[pedidos-cliente]], [[acompanhar-pedido]], [[produto]]); em todos a resposta é a mesma, para não revelar o que existe ([[guards-api]]).
- **Erro global (500):** `app/error` e `global-error` do site, com o título "Algo deu errado", o texto "Tivemos um problema ao abrir esta página. Tente de novo em instantes." e o botão "Tentar de novo", que roda o `reset` da página; segundo botão "Voltar ao início". Sem pilha, sem mensagem técnica e sem dado pessoal na tela nem no log do navegador. O erro é registrado no servidor só com o tipo e a rota ([[qualidade-compra]]).
- **Falha dentro de uma tela** (a API fora do ar, tempo esgotado): a tela mostra a mensagem própria dela ("Não foi possível carregar seus pedidos.", "Não foi possível carregar seus endereços agora.", ...) com "Tentar de novo", **sem** trocar a página inteira pelo erro global. O padrão é um bloco com `role="alert"`, o texto e o botão, como já é no checkout ([[checkout]]).
- **Vazio:** todo estado vazio traz uma frase e um botão para o próximo passo. As que já existem: Geladeira vazia (prateleiras com garrafas fantasma, [[geladeira]]), catálogo sem resultado ("Limpar filtros", [[catalogo]]), "Meus pedidos" ("Você ainda não fez nenhum pedido." e "Ver catálogo", [[pedidos-cliente]]), "Meus endereços" (primeiro endereço, [[enderecos-entrega]]). A home sem destaques tem a seção escondida e o topo continua ([[home-topo]]). As do admin (sem pedidos, sem movimentos de estoque) seguem a regra: "Nenhum pedido ainda." e "Nenhum movimento ainda.", sem botão ([[admin]]).
- **Sessão vencida:** a página que exige conta leva a `/entrar` com o retorno à página de origem ([[cadastro-login]]); a ação que falha por sessão vencida (Server Action) faz o mesmo, sem mensagem de erro.
- **Carregando:** skeleton (já em `components/ui`) em vez de tela em branco, nas telas com busca de dados.
- **Acessibilidade e layout:** o título é o `h1`; o foco inicial vai para o título; os botões têm alvo de 44 px; sem rolagem horizontal de 195 até 1440 px; o texto não depende de imagem. A arte é a mesma dos outros fundos de folhagem (sem arte nova).
- **Sem página de manutenção** e sem página "offline" do PWA (fora do MVP).

## Fora de escopo

- Página de manutenção, PWA offline, monitoramento de erros externo e painel de erros.
- Mensagens de validação de formulário (são de cada tela).

## Referência visual

- Sem tela própria no design. A **tela 27** (Início sem destaques) **não vale** como mensagem vazia ([[home-topo]]); a **tela 25** (catálogo sem resultado) vale só para o catálogo ([[catalogo]]).

## Seams de teste

> [!info] Proposta do Spec, vetável

- **Componente** (Vitest): `not-found` e `error` com os textos e botões, o `reset` chamado ao tocar em "Tentar de novo" e nenhum texto de erro técnico.
- **E2E** (celular, 360 × 640): uma rota que não existe mostra "Página não encontrada" com status 404; o pedido de outro cliente mostra a mesma página; "Voltar ao início" leva a `/`.
- **Falha de API simulada** (E2E com a API de teste): "Meus pedidos" mostra "Não foi possível carregar seus pedidos." e "Tentar de novo" recarrega.

## Fatias, com dono e ordem

| # | Dono | O que entrega |
| --- | --- | --- |
| 1 | Front | `not-found`, `error` e `global-error` do site, com a vitrine `/dev/tokens` se criar componente, e os testes |
| 2 | Front | Passar as telas existentes ao padrão de falha (`role="alert"` com "Tentar de novo") onde ainda não seguem, junto das fatias das telas novas |

Candidatos a ADR: nenhum.

## Decisões relacionadas

- [[admin]], [[pedidos-cliente]], [[acompanhar-pedido]], [[checkout]], [[geladeira]], [[catalogo]], [[home-topo]], [[guards-api]], [[identidade-visual]]

## Decisões tomadas sem consulta

Recomendações do Spec em 27/11, por ordem do Diego de completar todas as telas; qualquer uma pode ser vetada.

- **Textos novos:** "Página não encontrada", "Voltar ao início", "Algo deu errado", "Tentar de novo" e o texto de cada uma.
- **404 igual para recurso inexistente e de outra pessoa.**
- **Falha dentro da tela não troca a página inteira pelo erro global.**
