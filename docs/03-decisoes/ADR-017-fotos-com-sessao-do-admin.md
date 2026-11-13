---
status: proposto
data: 2026-11-13
tags:
  - adr
---

# ADR-017: Fotos das cervejas enviadas com a sessão do admin

> [!info] Status
> **Proposto** pelo Spec em [[admin]] (13/11), vetável pelo Diego; o Back confirma ou ajusta na fatia 3 do LB-73.

## Contexto

O admin envia uma foto por cerveja ao armazenamento de arquivos do Supabase ([[ADR-001-stack]]). A forma comum é a API gerar uma URL de envio assinada, mas isso exige a chave de serviço do Supabase no processo da API, e essa chave é só do seed (CLAUDE.md; [[ADR-014-admin-so-com-email-confirmado]] evitou o mesmo pelo mesmo motivo).

## Decisão

- O site envia a foto direto ao armazenamento com a **sessão do admin** (o token do Supabase Auth).
- Uma política do armazenamento só deixa gravar no bucket das cervejas quem tem o papel admin no banco; o bucket aceita só `image/webp` até 40 KB (o original escolhido pelo admin pode ter até 5 MB) e não sobrescreve arquivos; a escrita pública é negada.
- A API gera o caminho (aleatório) e, antes de gravar o endereço na cerveja, confere que o arquivo existe nesse caminho, é WebP de fato (pelos bytes) e tem até 40 KB.

## Por quê

Nenhum processo em execução guarda uma chave com poder total sobre o Supabase; a permissão de gravar fica no papel admin, a mesma regra do resto do admin. O custo é a regra de acesso existir em dois lugares (guard da API e política do armazenamento) e a política consultar o papel no banco.

## Alternativas consideradas

- **URL assinada gerada pela API com a chave de serviço:** mais comum, mas põe a chave de serviço na API.
- **Upload pela API (o arquivo passa pela função):** sem chave no site, mas o arquivo atravessa a função serverless, com limite de tamanho do corpo e mais custo de execução ([[ADR-002-hospedagem-api]]).

## Consequências

- Mudança no papel admin precisa valer nos dois lugares; os testes da política rodam no Supabase local.
