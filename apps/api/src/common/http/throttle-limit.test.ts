import { describe, expect, it } from "vitest";
import { parseThrottleLimit } from "./throttle-limit.js";

describe("parseThrottleLimit", () => {
  it("sem a variável usa o padrão de 100 por minuto", () => {
    expect(parseThrottleLimit(undefined, false)).toBe(100);
    expect(parseThrottleLimit("", false)).toBe(100);
  });

  it("fora de produção aceita um inteiro positivo, como 10000 no E2E local", () => {
    expect(parseThrottleLimit("10000", false)).toBe(10_000);
  });
});
