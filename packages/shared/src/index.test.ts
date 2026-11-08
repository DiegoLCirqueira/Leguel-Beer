import { describe, expect, expectTypeOf, it } from "vitest";
import * as shared from "./index.js";
import type {
  CatalogoQuery,
  CategoriaComContador,
  CervejaDetalhe,
  OrdemDoCatalogo,
} from "./index.js";

describe("API pública de @leguele/shared", () => {
  it("exporta os schemas do acesso e do catálogo, o erro de API e as regras puras", () => {
    expect(Object.keys(shared)).toEqual(
      expect.arrayContaining([
        "formatPriceBRL",
        "ApiError",
        "apiErrorBodySchema",
        "cadastroFormSchema",
        "catalogoQuerySchema",
        "calcularDesconto",
        "catalogoResponseSchema",
        "cervejaCardSchema",
        "cervejaDetalheSchema",
        "criarPerfilRequestSchema",
        "destaquesResponseSchema",
        "emailSchema",
        "estoqueBaixo",
        "faixasDeFiltro",
        "LIMIAR_ESTOQUE_BAIXO",
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
    expectTypeOf<CervejaDetalhe["descontoPercentual"]>().toEqualTypeOf<number | null>();
    expectTypeOf<CategoriaComContador>().toEqualTypeOf<{
      slug: string;
      nome: string;
      ordem: number;
      quantidade: number;
    }>();
  });
});
