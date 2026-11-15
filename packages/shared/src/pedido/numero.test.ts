import { describe, expect, it } from "vitest";
import { numeroDoPedidoSchema } from "./numero.js";

describe("número do pedido", () => {
  it("aceita #LB seguido de 6 dígitos", () => {
    expect(numeroDoPedidoSchema.parse("#LB482731")).toBe("#LB482731");
  });

  it.each(["LB482731", "#LB48273", "#LB4827311", "#lb482731", "#LB48273a", ""])(
    "recusa %j",
    (entrada) => {
      expect(numeroDoPedidoSchema.safeParse(entrada).success).toBe(false);
    },
  );
});
