import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("next.config", () => {
  it("desliga o indicador do Next em desenvolvimento (o N em um círculo preto)", () => {
    expect(nextConfig.devIndicators).toBe(false);
  });
});
