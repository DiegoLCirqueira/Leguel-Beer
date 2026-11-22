import { describe, expect, it } from "vitest";
import { parseThrottleLimit, throttleLimitFromEnv } from "./throttle-limit.js";

describe("parseThrottleLimit", () => {
  it("sem a variável usa o padrão de 100 por minuto", () => {
    expect(parseThrottleLimit(undefined, false)).toBe(100);
    expect(parseThrottleLimit("", false)).toBe(100);
  });

  it("fora de produção aceita um inteiro positivo, como 10000 no E2E local", () => {
    expect(parseThrottleLimit("10000", false)).toBe(10_000);
  });

  it.each(["abc", "0", "-5", "1.5", "1e6", "Infinity", " 50", "999999999999"])(
    "valor inválido %j cai no padrão, nunca em limite zero ou infinito",
    (raw) => {
      expect(parseThrottleLimit(raw, false)).toBe(100);
      expect(parseThrottleLimit(raw, true)).toBe(100);
    },
  );

  it("em produção nenhum valor passa de 1000 por minuto", () => {
    expect(parseThrottleLimit("500", true)).toBe(500);
    expect(parseThrottleLimit("10000", true)).toBe(1000);
  });
});

describe("throttleLimitFromEnv", () => {
  it("com NODE_ENV=production, 10000 vira o teto de 1000", () => {
    expect(throttleLimitFromEnv({ NODE_ENV: "production", THROTTLE_LIMIT: "10000" })).toBe(1000);
  });
});
