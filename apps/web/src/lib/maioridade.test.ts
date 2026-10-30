import { describe, expect, it } from "vitest";
import { retornoSeguro } from "./maioridade";

describe("retornoSeguro", () => {
  it("mantém o caminho interno com os parâmetros", () => {
    expect(retornoSeguro("/catalogo?categoria=ipa")).toBe("/catalogo?categoria=ipa");
  });

  it("leva à boas-vindas quando não há retorno ou ele é a home", () => {
    expect(retornoSeguro(undefined)).toBe("/boas-vindas");
    expect(retornoSeguro("")).toBe("/boas-vindas");
    expect(retornoSeguro("/")).toBe("/boas-vindas");
  });

  it.each([
    "https://exemplo.com/catalogo",
    "//exemplo.com",
    String.raw`/\exemplo.com`,
    "javascript:alert(1)",
    "catalogo",
    "/ok\nhttps://exemplo.com",
  ])("ignora o endereço de fora do site %j", (retorno) => {
    expect(retornoSeguro(retorno)).toBe("/boas-vindas");
  });

  it("não devolve a própria pergunta como retorno", () => {
    expect(retornoSeguro("/maioridade?retorno=/catalogo")).toBe("/boas-vindas");
  });
});
