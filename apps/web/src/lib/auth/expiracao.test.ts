import { describe, expect, it } from "vitest";
import { expiracaoDoToken, precisaRenovar } from "./expiracao";

const jwt = (payload: object) =>
  `cabecalho.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.assinatura`;

const agora = Date.UTC(2026, 9, 30, 12, 0, 0);
const emSegundos = (s: number) => Math.floor((agora + s * 1000) / 1000);

describe("expiracaoDoToken", () => {
  it("lê o exp do token, em segundos", () => {
    expect(expiracaoDoToken(jwt({ exp: 1234 }))).toBe(1234);
  });

  it.each(["", "abc", "a.b.c", "a.%%%.c", jwt({}), jwt({ exp: "amanhã" })])(
    "devolve undefined para token ilegível (%j)",
    (token) => {
      expect(expiracaoDoToken(token)).toBeUndefined();
    },
  );
});

describe("precisaRenovar", () => {
  it("não renova um token com mais de 60 segundos de vida", () => {
    expect(precisaRenovar(jwt({ exp: emSegundos(300) }), agora)).toBe(false);
  });

  it("renova um token perto de vencer (menos de 60 segundos)", () => {
    expect(precisaRenovar(jwt({ exp: emSegundos(30) }), agora)).toBe(true);
  });

  it("renova um token já vencido", () => {
    expect(precisaRenovar(jwt({ exp: emSegundos(-10) }), agora)).toBe(true);
  });

  it("renova quando o token não existe ou não dá para ler", () => {
    expect(precisaRenovar(undefined, agora)).toBe(true);
    expect(precisaRenovar("lixo", agora)).toBe(true);
  });
});
