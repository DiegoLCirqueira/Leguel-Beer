import { describe, expect, it } from "vitest";
import { retornoInterno } from "./retorno";

describe("retornoInterno", () => {
  it("mantém o caminho interno com os parâmetros", () => {
    expect(retornoInterno("/conta?aba=pedidos", "/")).toBe("/conta?aba=pedidos");
  });

  it("sem retorno ou vazio usa o destino padrão", () => {
    expect(retornoInterno(undefined, "/")).toBe("/");
    expect(retornoInterno("", "/boas-vindas")).toBe("/boas-vindas");
  });

  it.each([
    "https://exemplo.com/conta",
    "//exemplo.com",
    String.raw`/\exemplo.com`,
    "javascript:alert(1)",
    "conta",
    "/ok\nhttps://exemplo.com",
  ])("ignora o endereço de fora do site %j", (retorno) => {
    expect(retornoInterno(retorno, "/")).toBe("/");
  });

  it.each(["/entrar", "/entrar?retorno=/conta", "/criar-conta", "/maioridade?retorno=/"])(
    "não volta para uma tela de acesso (%s), para não entrar em laço",
    (retorno) => {
      expect(retornoInterno(retorno, "/")).toBe("/");
    },
  );
});
