import { describe, expect, it } from "vitest";
import { catalogoQuerySchema } from "./query.js";

describe("catalogoQuerySchema", () => {
  it("sem parâmetros abre o catálogo por relevância e com todas as cervejas", () => {
    expect(catalogoQuerySchema.parse({})).toEqual({ ordem: "relevancia", disponiveis: false });
  });
});
