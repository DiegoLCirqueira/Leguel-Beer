import { describe, expect, expectTypeOf, it } from "vitest";
import * as shared from "./index.js";
import type { CatalogoQuery, CategoriaComContador, OrdemDoCatalogo } from "./index.js";

describe("API pública de @leguele/shared", () => {
  it("exporta os schemas do acesso e do catálogo, o erro de API e as regras puras", () => {
    expect(Object.keys(shared)).toEqual(
      expect.arrayContaining([
        "formatPriceBRL",
        "ApiError",
        "apiErrorBodySchema",
        "cadastroFormSchema",
        "catalogoQuerySchema",
        "catalogoResponseSchema",
        "cervejaCardSchema",
        "criarPerfilRequestSchema",
        "destaquesResponseSchema",
        "emailSchema",
        "faixasDeFiltro",
        "entrarSchema",
        "nomeCompletoSchema",
        "novaSenhaSchema",
        "perfilResponseSchema",
        "pertenceAFaixa",
        "recuperarSenhaSchema",
        "senhaSchema",
        "telefoneSchema",
      ]),
    );
  });

  it("exporta os tipos do contrato do catálogo", () => {
    expectTypeOf<OrdemDoCatalogo>().toEqualTypeOf<
      "relevancia" | "menor-preco" | "maior-preco" | "mais-novas"
    >();
    expectTypeOf<CatalogoQuery["ordem"]>().toEqualTypeOf<OrdemDoCatalogo>();
    expectTypeOf<CategoriaComContador>().toEqualTypeOf<{
      slug: string;
      nome: string;
      ordem: number;
      quantidade: number;
    }>();
  });
});
