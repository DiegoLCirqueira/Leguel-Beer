---
tags: [spike, entrega]
criado: 2026-11-13
---

# Spike LB-62: geocodificação e rota

Spec: [[enderecos-entrega]] (fatia 1). Pergunta: qual serviço gratuito, sem cartão, transforma endereços de Maceió em coordenadas e dá a distância de rota de carro.

## Resultado

**Recomendação: Geoapify (plano Free) para geocodificação e rota**, atrás de duas portas da API (geocodificador e roteador), para trocar de serviço sem mexer nos casos de uso. **Linha reta não é necessária**: há rota gratuita. Falta só a conta e a chave (ver "Pendências").

## Candidatos, pelos termos publicados (lidos em 13/11)

| Serviço | Limite gratuito | Cartão | Produção comercial | Armazenar resultado | Veredito |
| --- | --- | --- | --- | --- | --- |
| **Geoapify Free** | 3.000 créditos/dia (1 crédito por geocodificação ou rota), 5 req/s | "No credit card required" | Permitido: "commercial websites, apps ... including in production" (a ToS de 02/2024 diz "com algumas limitações") | Os termos não dizem nada | **Escolhido** |
| Nominatim público (OSMF) | 1 req/s | sem conta | Não é para servir clientes pagantes; "Do not submit personal data" | Exige cache | Descartado (política e dados pessoais) |
| OSRM demo | 1 req/s | sem conta | "restricted to reasonable, non-commercial use-cases", sem garantia | não diz | Descartado |
| LocationIQ Free | 5.000 req/dia, 2 req/s | não informado | "Limited Commercial Use" com link | Só cache de até 48 h no Free | Descartado: guardamos as coordenadas no endereço |
| OpenRouteService | 2.000 rotas/dia (fontes secundárias; a página oficial não carregou) | não confirmado | não confirmado | não confirmado | Reserva; não verificado |

## Precisão: rota × linha reta

Medido com dados do OpenStreetMap (a mesma base do Geoapify): geocodificação do Nominatim e rota do OSRM público, só com bairros e cidades (sem endereço de cliente), a partir de Jaraguá (origem fictícia sugerida pela spec). O Geoapify em si não foi medido, por falta de chave (ver "Pendências"); a estimativa vale para a rota de carro sobre OSM.

| Destino | Reta | Rota | Rota ÷ reta |
| --- | --- | --- | --- |
| Pajuçara | 0,7 km | 1,4 km | 2,06 |
| Farol | 2,5 km | 5,0 km | 1,96 |
| Ponta Verde | 2,5 km | 3,2 km | 1,27 |
| Mangabeiras | 2,8 km | 3,4 km | 1,22 |
| Jatiúca | 3,0 km | 4,2 km | 1,43 |
| Cruz das Almas | 4,9 km | 6,7 km | 1,38 |
| Gruta de Lourdes | 5,6 km | 6,9 km | 1,23 |
| Tabuleiro do Martins | 8,9 km | 10,0 km | 1,11 |
| Benedito Bentes | 12,7 km | 19,0 km | 1,50 |
| Satuba | 15,6 km | 20,8 km | 1,33 |
| Marechal Deodoro | 19,5 km | 29,4 km | 1,51 |
| Rio Largo | 24,9 km | 29,0 km | 1,17 |

Leitura: a rota é de 1,1 a 2,1 vezes a reta. Em linha reta, **Rio Largo (24,9 km) e Marechal Deodoro (19,5 km) entrariam na área de 25 km**, mas pela rota (29 km) ficam fora; o frete também sai mais barato do que deveria. Por isso a rota vale o trabalho e a linha reta fica só como plano B por configuração. Latência do roteador de teste: cerca de 240 ms.

## Minimização de dados (critério de aceite)

- **CEP:** só o CEP vai ao serviço de CEP (adaptador separado, fora deste spike).
- **Geocodificação:** texto livre "rua, número, bairro, cidade, UF, CEP". Sem nome, e-mail, telefone, nascimento, id, token, apelido nem complemento.
- **Rota:** só as coordenadas de origem (a cervejaria) e de destino.
- **Chave de API:** vai na consulta (o serviço a exige); por isso o adaptador nunca registra a URL da requisição. Logs: só código de resultado e tempo, nunca endereço, coordenadas ou URL.
- **Testes red dos adaptadores:** capturam a requisição enviada (URL, corpo, cabeçalhos) e os logs e falham se aparecer qualquer campo fora dessa lista.

## Termos, retenção e transferência (Geoapify)

- Hospedagem em data centers da UE (Hetzner); CDN e segurança por Cloudflare. Dados da requisição (corpo, cabeçalhos, IP, horário): guardados por no máximo 24 h nas requisições bem-sucedidas. Dados de contas cadastradas ficam no Google Firebase (afeta só o cadastro da nossa conta no serviço, não os dados dos clientes). Lei aplicável: Chipre. DPA sob pedido.
- Transferência internacional: sim (UE, e Cloudflare). A Política já diz que os serviços de mapas recebem o endereço ([[termos-privacidade]]); o texto não nomeia os serviços nem diz que ficam fora do Brasil. **Se o Diego quiser nomear o serviço ou citar a transferência, é decisão dele (pergunta 3 mantida: sem novo aceite).**
- **Atribuição obrigatória no Free:** "Powered by Geoapify" e a atribuição do OpenStreetMap em lugar visível do site. É texto de marca: decisão do Diego (e do Front, onde aparece; sugestão: rodapé de "Entregas" ou do formulário de endereço).
- **Guardar as coordenadas no endereço** (a spec exige): os termos não proíbem nem permitem de forma expressa. Risco baixo; a recomendação é pedir confirmação por escrito ao suporte do Geoapify antes de produção, e o plano B é regeocodificar (a porta permite).
- Cotas "soft" (3.000/dia): cada endereço salvo gasta 2 créditos (geocodificar + rota) e cada recálculo por mudança de origem, 1. Folga ampla no MVP.

## Contrato proposto para as portas (fatias 3 e 4)

- `geocodificar(endereco) → { lat, lon } | NAO_ENCONTRADO`
- `rota(origem, destino) → { distanciaMetros } | SEM_ROTA`
- Erro ou mais de 8 s: exceção `MapsUnavailable` → 503 `MAPS_UNAVAILABLE`.
- Adaptadores testados com respostas gravadas (sucesso, não encontrado, sem rota, erro, tempo esgotado), sem rede no CI.

## Pendências

1. **Conta e chave Geoapify (plano Free, sem cartão)**: autorizada pela pergunta 11, mas o cadastro pede um e-mail e não usei o do Diego sem perguntar. Quem for criar usa um e-mail do projeto; a chave vai só no `.env` da API (`GEOAPIFY_API_KEY`, sem valor no `.env.example`). Com a chave, rodar a mesma tabela no Geoapify antes do green dos adaptadores.
2. Atribuição "Powered by Geoapify" e OSM no site (Diego e Front).
3. Confirmar por escrito com o Geoapify o armazenamento das coordenadas (baixo risco).
