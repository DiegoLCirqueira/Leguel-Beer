import { describe, expect, it } from "vitest";
import { destinoDoVoltar } from "./destino-do-voltar";

const origem = "https://leguele.exemplo";

describe("destinoDoVoltar", () => {
  it("volta na história quando a pessoa veio de outra página do próprio site", () => {
    expect(
      destinoDoVoltar({ referrer: `${origem}/criar-conta`, origem, tamanhoDoHistorico: 3 }),
    ).toBe("voltar");
  });

  it("na aba nova aberta pelo cadastro (história de 1 página) leva de volta ao /criar-conta", () => {
    expect(
      destinoDoVoltar({ referrer: `${origem}/criar-conta`, origem, tamanhoDoHistorico: 1 }),
    ).toBe("/criar-conta");
  });

  it("aba nova aberta de outra página do site vai para a boas-vindas", () => {
    expect(destinoDoVoltar({ referrer: `${origem}/entrar`, origem, tamanhoDoHistorico: 1 })).toBe(
      "/boas-vindas",
    );
  });

  it.each([
    ["sem referrer (link direto)", ""],
    ["referrer de outro site", "https://outro.exemplo/pagina"],
    ["referrer ilegível", "isto não é uma url"],
  ])("%s vai para a boas-vindas", (_, referrer) => {
    expect(destinoDoVoltar({ referrer, origem, tamanhoDoHistorico: 4 })).toBe("/boas-vindas");
  });

  it("um site de origem parecida não conta como o próprio site", () => {
    expect(
      destinoDoVoltar({
        referrer: "https://leguele.exemplo.malicioso.com/criar-conta",
        origem,
        tamanhoDoHistorico: 5,
      }),
    ).toBe("/boas-vindas");
  });

  it("quem chegou por uma navegação dentro do site (o referrer não muda) volta na história", () => {
    expect(
      destinoDoVoltar({ referrer: "", origem, tamanhoDoHistorico: 2, navegouNoSite: true }),
    ).toBe("voltar");
  });

  it("navegação dentro do site sem página anterior na história não tenta voltar", () => {
    expect(
      destinoDoVoltar({ referrer: "", origem, tamanhoDoHistorico: 1, navegouNoSite: true }),
    ).toBe("/boas-vindas");
  });
});
