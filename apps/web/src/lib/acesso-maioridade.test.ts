import { describe, expect, it } from "vitest";
import { decidirAcesso } from "./acesso-maioridade";

const DIA = 24 * 60 * 60 * 1000;
const agora = Date.UTC(2026, 9, 30, 12);
const navegador = "Mozilla/5.0 (Linux; Android 13; Pixel 5) Chrome/120 Mobile Safari/537.36";

const pedido = (extra: Partial<Parameters<typeof decidirAcesso>[0]> = {}) =>
  decidirAcesso({
    caminho: "/catalogo",
    busca: "?categoria=ipa",
    userAgent: navegador,
    agora,
    ...extra,
  });

describe("decidirAcesso", () => {
  it("pergunta com o retorno quando a maioridade não foi confirmada", () => {
    expect(pedido()).toEqual({ tipo: "perguntar", retorno: "/catalogo?categoria=ipa" });
  });

  it("segue quando a confirmação tem 29 dias", () => {
    expect(pedido({ cookie: String(agora - 29 * DIA) })).toEqual({ tipo: "seguir" });
  });

  it("pergunta de novo quando a confirmação tem 31 dias", () => {
    expect(pedido({ cookie: String(agora - 31 * DIA) })).toEqual({
      tipo: "perguntar",
      retorno: "/catalogo?categoria=ipa",
    });
  });

  it.each(["", "ontem", "1", String(agora + DIA)])(
    "pergunta quando o cookie não é uma data passada válida (%j)",
    (cookie) => {
      expect(pedido({ cookie }).tipo).toBe("perguntar");
    },
  );

  it("segue na própria pergunta, para não entrar em laço", () => {
    expect(pedido({ caminho: "/maioridade", busca: "" })).toEqual({ tipo: "seguir" });
  });

  it.each([
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  ])("libera o robô de busca sem a pergunta (%s)", (userAgent) => {
    expect(pedido({ userAgent })).toEqual({ tipo: "liberar-robo" });
  });

  it.each(["/termos", "/privacidade"])(
    "libera a página legal %s sem a pergunta, para quem quer ler antes de entrar",
    (caminho) => {
      expect(pedido({ caminho, busca: "" })).toEqual({ tipo: "seguir" });
    },
  );

  it("continua perguntando em /entregas e em caminhos que só começam como uma página legal", () => {
    expect(pedido({ caminho: "/entregas", busca: "" }).tipo).toBe("perguntar");
    expect(pedido({ caminho: "/termos-extra", busca: "" }).tipo).toBe("perguntar");
    expect(pedido({ caminho: "/privacidade/outra", busca: "" }).tipo).toBe("perguntar");
  });
});
