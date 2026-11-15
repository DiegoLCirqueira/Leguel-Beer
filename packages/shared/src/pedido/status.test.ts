import { describe, expect, it } from "vitest";
import { STATUS_DO_PEDIDO, statusDoPedidoSchema } from "./status.js";

describe("status do pedido", () => {
  it("lista os status na ordem do fluxo", () => {
    expect(STATUS_DO_PEDIDO).toEqual([
      "aguardando-pagamento",
      "pago",
      "em-preparo",
      "saiu-para-entrega",
      "entregue",
      "cancelado",
    ]);
  });

  it("recusa um status desconhecido", () => {
    expect(statusDoPedidoSchema.safeParse("reembolsado").success).toBe(false);
    expect(statusDoPedidoSchema.parse("pago")).toBe("pago");
  });
});
