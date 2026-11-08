import { describe, expect, it } from "vitest";
import * as shared from "./index.js";

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
});
