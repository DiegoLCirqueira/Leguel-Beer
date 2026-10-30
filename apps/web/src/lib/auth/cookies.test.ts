import { describe, expect, it } from "vitest";
import { COOKIE_ACESSO, COOKIE_MANTER, COOKIE_RENOVACAO, opcoesCookieSessao } from "./cookies";

describe("opcoesCookieSessao", () => {
  it("com Manter-me conectado marcado vale 30 dias, renovados a cada uso", () => {
    expect(opcoesCookieSessao({ manterConectado: true, producao: true })).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
  });

  it("desmarcado não tem validade: o cookie some ao fechar o navegador", () => {
    const opcoes = opcoesCookieSessao({ manterConectado: false, producao: true });

    expect(opcoes).toEqual({ httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    expect(opcoes).not.toHaveProperty("maxAge");
    expect(opcoes).not.toHaveProperty("expires");
  });

  it("Secure só fora do desenvolvimento em http://localhost", () => {
    expect(opcoesCookieSessao({ manterConectado: true, producao: false }).secure).toBe(false);
  });

  it("os três cookies da sessão têm nomes próprios", () => {
    expect(new Set([COOKIE_ACESSO, COOKIE_RENOVACAO, COOKIE_MANTER]).size).toBe(3);
  });
});
