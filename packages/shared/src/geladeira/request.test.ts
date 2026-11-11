import { describe, expect, it } from "vitest";
import { geladeiraRequestSchema } from "./request.js";

const item = (cervejaId: string) => ({ cervejaId, quantidade: 1, precoVistoCentavos: 3200 });

describe("geladeiraRequestSchema", () => {
  it("aceita os itens na ordem em que as cervejas entraram", () => {
    const corpo = { itens: [item("c"), item("a"), item("b")] };

    expect(geladeiraRequestSchema.parse(corpo).itens.map((i) => i.cervejaId)).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("aceita a Geladeira vazia", () => {
    expect(geladeiraRequestSchema.parse({ itens: [] })).toEqual({ itens: [] });
  });
});
