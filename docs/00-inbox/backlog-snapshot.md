---
tipo: snapshot
fonte-notion: https://app.notion.com/p/732ced3c78e64734be971ae3ed4c952a
capturado: 2026-10-28
tags: [backlog]
---

# Snapshot do backlog (Notion → GitHub Issues?)

> [!info] Material de apoio, não é uma decisão
> Retrato somente leitura do backlog do Notion em 2026-10-28, para ajudar a escolher o issue tracker (Notion ou GitHub Issues). Nada foi criado no GitHub e nada foi alterado no Notion. Se o Notion mudar, este arquivo fica desatualizado.

## Resumo

- **Cards:** 124 (LB-1 a LB-124), somando **387 pontos**.
- **Épicos:** 18.
- **Status:** Backlog: 3 · Pronto: 121.
- **Prioridade:** P0: 62 · P1: 40 · P2: 17 · P3: 5.
- **Tipo:** feature: 82 · refactor: 1 · spike: 4 · tecnica: 31 · teste: 6.

## Regras de conversão propostas

| Notion | GitHub |
| --- | --- |
| Épico | Issue com label `epic`; os cards viram **sub-issues** dele (ou, alternativa, um *milestone* por épico) |
| Card | Issue "ticket", título `[LB-NN] <título do card>` para manter a rastreabilidade |
| Tipo | label `tipo:feature`, `tipo:tecnica`, `tipo:spike`, `tipo:teste` ou `tipo:refactor` |
| Categoria | label `area:loja`, `area:checkout`, `area:admin`, `area:design`, `area:seguranca`, `area:infra`, `area:qualidade`, `area:marketing` |
| Prioridade | label `prio:p0` a `prio:p3` |
| Etiquetas | labels `frontend`, `backend`, `banco`, `infra`, `docs` (iguais às do Notion) |
| Status | coluna de um GitHub Project (Backlog, Pronto, Em andamento, Em revisão, Bloqueado, Concluído) |
| Estimativa | campo numérico "Pontos" no GitHub Project |
| Conteúdo da página (resumo, BDD, plano de testes, subtarefas, DoD) | corpo da issue em Markdown; subtarefas como task list |

## Épicos

