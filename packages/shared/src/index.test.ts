import { describe, expect, it } from "vitest";
import * as shared from "./index.js";

describe("API pública de @leguele/shared", () => {
  it("exporta os schemas do acesso, o erro de API e as regras puras", () => {
    expect(Object.keys(shared)).toEqual(
      expect.arrayContaining([
        "formatPriceBRL",
        "ApiError",
        "apiErrorBodySchema",
        "cadastroFormSchema",
        "criarPerfilRequestSchema",
        "emailSchema",
        "entrarSchema",
        "nomeCompletoSchema",
        "novaSenhaSchema",
        "perfilResponseSchema",
        "recuperarSenhaSchema",
        "senhaSchema",
        "telefoneSchema",
      ]),
    );
  });
});
