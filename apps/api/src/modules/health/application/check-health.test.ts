import { describe, expect, it } from "vitest";
import { CheckHealth } from "./check-health.js";
import type { DatabaseHealth } from "./database-health.js";

const databaseThat = (up: boolean): DatabaseHealth => ({ isUp: () => Promise.resolve(up) });

describe("CheckHealth", () => {
  it("informa ok quando o banco está no ar", async () => {
    expect(await new CheckHealth(databaseThat(true)).execute()).toEqual({
      status: "ok",
      database: "up",
    });
  });

  it("informa error quando o banco está fora do ar", async () => {
    expect(await new CheckHealth(databaseThat(false)).execute()).toEqual({
      status: "error",
      database: "down",
    });
  });
});
