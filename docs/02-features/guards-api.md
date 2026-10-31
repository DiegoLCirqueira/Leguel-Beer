---
status: rascunho
modulo: conta
card-notion: https://app.notion.com/p/3fd490a7ac7d815a954cf82cc4a284db
prioridade: P0
criado: 2026-10-29
atualizado: 2026-10-29
issues:
  - "#43 LB-28"
tags:
  - feature
---

# Proteção da API e do site por autenticação e papéis

> [!info] Origem
> Derivada do card do Notion **LB-28** (#43). A API valida o JWT do Supabase Auth ([[ADR-001-stack]]); no desenvolvimento, o Supabase Auth é o local, do Supabase CLI ([[api-base]]). As rotas de pedidos, endereços e admin do card ainda não existem: os cenários usam rotas de cliente e de admin em geral, e cada módulo novo declara o acesso das suas.

## História de usuário

- **Como** cliente da Leguelé Beer
- **Quero** que só eu acesse meus dados e que só o admin acesse a operação da loja
- **Para** confiar a minha conta e os meus pedidos ao site

## Cenários

```gherkin
# language: pt
Funcionalidade: Proteção por autenticação e papéis

  Esquema do Cenário: Rota de cliente sem token válido
    Dado uma requisição <token>
    Quando chamo uma rota de cliente, como GET /me/profile
    Então a resposta tem status 401 com code "UNAUTHORIZED"

    Exemplos:
      | token                              |
      | sem token                          |
      | com token de assinatura adulterada |
      | com token expirado                 |

  Cenário: Recurso de outro cliente parece não existir
    Dado que entrei como a cliente Ana
    E existe um recurso que pertence ao cliente Bruno
    Quando chamo a rota desse recurso com o id do recurso do Bruno
    Então a resposta tem status 404 com code "NOT_FOUND"
    E a resposta é igual à de um id que não existe

  Cenário: Cliente comum numa rota de admin
    Dado que entrei como cliente sem o papel admin
    Quando chamo uma rota de admin
    Então a resposta tem status 403 com code "FORBIDDEN"
    E no site, ao abrir /admin, vejo a página de "não encontrada"

  Cenário: Admin acessa a rota de admin
    Dado que entrei com a conta do e-mail configurado como admin
    Quando chamo uma rota de admin
    Então a resposta tem status 200

  Esquema do Cenário: Página protegida do site sem sessão
    Dado que sou convidado, sem sessão
    Quando abro <página>
    Então vou para a tela de entrar
    E depois de entrar volto para <página>

    Exemplos:
      | página    |
      | /conta    |
      | /checkout |

  Cenário: Rotas públicas continuam abertas
    Dado uma requisição sem token
    Quando chamo GET /health e GET /docs
    Então as duas respondem com status 200
```

## Regras de negócio

- **Todas as rotas da API são protegidas por padrão.** Rota pública precisa ser marcada como pública; hoje são públicas `/health` e `/docs`. As rotas de catálogo serão públicas quando chegarem.
- **Três níveis de acesso:** público (sem conta), cliente (qualquer conta autenticada) e admin (conta com o papel admin).
- **Token:** a API valida a assinatura e a validade do JWT do Supabase Auth pelas chaves públicas do Supabase (JWKS), guardadas em cache. Token ausente, adulterado ou expirado: 401.
- **Chave assimétrica:** o Supabase local assina os JWT com chave assimétrica (ex.: ES256), configurada no `supabase/config.toml`, para a API validar só com a chave pública do JWKS. A chave privada local é gerada por comando documentado no README e fica fora do git. A API recusa tokens assinados com o segredo compartilhado (HS256). No Supabase da nuvem, a mesma configuração entra no LB-8.
- **Papéis:** guardados no banco da API, por conta. Uma conta sem papel registrado é cliente. O papel admin vai para a conta cujo e-mail confirmado é o da variável `ADMIN_EMAIL` (sem valor no `.env.example`), em dois momentos: na criação do perfil, no primeiro acesso dessa conta ([[cadastro-login]]), e a cada execução do seed, se a conta já existir. Mudar `ADMIN_EMAIL` não tira o papel da conta anterior; isso é feito à mão.
- **Sem permissão de papel:** 403 na API. No site, `/admin` mostra "não encontrada" para quem não é admin, para não revelar que a área existe.
- **Posse:** um cliente só acessa recursos que são dele. Recurso de outro cliente responde 404, igual a um id inexistente. A regra fica nos casos de uso, não só no controller.
- **Site:** `/conta`, `/checkout` e `/admin` exigem sessão; sem sessão, a pessoa vai para a tela de entrar ([[cadastro-login]]) e volta à página pedida depois. O site renova a sessão quando o token está perto de vencer.
- **Chave de serviço do Supabase:** nunca no site nem em variável pública do front.
- **Swagger:** documenta o esquema Bearer e marca quais rotas exigem cliente ou admin.
- **Erros** no formato de [[api-base]].

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada do plano de testes do card.

- **Validação do token:** testes unitários com um JWKS falso e tokens gerados no teste (válido, expirado, adulterado).
- **Papéis e rota pública:** Supertest com um módulo de teste que tem uma rota de cliente, uma de admin e uma pública.
- **Posse:** caso de uso testado com repositório em memória (o recurso do Bruno pedido pela Ana dá "não encontrado").
- **Site:** teste da regra de redirecionamento (função pura: caminho, sessão e papel → seguir, entrar com retorno ou "não encontrada") e E2E com o Supabase local.

## Fora de escopo

- Permissões por recurso além dos três níveis.
- Telas de pedidos, endereços e admin: cada uma traz suas rotas e declara o acesso.
- Exigir conta ao finalizar a compra a partir da Geladeira (LB-31, #46), que usa esta proteção.
- RLS no banco como camada principal de autorização.

## Decisões relacionadas

- [[ADR-001-stack]], [[api-base]], [[cadastro-login]]
- [[GLOSSARY]]: Cliente, Convidado, Admin.

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, pela política de autonomia. Qualquer uma pode ser vetada.

- **Os três papéis do card** ("só 3 papéis") são público, cliente e admin.
- **Conta sem papel registrado é cliente;** só o admin é gravado.
- **Cenários com rotas genéricas,** já que as rotas do card (pedidos, endereços, admin de cervejas) ainda não existem.
- **Validação do JWT sem biblioteca nova:** `node:crypto` com o JWKS em cache de 10 minutos (releitura se a chave for desconhecida, no máximo a cada 30 s); só ES256 e RS256, `role` "authenticated" e `exp` válido. JWKS fora do ar recusa o token (falha fechada).
- **`SUPABASE_URL` obrigatória no boot da API,** para montar a URL do JWKS; sem ela a API não sobe.
- **Chave de assinatura local:** `pnpm db:signing-key` cria `supabase/signing_keys.json` (ES256, fora do git) antes do primeiro `pnpm db:start`; quem já tem o Supabase rodando precisa de `db:stop` e `db:start`.
- **`GET /me/role`:** rota de cliente que responde `{ papel: "cliente" | "admin" }` com o mesmo papel que o guard lê (`findRole`), sem exigir perfil completo: conta sem perfil é cliente e o admin do seed (perfil só com o papel) é admin. O site usa esta rota, e não `GET /me/profile` (404 para perfil incompleto), para decidir o acesso a `/admin`.
- **Redirecionamento do site** (`/conta`, `/checkout`, `/admin`) fica com o Front, junto das sessões do LB-25.
- **"Não encontrada" em `/admin`** para quem não é admin, como no card.
- **O seed de desenvolvimento também cria a conta admin** no Supabase Auth local, com a senha de `ADMIN_SEED_PASSWORD` (só local, nunca em commit, PR, log ou nota). O seed recusa rodar se `SUPABASE_URL` ou `DATABASE_URL` não forem locais (`localhost`, `127.0.0.1`) e só promove a admin uma conta com e-mail confirmado; conta não confirmada com o `ADMIN_EMAIL` é recusada, contra pré-sequestro.

## Tickets propostos

| Issue | Ajuste proposto | Motivo |
| --- | --- | --- |
| #43 LB-28 | Link para esta spec; critérios: os 6 cenários; papéis público, cliente e admin; admin pelo `ADMIN_EMAIL`; rotas fechadas por padrão | O card cita rotas que ainda não existem e não define quem é cliente |
