import { describe, expect, it } from "vitest";
import { CODIGOS_DE_ERRO_DO_PEDIDO, erroDoPedidoSchema } from "./erros.js";

describe("erros de criar o pedido", () => {
  it("lista os códigos da spec", () => {
    expect([...CODIGOS_DE_ERRO_DO_PEDIDO].sort()).toEqual([
      "BIRTH_DATE_REQUIRED",
      "EMPTY_FRIDGE",
      "IDEMPOTENCY_KEY_REUSED",
      "OUT_OF_DELIVERY_AREA",
      "OUT_OF_STOCK",
      "PENDING_ORDER",
      "TOTAL_CHANGED",
      "UNDERAGE",
    ]);
  });

  it.each([
    "UNDERAGE",
    "BIRTH_DATE_REQUIRED",
    "OUT_OF_DELIVERY_AREA",
    "EMPTY_FRIDGE",
    "IDEMPOTENCY_KEY_REUSED",
  ])("%s leva só code e message", (code) => {
    const corpo = { code, message: "texto" };

    expect(erroDoPedidoSchema.parse(corpo)).toEqual(corpo);
  });

  it("PENDING_ORDER traz o id do pedido pendente", () => {
    const corpo = { code: "PENDING_ORDER", message: "m", pedidoId: "p1" };

    expect(erroDoPedidoSchema.parse(corpo)).toEqual(corpo);
    expect(erroDoPedidoSchema.safeParse({ code: "PENDING_ORDER", message: "m" }).success).toBe(
      false,
    );
  });

  it("TOTAL_CHANGED traz os avisos da revalidação e o total novo", () => {
    const corpo = {
      code: "TOTAL_CHANGED",
      message: "m",
      ajustes: [
        {
          tipo: "preco-mudou",
          cervejaId: "mare-alta",
          nome: "Maré Alta",
          precoVistoCentavos: 3200,
          precoAtualCentavos: 3400,
        },
      ],
      totalAtualCentavos: 16_600,
    };

    expect(erroDoPedidoSchema.parse(corpo)).toEqual(corpo);
    expect(erroDoPedidoSchema.safeParse({ ...corpo, totalAtualCentavos: undefined }).success).toBe(
      false,
    );
  });

  it("OUT_OF_STOCK traz as cervejas que faltam e os avisos", () => {
    const corpo = {
      code: "OUT_OF_STOCK",
      message: "m",
      cervejas: [{ cervejaId: "mare-alta", nome: "Maré Alta" }],
      ajustes: [],
    };

    expect(erroDoPedidoSchema.parse(corpo)).toEqual(corpo);
    expect(erroDoPedidoSchema.safeParse({ ...corpo, cervejas: [] }).success).toBe(false);
  });

  it("recusa um código desconhecido", () => {
    expect(erroDoPedidoSchema.safeParse({ code: "OUTRO", message: "m" }).success).toBe(false);
  });
});
