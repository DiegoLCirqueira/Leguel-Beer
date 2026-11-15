import { describe, expect, it } from "vitest";
import { pedidoCriadoSchema } from "./resposta.js";

const pedido = {
  id: "0e8e5d9c-3c55-4c64-8b1f-6e8a2f6b7a10",
  numero: "#LB482731",
  status: "aguardando-pagamento",
  criadoEm: "2026-11-13T10:00:00.000Z",
  validoAte: "2026-11-13T10:30:00.000Z",
  pagamento: { tipo: "cartao", parcelas: 3, bandeira: "visa" },
  itens: [
    { cervejaId: "mare-alta", nome: "Maré Alta", precoCentavos: 3200, quantidade: 3 },
    { cervejaId: "cupuacu-ale", nome: "Cupuaçu Ale", precoCentavos: 2650, quantidade: 2 },
  ],
  subtotalCentavos: 14_900,
  freteCentavos: 1_300,
  totalCentavos: 16_200,
};

describe("pedidoCriadoSchema", () => {
  it("aceita o pedido criado", () => {
    expect(pedidoCriadoSchema.parse(pedido)).toEqual(pedido);
  });

  it("aceita Pix, sem parcelas", () => {
    expect(pedidoCriadoSchema.safeParse({ ...pedido, pagamento: { tipo: "pix" } }).success).toBe(
      true,
    );
  });

  it("nunca ecoa o token do cartão", () => {
    const resultado = pedidoCriadoSchema.parse({
      ...pedido,
      pagamento: { ...pedido.pagamento, token: "tok_secreto" },
    });

    expect(JSON.stringify(resultado)).not.toContain("tok_secreto");
  });

  it.each([
    ["subtotal diferente dos itens", { subtotalCentavos: 14_800 }],
    ["total diferente de subtotal mais frete", { totalCentavos: 16_000 }],
    ["número fora do padrão", { numero: "LB482731" }],
    ["sem itens", { itens: [], subtotalCentavos: 0, totalCentavos: 1_300 }],
    ["validade antes da criação", { validoAte: "2026-11-13T09:00:00.000Z" }],
    ["validade fora dos 30 minutos", { validoAte: "2026-11-13T10:31:00.000Z" }],
  ])("recusa %s", (_nome, mudanca) => {
    expect(pedidoCriadoSchema.safeParse({ ...pedido, ...mudanca }).success).toBe(false);
  });
});