| # | Épico | Prioridade | Cards | Pontos | Issue no GitHub |
| --- | --- | --- | --- | --- | --- |
| E1 | [Back-end em camadas pronto para crescer](https://app.notion.com/p/3fd490a7ac7d81409e79d39ea89ca78d) | P0 | 7 | 22 | Épico: `[Épico] Back-end em camadas pronto para crescer` · `epic` `area:infra` `prio:p0` |
| E2 | [Base técnica pronta para evoluir com segurança](https://app.notion.com/p/3fd490a7ac7d810d8551d33c8a4f0fe3) | P0 | 10 | 26 | Épico: `[Épico] Base técnica pronta para evoluir com segurança` · `epic` `area:infra` `prio:p0` |
| E3 | [Catálogo fácil de explorar](https://app.notion.com/p/3fd490a7ac7d81048f7ac59e357a46a9) | P0 | 8 | 23 | Épico: `[Épico] Catálogo fácil de explorar` · `epic` `area:loja` `prio:p0` |
| E4 | [Checkout com Pix e cartão confiável](https://app.notion.com/p/3fd490a7ac7d813cb2e5f0ae492e8a59) | P0 | 8 | 32 | Épico: `[Épico] Checkout com Pix e cartão confiável` · `epic` `area:checkout` `prio:p0` |
| E5 | [Conta do cliente sem atrito](https://app.notion.com/p/3fd490a7ac7d810082c5f4ac19b47d86) | P0 | 8 | 23 | Épico: `[Épico] Conta do cliente sem atrito` · `epic` `area:seguranca` `prio:p0` |
| E6 | [Entrega local calculada por distância](https://app.notion.com/p/3fd490a7ac7d813cbd7df51c3de7c392) | P0 | 5 | 13 | Épico: `[Épico] Entrega local calculada por distância` · `epic` `area:checkout` `prio:p0` |
| E7 | [Geladeira fluida e confiável](https://app.notion.com/p/3fd490a7ac7d81609903e90d3c9bffc1) | P0 | 8 | 30 | Épico: `[Épico] Geladeira fluida e confiável` · `epic` `area:loja` `prio:p0` |
| E8 | [Identidade visual consistente em todo o site](https://app.notion.com/p/3fd490a7ac7d8130ad3dea849dcae01e) | P0 | 8 | 23 | Épico: `[Épico] Identidade visual consistente em todo o site` · `epic` `area:design` `prio:p0` |
| E9 | [Painel admin para operar a loja sozinho](https://app.notion.com/p/3fd490a7ac7d8184bac7c68e631c2d86) | P0 | 9 | 34 | Épico: `[Épico] Painel admin para operar a loja sozinho` · `epic` `area:admin` `prio:p0` |
| E10 | [Página de produto que convence](https://app.notion.com/p/3fd490a7ac7d811388f5cd9fd760c133) | P0 | 7 | 18 | Épico: `[Épico] Página de produto que convence` · `epic` `area:loja` `prio:p0` |
| E11 | [Qualidade comprovada e portfólio publicado](https://app.notion.com/p/3fd490a7ac7d8180a521f06d8fa2364d) | P0 | 6 | 17 | Épico: `[Épico] Qualidade comprovada e portfólio publicado` · `epic` `area:qualidade` `prio:p0` |
| E12 | [Acesso responsável e dados protegidos](https://app.notion.com/p/3fd490a7ac7d81c3a8ced145fa05c006) | P1 | 5 | 13 | Épico: `[Épico] Acesso responsável e dados protegidos` · `epic` `area:seguranca` `prio:p1` |
| E13 | [Avisos e relatório mensal automáticos](https://app.notion.com/p/3fd490a7ac7d810cb9e5d39f9cabec9f) | P1 | 4 | 15 | Épico: `[Épico] Avisos e relatório mensal automáticos` · `epic` `area:admin` `prio:p1` |
| E14 | [Clube do Leguelé com assinatura recorrente](https://app.notion.com/p/3fd490a7ac7d811788cadeaaee3ca486) | P1 | 11 | 40 | Épico: `[Épico] Clube do Leguelé com assinatura recorrente` · `epic` `area:loja` `prio:p1` |
| E15 | [Mix & Match com packs personalizados](https://app.notion.com/p/3fd490a7ac7d8136a5aef3983d3164c5) | P1 | 7 | 23 | Épico: `[Épico] Mix & Match com packs personalizados` · `epic` `area:loja` `prio:p1` |
| E16 | [Pedidos acompanháveis do início ao fim](https://app.notion.com/p/3fd490a7ac7d812ba8becf4af2d0648d) | P1 | 5 | 12 | Épico: `[Épico] Pedidos acompanháveis do início ao fim` · `epic` `area:loja` `prio:p1` |
| E17 | [Site encontrável, instalável e rápido](https://app.notion.com/p/3fd490a7ac7d81158825fa1bfd057a88) | P1 | 5 | 15 | Épico: `[Épico] Site encontrável, instalável e rápido` · `epic` `area:marketing` `prio:p1` |
| E18 | [Favoritos e avaliações reais](https://app.notion.com/p/3fd490a7ac7d811aad41d1a33c7869ba) | P2 | 3 | 8 | Épico: `[Épico] Favoritos e avaliações reais` · `epic` `area:loja` `prio:p2` |

## Cards

Todos os cards virariam **tickets** (sub-issues do épico indicado). Nenhum card do Notion é, em si, um épico.

| ID | Título | Status | Prio | Pts | Épico | Labels sugeridas |
| --- | --- | --- | --- | --- | --- | --- |
| [LB-1](https://app.notion.com/p/3fd490a7ac7d81169892e34e0e6cc3ef) | Criar monorepo com Turborepo, Next.js e NestJS | Pronto | P0 | 3 | E2 | `tipo:tecnica` `area:infra` `prio:p0` `frontend` `backend` `infra` |
| [LB-2](https://app.notion.com/p/3fd490a7ac7d81d6806dfd7859a5ec31) | Configurar padrões de código com ESLint, Prettier, Husky e Commitlint | Pronto | P0 | 2 | E2 | `tipo:tecnica` `area:qualidade` `prio:p0` `infra` |
| [LB-3](https://app.notion.com/p/3fd490a7ac7d812d82c8d2d5efc3c72b) | Configurar PostgreSQL local e Prisma com migrations | Pronto | P0 | 3 | E2 | `tipo:tecnica` `area:infra` `prio:p0` `banco` `backend` `infra` |
| [LB-4](https://app.notion.com/p/3fd490a7ac7d81099583f628bacb3a58) | Modelar schema inicial do catálogo e seed com cervejas de exemplo | Pronto | P0 | 5 | E2 | `tipo:tecnica` `area:infra` `prio:p0` `banco` `backend` |
| [LB-5](https://app.notion.com/p/3fd490a7ac7d81118b6eea85cbbf0c7d) | Configurar Vitest, Testing Library e MSW | Pronto | P0 | 3 | E2 | `tipo:teste` `area:qualidade` `prio:p0` `frontend` |
| [LB-6](https://app.notion.com/p/3fd490a7ac7d81e4b19dc8904c87080f) | Configurar Playwright com playwright-bdd e cenário de fumaça | Pronto | P0 | 3 | E2 | `tipo:teste` `area:qualidade` `prio:p0` `frontend` |
| [LB-7](https://app.notion.com/p/3fd490a7ac7d81eb9f18e52ca401a79a) | Criar pipeline de CI no GitHub Actions | Pronto | P0 | 3 | E2 | `tipo:tecnica` `area:infra` `prio:p0` `infra` |
| [LB-8](https://app.notion.com/p/3fd490a7ac7d81de827ad9b54cc57de1) | Configurar deploy na Vercel com preview por PR | Pronto | P0 | 1 | E2 | `tipo:tecnica` `area:infra` `prio:p0` `infra` |
| [LB-9](https://app.notion.com/p/3fd490a7ac7d815b8c4ad81f94ef0031) | Validar variáveis de ambiente com Zod | Pronto | P1 | 1 | E2 | `tipo:tecnica` `area:infra` `prio:p1` `backend` |
| [LB-10](https://app.notion.com/p/3fd490a7ac7d81c88672fa027d26d38c) | Documentar setup e arquitetura no README | Pronto | P1 | 2 | E2 | `tipo:tecnica` `area:marketing` `prio:p1` `docs` |
| [LB-11](https://app.notion.com/p/3fd490a7ac7d818bbd1ef6ebfb609310) | Definir tokens de cor, tipografia e espaçamento da marca | Pronto | P0 | 3 | E8 | `tipo:tecnica` `area:design` `prio:p0` `frontend` |
| [LB-12](https://app.notion.com/p/3fd490a7ac7d811692bfd9f27e792650) | Criar componentes de botão, badge de estilo e chip de categoria | Pronto | P0 | 3 | E8 | `tipo:tecnica` `area:design` `prio:p0` `frontend` |
| [LB-13](https://app.notion.com/p/3fd490a7ac7d818e85f2e461ca63c158) | Criar card de produto e stepper de quantidade | Pronto | P0 | 3 | E8 | `tipo:tecnica` `area:design` `prio:p0` `frontend` |
| [LB-14](https://app.notion.com/p/3fd490a7ac7d8173a46cfe560f2fd56d) | Criar bottom sheet, toast e skeleton loaders | Pronto | P1 | 3 | E8 | `tipo:tecnica` `area:design` `prio:p1` `frontend` |
| [LB-15](https://app.notion.com/p/3fd490a7ac7d816fa733f11df342d41f) | Implementar header com contador da geladeira e tab bar inferior | Pronto | P0 | 5 | E8 | `tipo:feature` `area:design` `prio:p0` `frontend` |
| [LB-16](https://app.notion.com/p/3fd490a7ac7d81908e0fd33ec5e4342e) | Exportar logo, favicon e ícones do PWA | Pronto | P1 | 2 | E8 | `tipo:tecnica` `area:design` `prio:p1` `frontend` |
| [LB-17](https://app.notion.com/p/3fd490a7ac7d8182a8f3f1d225ccbc3f) | Otimizar fundo de folhagem para mobile | Pronto | P2 | 2 | E8 | `tipo:tecnica` `area:design` `prio:p2` `frontend` |
| [LB-18](https://app.notion.com/p/3fd490a7ac7d813bb9dbf26c7d57c6db) | Criar páginas de erro 404/500 e estados vazios | Pronto | P2 | 2 | E8 | `tipo:feature` `area:design` `prio:p2` `frontend` |
| [LB-19](https://app.notion.com/p/3fd490a7ac7d81caab51c2698587fd52) | Implementar verificação de idade 18+ na entrada | Pronto | P0 | 3 | E12 | `tipo:feature` `area:seguranca` `prio:p0` `frontend` |
| [LB-20](https://app.notion.com/p/3fd490a7ac7d81738862f1c452e27114) | Bloquear compra para menores pela data de nascimento | Pronto | P0 | 2 | E12 | `tipo:feature` `area:seguranca` `prio:p0` `backend` `banco` |
| [LB-21](https://app.notion.com/p/3fd490a7ac7d8131a68de6dc1dd0bd2f) | Implementar banner de consentimento de cookies | Pronto | P1 | 3 | E12 | `tipo:feature` `area:seguranca` `prio:p1` `frontend` |
| [LB-22](https://app.notion.com/p/3fd490a7ac7d815c9785f1be8cd09271) | Publicar termos, privacidade e aviso de projeto de portfólio | Pronto | P1 | 2 | E12 | `tipo:feature` `area:seguranca` `prio:p1` `frontend` `docs` |
| [LB-23](https://app.notion.com/p/3fd490a7ac7d81df8556dbe73e93b3fa) | Permitir exportar e excluir os dados da conta | Pronto | P2 | 3 | E12 | `tipo:feature` `area:seguranca` `prio:p2` `backend` `banco` |
| [LB-24](https://app.notion.com/p/3fd490a7ac7d8172b935df8e794f5411) | Implementar tela de boas-vindas com entrar, criar conta e convidado | Pronto | P0 | 2 | E5 | `tipo:feature` `area:loja` `prio:p0` `frontend` |
| [LB-25](https://app.notion.com/p/3fd490a7ac7d81709d51f352c2257c0b) | Implementar cadastro e login com e-mail e senha | Pronto | P0 | 3 | E5 | `tipo:feature` `area:seguranca` `prio:p0` `frontend` `backend` |
| [LB-26](https://app.notion.com/p/3fd490a7ac7d8195af8de157e8915b11) | Implementar login social com Google e Facebook | Pronto | P1 | 3 | E5 | `tipo:feature` `area:seguranca` `prio:p1` `frontend` `backend` |
| [LB-27](https://app.notion.com/p/3fd490a7ac7d814fbeded6d8c0143a57) | Implementar recuperação de senha | Pronto | P0 | 2 | E5 | `tipo:feature` `area:seguranca` `prio:p0` `frontend` |
| [LB-28](https://app.notion.com/p/3fd490a7ac7d815a954cf82cc4a284db) | Proteger a API com guards de autenticação e papéis | Pronto | P0 | 3 | E5 | `tipo:tecnica` `area:seguranca` `prio:p0` `backend` `frontend` |
| [LB-29](https://app.notion.com/p/3fd490a7ac7d8162ad6cf31191864c1a) | Implementar edição de perfil com telefone, nascimento e CPF | Pronto | P0 | 3 | E5 | `tipo:feature` `area:loja` `prio:p0` `frontend` `banco` |
| [LB-30](https://app.notion.com/p/3fd490a7ac7d8112990dd5d423575b82) | Implementar gestão de endereços com busca por CEP e geolocalização | Pronto | P0 | 5 | E5 | `tipo:feature` `area:checkout` `prio:p0` `frontend` `backend` `banco` |
| [LB-31](https://app.notion.com/p/3fd490a7ac7d81e5b5a4d3685d32e0ff) | Exigir login quando o convidado for finalizar a compra | Pronto | P1 | 2 | E5 | `tipo:feature` `area:loja` `prio:p1` `frontend` |
| [LB-32](https://app.notion.com/p/3fd490a7ac7d81f6a4b6f692da54136c) | Exibir banner rotativo de destaques na home | Pronto | P1 | 3 | E3 | `tipo:feature` `area:loja` `prio:p1` `frontend` `banco` |
| [LB-33](https://app.notion.com/p/3fd490a7ac7d81cc857be47445b362a1) | Filtrar cervejas por categoria com contadores | Pronto | P0 | 3 | E3 | `tipo:feature` `area:loja` `prio:p0` `frontend` `banco` |
| [LB-34](https://app.notion.com/p/3fd490a7ac7d81a7b531f26160f4ed1c) | Exibir cervejas em destaque na home | Pronto | P0 | 2 | E3 | `tipo:feature` `area:loja` `prio:p0` `frontend` |
| [LB-35](https://app.notion.com/p/3fd490a7ac7d818f8902cacfd96e2c0b) | Adicionar cerveja à geladeira direto do card | Pronto | P0 | 2 | E3 | `tipo:feature` `area:loja` `prio:p0` `frontend` |
| [LB-36](https://app.notion.com/p/3fd490a7ac7d81c5ba2cf6a3db8448c6) | Criar página de catálogo com filtros e ordenação | Pronto | P0 | 5 | E3 | `tipo:feature` `area:loja` `prio:p0` `frontend` `banco` |
| [LB-37](https://app.notion.com/p/3fd490a7ac7d81edae37ce535503eb60) | Implementar busca por nome, estilo e ingrediente | Pronto | P1 | 5 | E3 | `tipo:feature` `area:loja` `prio:p1` `frontend` `banco` |
| [LB-38](https://app.notion.com/p/3fd490a7ac7d81e286f6ff9859c59b61) | Sinalizar cervejas esgotadas | Pronto | P0 | 2 | E3 | `tipo:feature` `area:loja` `prio:p0` `frontend` `banco` |
| [LB-39](https://app.notion.com/p/3fd490a7ac7d814a9e55cf05dbba07e2) | Exibir chamada do Clube do Leguelé na home | Pronto | P2 | 1 | E3 | `tipo:feature` `area:marketing` `prio:p2` `frontend` |
| [LB-40](https://app.notion.com/p/3fd490a7ac7d8112b745ef42b7882d97) | Exibir dados e ficha técnica da cerveja | Pronto | P0 | 5 | E10 | `tipo:feature` `area:loja` `prio:p0` `frontend` |
| [LB-41](https://app.notion.com/p/3fd490a7ac7d81d29217d6463d50a12b) | Calcular e exibir desconto a partir do preço anterior | Pronto | P0 | 1 | E10 | `tipo:feature` `area:loja` `prio:p0` `frontend` |
| [LB-42](https://app.notion.com/p/3fd490a7ac7d8164bd04f0507e123355) | Adicionar à geladeira com quantidade e botão fixo | Pronto | P0 | 3 | E10 | `tipo:feature` `area:loja` `prio:p0` `frontend` |
| [LB-43](https://app.notion.com/p/3fd490a7ac7d819787d8d0319c58353c) | Implementar abas de descrição, ingredientes, harmonização e avaliações | Pronto | P1 | 3 | E10 | `tipo:feature` `area:loja` `prio:p1` `frontend` |
| [LB-44](https://app.notion.com/p/3fd490a7ac7d81f08d69efb2f7ea2276) | Exibir quanto falta para o frete grátis | Pronto | P2 | 2 | E10 | `tipo:feature` `area:checkout` `prio:p2` `frontend` |
| [LB-45](https://app.notion.com/p/3fd490a7ac7d812a9c56fe50714199c5) | Sugerir cervejas do mesmo estilo | Pronto | P3 | 2 | E10 | `tipo:feature` `area:loja` `prio:p3` `frontend` |
| [LB-46](https://app.notion.com/p/3fd490a7ac7d81e99a85f2ccba401fd9) | Compartilhar cerveja com Web Share e preview Open Graph | Pronto | P2 | 2 | E10 | `tipo:feature` `area:marketing` `prio:p2` `frontend` |
| [LB-47](https://app.notion.com/p/3fd490a7ac7d81df9bc0d6332e64430c) | Persistir geladeira localmente e na conta | Pronto | P0 | 5 | E7 | `tipo:feature` `area:loja` `prio:p0` `frontend` `banco` |
| [LB-48](https://app.notion.com/p/3fd490a7ac7d8150b017f43a53be40e2) | Mesclar geladeira do convidado ao fazer login | Pronto | P1 | 3 | E7 | `tipo:feature` `area:loja` `prio:p1` `frontend` `backend` |
| [LB-49](https://app.notion.com/p/3fd490a7ac7d812eaddfc4fed1ed0477) | Exibir geladeira em prateleiras por estilo | Pronto | P0 | 8 | E7 | `tipo:feature` `area:design` `prio:p0` `frontend` |
| [LB-50](https://app.notion.com/p/3fd490a7ac7d811b9eb5e3d5bd355674) | Alterar quantidade e remover itens da geladeira | Pronto | P0 | 2 | E7 | `tipo:feature` `area:loja` `prio:p0` `frontend` |
| [LB-51](https://app.notion.com/p/3fd490a7ac7d81bb8f7ad07ebe13cb6b) | Exibir resumo da geladeira em bottom sheet | Pronto | P0 | 3 | E7 | `tipo:feature` `area:loja` `prio:p0` `frontend` |
| [LB-52](https://app.notion.com/p/3fd490a7ac7d81b8b533c5e288a43024) | Revalidar preço e estoque da geladeira no servidor | Pronto | P0 | 3 | E7 | `tipo:tecnica` `area:loja` `prio:p0` `backend` `banco` |
| [LB-53](https://app.notion.com/p/3fd490a7ac7d811181a8c8eff17da759) | Aplicar cupom de desconto na geladeira | Pronto | P2 | 3 | E7 | `tipo:feature` `area:checkout` `prio:p2` `frontend` `banco` |
| [LB-54](https://app.notion.com/p/3fd490a7ac7d810ebc04ebe7b354b1ce) | Comparar gateways gratuitos para Pix, cartão e assinatura | Pronto | P0 | 2 | E4 | `tipo:spike` `area:checkout` `prio:p0` `backend` |
| [LB-55](https://app.notion.com/p/3fd490a7ac7d8128a0c5c62279998c00) | Montar checkout em etapas no celular | Pronto | P0 | 5 | E4 | `tipo:feature` `area:checkout` `prio:p0` `frontend` |
| [LB-56](https://app.notion.com/p/3fd490a7ac7d81b6bb42f1a62de70670) | Criar pedido com reserva atômica de estoque | Pronto | P0 | 5 | E4 | `tipo:tecnica` `area:checkout` `prio:p0` `backend` `banco` |
| [LB-57](https://app.notion.com/p/3fd490a7ac7d81dd8e55ee63c71ba30d) | Pagar com Pix com QR Code e validade de 30 minutos | Pronto | P0 | 5 | E4 | `tipo:feature` `area:checkout` `prio:p0` `frontend` `backend` |
| [LB-58](https://app.notion.com/p/3fd490a7ac7d8116ad8de271ebbc26a7) | Pagar com cartão em até 12x com juros a partir da 3ª parcela | Pronto | P0 | 5 | E4 | `tipo:feature` `area:checkout` `prio:p0` `frontend` `backend` |
| [LB-59](https://app.notion.com/p/3fd490a7ac7d8160b1dac9761da75004) | Processar webhooks de pagamento de forma idempotente | Pronto | P0 | 5 | E4 | `tipo:tecnica` `area:checkout` `prio:p0` `backend` `banco` |
| [LB-60](https://app.notion.com/p/3fd490a7ac7d810ba5a1f05dd1683822) | Cancelar pedidos expirados e liberar o estoque | Pronto | P0 | 3 | E4 | `tipo:tecnica` `area:checkout` `prio:p0` `backend` `banco` |
| [LB-61](https://app.notion.com/p/3fd490a7ac7d81fb8dbbd75adec3634e) | Exibir tela de pedido confirmado | Pronto | P0 | 2 | E4 | `tipo:feature` `area:checkout` `prio:p0` `frontend` |
| [LB-62](https://app.notion.com/p/3fd490a7ac7d81f1a42cf61e835b74ca) | Pesquisar API gratuita de geocodificação e distância de rota | Pronto | P0 | 2 | E6 | `tipo:spike` `area:checkout` `prio:p0` `backend` |
| [LB-63](https://app.notion.com/p/3fd490a7ac7d8140a8a5da8a9f45d06e) | Calcular frete por distância até a cervejaria | Pronto | P0 | 5 | E6 | `tipo:feature` `area:checkout` `prio:p0` `backend` `banco` |
| [LB-64](https://app.notion.com/p/3fd490a7ac7d8150ab9ac5e2fd2cb86e) | Restringir a entrega a Maceió e região | Pronto | P0 | 2 | E6 | `tipo:feature` `area:checkout` `prio:p0` `backend` |
| [LB-65](https://app.notion.com/p/3fd490a7ac7d81a99300f101621322a2) | Estimar tempo de entrega com preparo e deslocamento | Pronto | P1 | 3 | E6 | `tipo:feature` `area:checkout` `prio:p1` `backend` `frontend` |
| [LB-66](https://app.notion.com/p/3fd490a7ac7d81c79dbaf3c28862f234) | Aplicar frete grátis acima de R$ 150 | Pronto | P0 | 1 | E6 | `tipo:feature` `area:checkout` `prio:p0` `backend` |
| [LB-67](https://app.notion.com/p/3fd490a7ac7d811e8403e328a31c2812) | Listar histórico de pedidos do cliente | Pronto | P0 | 3 | E16 | `tipo:feature` `area:loja` `prio:p0` `frontend` |
| [LB-68](https://app.notion.com/p/3fd490a7ac7d81ba9fa9d1833b1f653c) | Exibir detalhe do pedido com linha do tempo de status | Pronto | P0 | 3 | E16 | `tipo:feature` `area:loja` `prio:p0` `frontend` |
| [LB-69](https://app.notion.com/p/3fd490a7ac7d81ae8aadcdaaefcb9fc0) | Atualizar status do pedido em tempo real | Pronto | P1 | 3 | E16 | `tipo:feature` `area:loja` `prio:p1` `frontend` `backend` |
| [LB-70](https://app.notion.com/p/3fd490a7ac7d81348a28e9644a129ce4) | Comprar novamente um pedido anterior | Pronto | P2 | 2 | E16 | `tipo:feature` `area:loja` `prio:p2` `frontend` |
| [LB-71](https://app.notion.com/p/3fd490a7ac7d816995fadf14fc2ba203) | Abrir conversa no WhatsApp a partir do pedido | Pronto | P2 | 1 | E16 | `tipo:feature` `area:loja` `prio:p2` `frontend` |
| [LB-72](https://app.notion.com/p/3fd490a7ac7d815b85f5ed27a5c4424f) | Criar layout do painel admin protegido por papel | Pronto | P0 | 2 | E9 | `tipo:tecnica` `area:admin` `prio:p0` `frontend` `backend` |
| [LB-73](https://app.notion.com/p/3fd490a7ac7d81fc8984f1dbf6102d09) | Cadastrar e editar cervejas com fotos no admin | Pronto | P0 | 8 | E9 | `tipo:feature` `area:admin` `prio:p0` `frontend` `backend` |
| [LB-74](https://app.notion.com/p/3fd490a7ac7d8120af69c86b7dfe8891) | Gerenciar categorias de cerveja no admin | Pronto | P1 | 2 | E9 | `tipo:feature` `area:admin` `prio:p1` `frontend` |
| [LB-75](https://app.notion.com/p/3fd490a7ac7d811d80add7a71ecfc9cd) | Controlar estoque com alerta de estoque baixo | Pronto | P0 | 3 | E9 | `tipo:feature` `area:admin` `prio:p0` `frontend` `banco` |
| [LB-76](https://app.notion.com/p/3fd490a7ac7d811cb675e523a5f7e4e9) | Gerenciar pedidos e alterar status no admin | Pronto | P0 | 5 | E9 | `tipo:feature` `area:admin` `prio:p0` `frontend` `backend` |
| [LB-77](https://app.notion.com/p/3fd490a7ac7d81a8869fe1d4d0336836) | Configurar regras de entrega no admin | Pronto | P0 | 3 | E9 | `tipo:feature` `area:admin` `prio:p0` `frontend` |
| [LB-78](https://app.notion.com/p/3fd490a7ac7d8167b1a8d1a2bf966e30) | Exibir dashboard de vendas no admin | Pronto | P1 | 5 | E9 | `tipo:feature` `area:admin` `prio:p1` `frontend` `banco` |
| [LB-79](https://app.notion.com/p/3fd490a7ac7d817192a8c538a9ad4814) | Gerenciar banners da home no admin | Pronto | P2 | 3 | E9 | `tipo:feature` `area:admin` `prio:p2` `frontend` |
| [LB-80](https://app.notion.com/p/3fd490a7ac7d8138927dfd2dbeeab555) | Gerenciar cupons de desconto no admin | Pronto | P2 | 3 | E9 | `tipo:feature` `area:admin` `prio:p2` `frontend` |
| [LB-81](https://app.notion.com/p/3fd490a7ac7d810c89bce27827e3afa7) | Enviar e-mails transacionais do pedido | Pronto | P0 | 5 | E13 | `tipo:feature` `area:admin` `prio:p0` `backend` |
| [LB-82](https://app.notion.com/p/3fd490a7ac7d811e9b2bc27e08db1a4c) | Pesquisar envio gratuito de notificação por WhatsApp | Pronto | P1 | 2 | E13 | `tipo:spike` `area:admin` `prio:p1` `backend` |
| [LB-83](https://app.notion.com/p/3fd490a7ac7d816ab112f7df75154ccc) | Notificar o admin no WhatsApp a cada pedido pago | Pronto | P1 | 3 | E13 | `tipo:feature` `area:admin` `prio:p1` `backend` |
| [LB-84](https://app.notion.com/p/3fd490a7ac7d81d68849d7fc9f143434) | Gerar relatório mensal exportável para planilha | Pronto | P1 | 5 | E13 | `tipo:feature` `area:admin` `prio:p1` `backend` `banco` |
| [LB-85](https://app.notion.com/p/3fd490a7ac7d818ca3aef2cb4cb43abb) | Modelar packs do Mix & Match com preço especial | Pronto | P1 | 3 | E15 | `tipo:tecnica` `area:loja` `prio:p1` `banco` `backend` |
| [LB-86](https://app.notion.com/p/3fd490a7ac7d8178965cf20020591eb2) | Escolher o tamanho do pack de 3, 6 ou 12 | Pronto | P1 | 2 | E15 | `tipo:feature` `area:loja` `prio:p1` `frontend` |
| [LB-87](https://app.notion.com/p/3fd490a7ac7d819f8331dcdbb8093913) | Montar pack misturando estilos com vagas visuais | Pronto | P1 | 5 | E15 | `tipo:feature` `area:loja` `prio:p1` `frontend` |
| [LB-88](https://app.notion.com/p/3fd490a7ac7d8167a974e35520ca2a59) | Mostrar preço especial do pack em tempo real | Pronto | P1 | 2 | E15 | `tipo:feature` `area:loja` `prio:p1` `frontend` |
| [LB-89](https://app.notion.com/p/3fd490a7ac7d8123aa7de82cce645b2a) | Oferecer combinações sugeridas de packs | Pronto | P1 | 3 | E15 | `tipo:feature` `area:loja` `prio:p1` `frontend` |
| [LB-90](https://app.notion.com/p/3fd490a7ac7d8120b401c0ebb3a9bea5) | Adicionar embalagem de presente com custo extra e mensagem | Pronto | P2 | 3 | E15 | `tipo:feature` `area:loja` `prio:p2` `frontend` `banco` |
| [LB-91](https://app.notion.com/p/3fd490a7ac7d814b8e1ae776a218bfe3) | Configurar packs, combinações e embalagem no admin | Pronto | P1 | 5 | E15 | `tipo:feature` `area:admin` `prio:p1` `frontend` |
| [LB-92](https://app.notion.com/p/3fd490a7ac7d8111899adb8e8ef59f6b) | Modelar planos, assinaturas e ciclos do Clube | Pronto | P1 | 5 | E14 | `tipo:tecnica` `area:loja` `prio:p1` `banco` `backend` |
| [LB-93](https://app.notion.com/p/3fd490a7ac7d8161ae78d896b8cb22f9) | Exibir os planos do Clube do Leguelé | Pronto | P1 | 3 | E14 | `tipo:feature` `area:loja` `prio:p1` `frontend` |
| [LB-94](https://app.notion.com/p/3fd490a7ac7d81a29873edd5f3ee708b) | Exibir detalhes e vantagens de cada plano | Backlog | P1 | 2 | E14 | `tipo:feature` `area:loja` `prio:p1` `frontend` |
| [LB-95](https://app.notion.com/p/3fd490a7ac7d81d98fbecd9bf152a403) | Assinar plano do Clube com cobrança recorrente | Pronto | P1 | 8 | E14 | `tipo:feature` `area:checkout` `prio:p1` `frontend` `backend` |
| [LB-96](https://app.notion.com/p/3fd490a7ac7d819fb39cfbdc9d652f78) | Pausar, pular mês, trocar de plano ou cancelar a assinatura | Pronto | P1 | 5 | E14 | `tipo:feature` `area:loja` `prio:p1` `frontend` `backend` |
| [LB-97](https://app.notion.com/p/3fd490a7ac7d8148880af62941b58f63) | Definir a curadoria mensal e gerar os envios dos assinantes | Pronto | P1 | 5 | E14 | `tipo:feature` `area:admin` `prio:p1` `frontend` `backend` `banco` |
| [LB-98](https://app.notion.com/p/3fd490a7ac7d81ebb95ef4ba481310bb) | Tratar falha de cobrança da assinatura com retentativas | Pronto | P1 | 3 | E14 | `tipo:feature` `area:checkout` `prio:p1` `backend` |
| [LB-99](https://app.notion.com/p/3fd490a7ac7d81f895aad6970d902085) | Aplicar desconto de assinante em todo o site | Backlog | P1 | 2 | E14 | `tipo:feature` `area:checkout` `prio:p1` `backend` |
| [LB-100](https://app.notion.com/p/3fd490a7ac7d817ba2acfde7cb90eb7c) | Exibir a edição do mês e o histórico de envios ao assinante | Pronto | P2 | 3 | E14 | `tipo:feature` `area:loja` `prio:p2` `frontend` |
| [LB-101](https://app.notion.com/p/3fd490a7ac7d8127a2b7c1b66ceb6c69) | Promover cerveja sazonal do Clube para o catálogo | Pronto | P3 | 1 | E14 | `tipo:feature` `area:admin` `prio:p3` `frontend` |
| [LB-102](https://app.notion.com/p/3fd490a7ac7d81d39572e6409d810046) | Liberar conteúdo exclusivo e lançamentos antecipados para assinantes | Backlog | P3 | 3 | E14 | `tipo:feature` `area:loja` `prio:p3` `frontend` `banco` |
| [LB-103](https://app.notion.com/p/3fd490a7ac7d81509f25db3668c9c217) | Favoritar cervejas e ver a lista de favoritos | Pronto | P2 | 3 | E18 | `tipo:feature` `area:loja` `prio:p2` `frontend` `banco` |
| [LB-104](https://app.notion.com/p/3fd490a7ac7d81fa84d8c842608a0ad1) | Avaliar cervejas compradas com nota e comentário | Pronto | P2 | 3 | E18 | `tipo:feature` `area:loja` `prio:p2` `frontend` `banco` |
| [LB-105](https://app.notion.com/p/3fd490a7ac7d81778c8ff0f244e63665) | Moderar avaliações no admin | Pronto | P3 | 2 | E18 | `tipo:feature` `area:admin` `prio:p3` `frontend` |
| [LB-106](https://app.notion.com/p/3fd490a7ac7d817db5caeee3226cd105) | Configurar metadados, sitemap e dados estruturados | Pronto | P1 | 3 | E17 | `tipo:feature` `area:marketing` `prio:p1` `frontend` |
| [LB-107](https://app.notion.com/p/3fd490a7ac7d81658d90ead8e732e030) | Tornar o site instalável como PWA com cache offline | Pronto | P1 | 5 | E17 | `tipo:feature` `area:infra` `prio:p1` `frontend` |
| [LB-108](https://app.notion.com/p/3fd490a7ac7d81698cc1da60b27b8f24) | Otimizar imagens e Core Web Vitals no celular | Pronto | P1 | 3 | E17 | `tipo:refactor` `area:qualidade` `prio:p1` `frontend` |
| [LB-109](https://app.notion.com/p/3fd490a7ac7d81ce8149eecd287a91f2) | Instrumentar o funil de conversão com analytics | Pronto | P2 | 2 | E17 | `tipo:feature` `area:marketing` `prio:p2` `frontend` |
| [LB-110](https://app.notion.com/p/3fd490a7ac7d81dd98edcf218129ec03) | Criar página Sobre a cervejaria | Pronto | P3 | 2 | E17 | `tipo:feature` `area:marketing` `prio:p3` `frontend` |
| [LB-111](https://app.notion.com/p/3fd490a7ac7d8183aaf6c79707f689c3) | Revisar autorização, validação e acesso ao banco | Pronto | P0 | 3 | E11 | `tipo:teste` `area:seguranca` `prio:p0` `backend` `banco` |
| [LB-112](https://app.notion.com/p/3fd490a7ac7d81f5bee1ef1b4055b50d) | Cobrir o fluxo de compra completo com testes E2E | Pronto | P0 | 5 | E11 | `tipo:teste` `area:qualidade` `prio:p0` `frontend` |
| [LB-113](https://app.notion.com/p/3fd490a7ac7d81d08bf0c8ebe8154969) | Auditar acessibilidade das telas principais | Pronto | P1 | 3 | E11 | `tipo:teste` `area:qualidade` `prio:p1` `frontend` |
| [LB-114](https://app.notion.com/p/3fd490a7ac7d81459034e6b3d08259cb) | Monitorar erros em produção com Sentry | Pronto | P2 | 1 | E11 | `tipo:tecnica` `area:infra` `prio:p2` `infra` |
| [LB-115](https://app.notion.com/p/3fd490a7ac7d8148898dfa132676f2bf) | Preparar README de portfólio com prints, GIF e decisões | Pronto | P1 | 3 | E11 | `tipo:tecnica` `area:marketing` `prio:p1` `docs` |
| [LB-116](https://app.notion.com/p/3fd490a7ac7d81a98c69e74f58edd3ad) | Criar dados de demonstração e conta de teste para recrutadores | Pronto | P1 | 2 | E11 | `tipo:tecnica` `area:marketing` `prio:p1` `banco` |
| [LB-117](https://app.notion.com/p/3fd490a7ac7d81c4978df45985ecce6b) | Criar API NestJS com validação, erros padronizados e Swagger | Pronto | P0 | 5 | E1 | `tipo:tecnica` `area:infra` `prio:p0` `backend` |
| [LB-118](https://app.notion.com/p/3fd490a7ac7d8170828bf1a12b37a404) | Definir arquitetura em camadas e template de módulo da API | Pronto | P0 | 3 | E1 | `tipo:tecnica` `area:qualidade` `prio:p0` `backend` `docs` |
| [LB-119](https://app.notion.com/p/3fd490a7ac7d819d80f6f048f08cfd42) | Configurar testes da API com Jest, Supertest e Testcontainers | Pronto | P0 | 3 | E1 | `tipo:teste` `area:qualidade` `prio:p0` `backend` `banco` |
| [LB-120](https://app.notion.com/p/3fd490a7ac7d81debc2be710474791d7) | Criar pacote compartilhado de schemas e cliente tipado da API | Pronto | P0 | 3 | E1 | `tipo:tecnica` `area:infra` `prio:p0` `frontend` `backend` |
| [LB-121](https://app.notion.com/p/3fd490a7ac7d81098f0ecd9094ae8840) | Pesquisar hospedagem gratuita para a API NestJS | Pronto | P0 | 2 | E1 | `tipo:spike` `area:infra` `prio:p0` `infra` |
| [LB-122](https://app.notion.com/p/3fd490a7ac7d8130ad3edb5e07116336) | Publicar a API em produção com deploy automático | Pronto | P0 | 3 | E1 | `tipo:tecnica` `area:infra` `prio:p0` `infra` `backend` |
| [LB-123](https://app.notion.com/p/3fd490a7ac7d81099f0ace27529104a4) | Configurar filas e agendamentos com BullMQ e @nestjs/schedule | Pronto | P1 | 3 | E1 | `tipo:tecnica` `area:infra` `prio:p1` `backend` `infra` |
| [LB-124](https://app.notion.com/p/3fe490a7ac7d816ebf46ea7bb950dddb) | Gerar imagens recortadas das garrafas para a geladeira | Pronto | P0 | 3 | E7 | `tipo:tecnica` `area:design` `prio:p0` `frontend` |

## Estimativa de esforço da migração

| Etapa | Manual | Com script (`gh` + API do Notion) |
| --- | --- | --- |
| Criar ~25 labels e um GitHub Project com colunas e campo "Pontos" | 30–45 min | 15 min |
| Criar 18 épicos e 124 tickets com título, labels e vínculo de sub-issue | 6–8 h | 2–3 h (escrever e testar o script) + minutos para rodar |
| Copiar o conteúdo de cada página (BDD, plano de testes, subtarefas, DoD) para o corpo | 8–12 h (~5 min por card) | 2–4 h (converter o Markdown do Notion e revisar por amostragem) |
| Revisão final e ajuste de links entre cards (dependências citadas no texto) | 2–3 h | 1–2 h |
| **Total aproximado** | **2 a 3 dias de trabalho** | **~1 dia** |

> [!warning] Pontos de atenção
> - As páginas do Notion usam callouts, colunas e toggles, que não existem no Markdown do GitHub e precisariam ser achatados.
> - Menções entre páginas do Notion (épicos, dependências) não viram links automaticamente; o script teria de mapear página do Notion → número da issue.
> - Os números de issue do GitHub não vão coincidir com os códigos LB-NN; por isso o prefixo no título.
> - Manter os dois sistemas em paralelo duplica o trabalho de atualização de status.

> [!success] Decidido em 2026-10-28: GitHub Issues é o tracker do MVP e o Notion fica como banco de ideias do Pós-MVP. O corte está em [[mvp-corte]] e a migração para o GitHub Issues foi feita em 2026-10-28.
