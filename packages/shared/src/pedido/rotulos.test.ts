import { describe, expect, it } from "vitest";
import { ROTULO_DO_STATUS, textoDasCervejas, textoDeItens } from "./rotulos.js";

describe("rótulos do pedido", () => {
  it("dá o rótulo de cada status como o cliente e o admin o veem", () => {
    expect(ROTULO_DO_STATUS).toEqual({
      "aguardando-pagamento": "Aguardando pagamento",
      pago: "Pago",
      "em-preparo": "Em preparo",
      "saiu-para-entrega": "Saiu para entrega",
      entregue: "Entregue",
      cancelado: "Cancelado",
    });
  });

  it("escreve a quantidade de itens no singular e no plural", () => {
    expect(textoDeItens(1)).toBe("1 item");
    expect(textoDeItens(5)).toBe("5 itens");
  });

  it("lista até duas cervejas e resume o resto com 'e mais N'", () => {
    expect(textoDasCervejas(["Maré Alta"])).toBe("Maré Alta");
    expect(textoDasCervejas(["Maré Alta", "Ponta Verde"])).toBe("Maré Alta, Ponta Verde");
    expect(textoDasCervejas(["Maré Alta", "Ponta Verde", "Jaraguá"])).toBe(
      "Maré Alta, Ponta Verde e mais 1",
    );
    expect(textoDasCervejas(["A", "B", "C", "D", "E"])).toBe("A, B e mais 3");
  });
});
