import { describe, expect, it } from "vitest";
import { isProductionEnv } from "./production-env.js";

describe("isProductionEnv", () => {
  it("NODE_ENV=production ou qualquer VERCEL_ENV é produção", () => {
    expect(isProductionEnv({ NODE_ENV: "production" })).toBe(true);
    expect(isProductionEnv({ VERCEL_ENV: "production" })).toBe(true);
    expect(isProductionEnv({ VERCEL_ENV: "preview" })).toBe(true);
    expect(isProductionEnv({ VERCEL_ENV: "development" })).toBe(true);
  });

  it("local, teste e desenvolvimento sem VERCEL_ENV não são produção", () => {
    expect(isProductionEnv({})).toBe(false);
    expect(isProductionEnv({ NODE_ENV: "development" })).toBe(false);
    expect(isProductionEnv({ NODE_ENV: "test", VERCEL_ENV: "" })).toBe(false);
  });
});
