import { describe, expect, it } from "vitest";
import { decidirProtecao } from "./protecao";

const visitante = { temSessao: false };
const cliente = { temSessao: true, papel: "cliente" as const };
const admin = { temSessao: true, papel: "admin" as const };

describe("decidirProtecao", () => {
  it.each(["/conta", "/checkout", "/admin"])(
    "visitante em %s vai para a tela de entrar e volta depois",
    (caminho) => {
      expect(decidirProtecao({ caminho, busca: "", ...visitante })).toEqual({
        tipo: "entrar",
        retorno: caminho,
      });
    },
  );

  it("o retorno leva os parâmetros e as subpáginas", () => {
    expect(decidirProtecao({ caminho: "/conta/pedidos", busca: "?aba=1", ...visitante })).toEqual({
      tipo: "entrar",
      retorno: "/conta/pedidos?aba=1",
    });
  });

  it.each(["/conta", "/conta/pedidos", "/checkout", "/checkout/pagamento"])(
    "cliente com sessão segue em %s",
    (caminho) => {
      expect(decidirProtecao({ caminho, busca: "", ...cliente })).toEqual({ tipo: "seguir" });
    },
  );

  it("cliente comum em /admin vê a página não encontrada, para não revelar que a área existe", () => {
    expect(decidirProtecao({ caminho: "/admin", busca: "", ...cliente })).toEqual({
      tipo: "nao-encontrada",
    });
    expect(decidirProtecao({ caminho: "/admin/cervejas", busca: "", ...cliente })).toEqual({
      tipo: "nao-encontrada",
    });
  });

  it("admin segue em /admin", () => {
    expect(decidirProtecao({ caminho: "/admin/cervejas", busca: "", ...admin })).toEqual({
      tipo: "seguir",
    });
  });

  it("com sessão e papel ainda desconhecido em /admin, pede o papel antes de decidir", () => {
    expect(decidirProtecao({ caminho: "/admin", busca: "", temSessao: true })).toEqual({
      tipo: "consultar-papel",
    });
  });

  it.each([
    "/",
    "/boas-vindas",
    "/entrar",
    "/criar-conta",
    "/termos",
    "/contato",
    "/administracao",
  ])("páginas abertas e nomes que só começam parecido seguem sem sessão (%s)", (caminho) => {
    expect(decidirProtecao({ caminho, busca: "", ...visitante })).toEqual({ tipo: "seguir" });
  });
});
