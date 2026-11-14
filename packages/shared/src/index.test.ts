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

  it("exporta o contrato da Geladeira: schemas, limites e o resumo", () => {
    expect(Object.keys(shared)).toEqual(
      expect.arrayContaining([
        "QUANTIDADE_MAXIMA_POR_ITEM",
        "ITENS_MAXIMOS_NA_GELADEIRA",
        "itemDaGeladeiraSchema",
        "geladeiraRequestSchema",
        "ajusteDaGeladeiraSchema",
        "itemValidadoSchema",
        "geladeiraResponseSchema",
        "resumirGeladeira",
      ]),
    );
  });

  it("exporta o contrato de endereços e entrega: CEP, formulário, limite e frete", () => {
    expect(Object.keys(shared)).toEqual(
      expect.arrayContaining([
        "cepSchema",
        "enderecoFormSchema",
        "LIMITE_DE_ENDERECOS",
        "calcularFrete",
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
