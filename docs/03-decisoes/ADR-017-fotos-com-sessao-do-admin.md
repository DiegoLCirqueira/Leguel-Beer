---
status: proposto
data: 2026-11-13
tags:
  - adr
---

# ADR-017: Fotos das cervejas enviadas com a sessão do admin

> [!info] Status
> **Proposto, com aceite do Diego antes da fatia 3 do LB-73.** Criar o bucket e a política do armazenamento muda permissões de um serviço (item 6 das "Decisões que são do Diego"). Rascunho do Spec em [[admin]] (13/11); o Back confirma ou ajusta na fatia 3.

## Contexto

O admin envia uma foto por cerveja ao armazenamento de arquivos do Supabase ([[ADR-001-stack]]). A forma comum é a API gerar uma URL de envio assinada, mas isso exige a chave de serviço do Supabase no processo da API, e essa chave é só do seed (CLAUDE.md; [[ADR-014-admin-so-com-email-confirmado]] evitou o mesmo pelo mesmo motivo). No site, o token da sessão fica em cookie HttpOnly e a URL e a chave anon do Supabase só existem no servidor do site ([[ADR-012-sessao-em-cookies-httponly]]).

## Decisão

- O navegador converte a foto para WebP e a manda ao **servidor do site**, que a grava num bucket **privado** de envio com o token da sessão do admin. O token e a chave ficam no servidor do site; o JavaScript do navegador nunca os lê.
- A API gera o caminho de envio (aleatório, válido por 10 minutos). Para publicar, ela lê o arquivo no bucket privado com a sessão do admin, confere os bytes (WebP de fato) e o tamanho (até 40 KB; o original escolhido no navegador pode ter até 5 MB), copia para o bucket **público** com um nome novo, apaga o envio e só então grava o endereço na cerveja. Recusado, o envio é apagado e nunca é servido.
- Uma política do armazenamento só deixa gravar nos dois buckets quem tem o papel admin no banco; nenhum sobrescreve arquivos e a escrita pública é negada.

## Por quê

Nenhum processo em execução guarda uma chave com poder total sobre o Supabase; a permissão de gravar fica no papel admin, a mesma regra do resto do admin. A etapa privada garante que nada inválido seja servido, mesmo com tipo ou extensão falsos. O custo é a regra de acesso existir em dois lugares (guard da API e política do armazenamento), o arquivo de até 40 KB atravessar a função do servidor do site e a API, e haver uma cópia a mais na publicação.

## Alternativas consideradas

- **URL assinada gerada pela API:** descartada porque exige a chave de serviço na API.
- **Envio pela API repassando o token do admin:** também dispensa a chave de serviço, mas soma uma rota de envio na API sem ganho sobre o servidor do site, que já guarda a sessão.

## Consequências

- O bucket e a política ficam versionados no repositório, numa migration SQL aplicada pelo mesmo caminho das migrations do banco (local e produção), com o `supabase/` local recebendo a mesma configuração; o Back define o arquivo exato na fatia 3.
- A política não abre a tabela de perfis ao papel `authenticated`: ela chama uma função dedicada no banco (só leitura, que devolve se o usuário do token é admin), e só essa função tem acesso ao papel.
- Mudança no papel admin precisa valer nos dois lugares; os testes da política rodam no Supabase local.
