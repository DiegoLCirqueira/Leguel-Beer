import { describe, expect, it } from "vitest";
import { ajusteDaGeladeiraSchema } from "./ajuste.js";

describe("ajusteDaGeladeiraSchema", () => {
  it("aceita o ajuste de preço que mudou, com o preço visto e o atual", () => {
    const ajuste = {
      tipo: "preco-mudou",
      cervejaId: "cerveja-1",
      nome: "Maré Alta",
      precoVistoCentavos: 3200,
      precoAtualCentavos: 3000,
    };

    expect(ajusteDaGeladeiraSchema.parse(ajuste)).toEqual(ajuste);
  });
});
