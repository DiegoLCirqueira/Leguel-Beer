import { describe, expect, it } from "vitest";
import { AccountRateLimiter } from "./account-rate-limiter.js";

describe("AccountRateLimiter", () => {
  const regra = { limit: 3, windowMs: 60_000 };

  it("deixa passar até o limite dentro da janela e recusa a próxima", () => {
    let agora = 0;
    const limiter = new AccountRateLimiter(() => agora);

    expect([1, 2, 3, 4].map(() => limiter.allow("enderecos", "ana", regra))).toEqual([
      true,
      true,
      true,
      false,
    ]);
    agora = 59_999;
    expect(limiter.allow("enderecos", "ana", regra)).toBe(false);
  });

  it("libera de novo quando a janela termina", () => {
    let agora = 0;
    const limiter = new AccountRateLimiter(() => agora);
    for (let i = 0; i < 3; i++) limiter.allow("enderecos", "ana", regra);

    agora = 60_000;

    expect(limiter.allow("enderecos", "ana", regra)).toBe(true);
  });

  it("conta por conta e por rota: outra conta ou outro grupo tem a própria cota", () => {
    const limiter = new AccountRateLimiter(() => 0);
    for (let i = 0; i < 3; i++) limiter.allow("enderecos", "ana", regra);

    expect(limiter.allow("enderecos", "bia", regra)).toBe(true);
    expect(limiter.allow("outra-rota", "ana", regra)).toBe(true);
  });

  it("recusar não gasta cota nem estende a janela", () => {
    let agora = 0;
    const limiter = new AccountRateLimiter(() => agora);
    for (let i = 0; i < 5; i++) limiter.allow("enderecos", "ana", regra);

    agora = 60_000;

    expect(limiter.allow("enderecos", "ana", regra)).toBe(true);
  });

  it("não acumula chaves de janelas vencidas", () => {
    let agora = 0;
    const limiter = new AccountRateLimiter(() => agora);
    limiter.allow("enderecos", "ana", regra);
    agora = 120_000;
    limiter.allow("enderecos", "bia", regra);

    expect(limiter.size).toBe(1);
  });
});
