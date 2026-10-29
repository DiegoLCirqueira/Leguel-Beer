import { describe, expect, it } from "vitest";
import { formatPriceBRL } from "./format-price.js";

const normalize = (value: string) => value.replace(/\s/g, " ");

describe("formatPriceBRL", () => {
  it("formata centavos como reais", () => {
    expect(normalize(formatPriceBRL(1250))).toBe("R$ 12,50");
  });
});
