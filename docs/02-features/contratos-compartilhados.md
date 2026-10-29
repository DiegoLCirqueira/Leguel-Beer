---
status: rascunho
modulo: base-tecnica
card-notion: https://app.notion.com/p/3fd490a7ac7d81debc2be710474791d7
prioridade: P0
criado: 2026-10-29
atualizado: 2026-10-29
issues:
  - "#6 LB-120"
tags:
  - feature
---

# Contratos compartilhados e cliente tipado da API

> [!info] Origem
> Derivada do card do Notion **LB-120** (#6) e do [[ADR-005-monorepo-camadas]]. O pacote `@leguele/shared` já existe desde o [[base-monorepo]] (compilado com `tsc`, com `formatPrice`). Esta spec cobre o que a fase 1 do [[roteiro-mvp]] precisa: os contratos do acesso ([[cadastro-login]], [[recuperacao-senha]], [[guards-api]]) e o cliente HTTP do site. Contratos e regras de catálogo, Geladeira, frete e pedidos entram com as specs de cada um.

## História de usuário

- **Como** pessoa que desenvolve o site e a API
- **Quero** validar e tipar cada contrato uma vez só, usado dos dois lados
- **Para** que uma mudança na API apareça como erro de tipo no site antes de chegar ao navegador

## Cenários

```gherkin
# language: pt
Funcionalidade: Contratos compartilhados e cliente tipado

  Cenário: Contrato quebrado aparece no typecheck
    Dado que renomeio um campo do schema de resposta do perfil em packages/shared
    Quando executo "pnpm typecheck" na raiz
    Então o comando termina com código diferente de 0
    E a saída aponta os arquivos de apps/web e de apps/api que usam o campo antigo

  Cenário: A mesma regra vale no formulário e na API
    Dado o schema de cadastro em packages/shared
    Quando envio a senha "abc123" pelo formulário de "Criar sua conta"
    Então o formulário mostra "A senha precisa ter pelo menos 8 caracteres." sem chamar a API
    E a mesma senha enviada direto à API recebe 400 com code "VALIDATION_ERROR" e o campo "senha" em details

  Cenário: Erro da API vira um erro tipado no site
    Dado que a API responde 400 no formato { code, message, details }
    Quando o cliente HTTP do site recebe a resposta
    Então ele lança um erro de API com code, message e details tipados

  Esquema do Cenário: Token vencido renova a sessão uma vez
    Dado que o token da sessão venceu
    E a API responde 401 à primeira chamada
    Quando o cliente HTTP renova a sessão e <renovação>
    Então <resultado>
    E a sessão é renovada no máximo uma vez para essa chamada

    Exemplos:
      | renovação          | resultado                                                     |
      | a renovação dá certo | a chamada é repetida com o token novo e devolve os dados    |
      | a renovação falha  | o cliente lança o erro de API com code "UNAUTHORIZED", sem repetir |

  Cenário: O pacote compartilhado não importa Node nem framework
    Dado um arquivo de packages/shared que importa um módulo do Node, do Nest, do Next ou do Prisma
    Quando executo "pnpm lint" na raiz
    Então o comando termina com código diferente de 0
    E a saída do dependency-cruiser aponta o arquivo e a regra violada
```

## Regras de negócio

- **`packages/shared`** guarda schemas Zod de requisição e resposta, os tipos inferidos deles e regras puras. Organização por contexto (ex.: `conta`, `erros`), com o mesmo vocabulário do [[GLOSSARY]].
- **Nada de Node, Nest, Next, React ou Prisma** dentro do pacote: ele roda no navegador e na API. Verificado pelo dependency-cruiser.
- **Contratos da fase 1:** cadastro, entrar, nova senha, perfil e o formato de erro `{ code, message, details }` de [[api-base]]. As mensagens de validação são as das specs de acesso, em pt-BR.
- **API:** o pipe de validação de [[api-base]] usa esses schemas; o Swagger é gerado a partir deles.
- **Site:** os formulários usam os mesmos schemas; o cliente HTTP:
  - envia o token da sessão do Supabase Auth em `Authorization: Bearer`;
  - transforma qualquer resposta de erro da API num erro de API tipado;
  - em 401, renova a sessão uma vez e repete a chamada; se falhar de novo, lança o erro.
- **Busca de dados no site:** com TanStack Query, como no card; o primeiro hook é o do perfil.
- **Regras puras do card** (`discountPercent`, `calculateShipping`, `installmentPlan`, `pricePack`) entram com as features que as usam; `pricePack` é do Mix & Match, Pós-MVP ([[mvp-corte]]).

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada do plano de testes do card.

- **Schemas:** testes unitários em `packages/shared` com entradas válidas e inválidas.
- **Cliente HTTP:** testes unitários com respostas simuladas por MSW (sucesso, 400, 401 com renovação que dá certo e que falha).
- **Contrato quebrado e regra de importação:** provados com um caso que deve falhar (red) antes da regra.

## Fora de escopo

- SDK publicado no npm.
- Cliente gerado a partir do OpenAPI: os tipos vêm direto dos schemas compartilhados.
- Contratos e regras de catálogo, Geladeira, entrega, checkout e pedidos.

## Decisões relacionadas

- [[ADR-005-monorepo-camadas]], [[base-monorepo]], [[api-base]]
- [[cadastro-login]], [[recuperacao-senha]], [[guards-api]]

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, pela política de autonomia. Qualquer uma pode ser vetada.

- **Só os contratos do acesso agora;** os outros vêm com cada feature.
- **Tipos direto dos schemas Zod,** sem gerar cliente pelo OpenAPI (o ADR-005 aceita as duas formas).
- **Exemplo com o perfil** em vez de `useBeers`, porque o catálogo vem depois no [[roteiro-mvp]].
- **Regra do dependency-cruiser para `packages/shared`,** além da que já existe para `domain`.

## Tickets propostos

| Issue | Ajuste proposto | Motivo |
| --- | --- | --- |
| #6 LB-120 | Link para esta spec; critérios: os 5 cenários; contratos do acesso; regras puras de outras features movidas para as issues delas; exemplo com o perfil | O card usa o catálogo como exemplo e traz regras de features que vêm depois |
