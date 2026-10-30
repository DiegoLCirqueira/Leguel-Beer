import { describe, expect, it } from "vitest";
import { ensureDatabaseReachable } from "./database-ready.js";

describe("ensureDatabaseReachable", () => {
  it("passa quando o banco responde", async () => {
    await expect(ensureDatabaseReachable(() => Promise.resolve())).resolves.toBeUndefined();
  });

  it("falha dizendo que o banco de teste não respondeu e como subi-lo, sem vazar a causa crua", async () => {
    const attempt = ensureDatabaseReachable(() =>
      Promise.reject(new Error("connect ECONNREFUSED 127.0.0.1:54322")),
    );

    await expect(attempt).rejects.toThrow(/banco de teste não respondeu/);
    await expect(attempt).rejects.toThrow(/pnpm db:start/);
  });
});
