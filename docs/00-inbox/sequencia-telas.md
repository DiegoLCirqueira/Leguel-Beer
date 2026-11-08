---
tipo: planejamento
criado: 2026-11-08
atualizado: 2026-11-08
tags: [planejamento, telas]
---

# Sequência de implementação das telas

Ordem das telas no [[ADR-016-ciclo-continuo-da-banda|ciclo contínuo da banda]], copiada do cartão "🧭 Ordem de implementação" do canvas do Maestri (revisado pelo Orchestrator em 08/11). Pré-revisão do Codex sobre as telas 16 a 30 e o estúdio; validação com o Front em seguida. Segue o [[roteiro-mvp]] (caminho de compra primeiro).

1. **Catálogo e início** (grupo B: LB-4, 13, 14, 15, 33, 36, 34), telas 16, 25, 26, 27: [[catalogo]], [[destaques-home]].
2. **Página de produto** (grupo D: LB-40, 41), tela 28.
3. **Geladeira** no estúdio de garrafas e resumo em gaveta (grupo C: LB-124, 47, 49, 50, 51, 52, 35; depois LB-42), estudio-garrafas e tela 24: [[geladeira]], [[adicionar-do-card]].
4. **Conta e entrega**: dados pessoais, endereços, área de entrega (grupos E e F: LB-29, 62, 30, 31, 20, 63, 64, 66), telas 19, 20, 29.
5. **Checkout**: spike do Mercado Pago (LB-54) e depois LB-55, 56, 38, telas 05 a 07: [[checkout]].
6. **Pagamento**: Pix e cartão (LB-57 a 60), telas 17, 18, 30.
7. **Pedido confirmado e histórico** (LB-61, 67; o e-mail LB-81 depende de provedor), telas 08 e 13. A tela 09 (Acompanhar pedido) fica fora do item 7: é referência visual adiada, porque o detalhe com linha do tempo (LB-68) está no MVP+ e o tempo real (LB-69) no Pós-MVP ([[mvp-corte]]).
8. **Admin** (grupo I: LB-72, 73, 75, 76, 77), telas 21, 22, 23.
9. **Qualidade** (LB-111, 112): segurança e E2E da compra.

## Item 1: ordem e decisões do Front

Detalhes em "Contrato e fatias" de [[catalogo]].

- Ordem do Front: LB-15 (cabeçalho com contador por prop e barra inferior de 4 abas, layout compartilhado da loja), LB-14 (bottom sheet, toast, skeleton), LB-13 (card com variante esgotada e stepper), LB-33 (chips), LB-36 (filtros e ordem), LB-34 (destaques). O LB-4 do Back anda em paralelo, antes do card com dado real.
- Adicionar desabilitado até o LB-47 e o LB-35: o Adicionar ativa no item 3. Busca (LB-37) e "Mais vendidos" ficam fora.
- Selo "Esgotado" com tokens existentes; rodapé da loja no fim da rolagem, acima da barra inferior fixa; bottom sheet rola por dentro em tela baixa ou zoom de 200% e fecha com Esc.
- Componentes novos em `components/ui`, com vitrine em `/dev/tokens`: cabeçalho da loja, barra inferior, card, stepper, bottom sheet, toast com "Desfazer", skeleton, select, faixa, switch, estado vazio, título de página e selo "Esgotado".

## Regra da revisão

O design é referência visual; regra de negócio e textos vêm das specs. Tudo é normalizado ao padrão aprovado (Figtree e Kaushan Script, tokens do `globals.css`, `Button`, `Campo`, `StyleBadge`, `CategoryChips`, alvos de 44 px). Não copiar barra de status do iPhone, "Mix & Match", "Carrinho" (o termo é Geladeira), favoritos, avaliações, abas nem cupom.

## Divergências do design que seguem a spec

Recomendação aplicada, vetável pelo Diego.

- 17 e 18: parcelas e "sem juros" conforme [[checkout]] (não 3x e 6x do design); frete grátis só acima de R$ 150.
- 18 e 30: o QR só aparece depois de confirmar o pedido; Pix aguardando e expirado são estados alternativos.
- 22: preço promocional maior que o preço está invertido no design.
- 23: taxa de entrega por distância (não fixa de 12,90), cidade Maceió (não Belém).
- 27: sem destaques, a seção some (não vira tela vazia).
- 28: o desconto mostrado é calculado (32 de 36,90 = 13%).
- 29: texto "Ainda não entregamos neste endereço" e botão primário verde.
