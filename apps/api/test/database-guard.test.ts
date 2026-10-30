import { describe, expect, it } from "vitest";
import { assertTestDatabase } from "./database-guard.js";

const DEV = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

describe("assertTestDatabase", () => {
  it("aceita um banco de teste diferente do de desenvolvimento", () => {
    expect(() =>
      assertTestDatabase("postgresql://postgres:postgres@127.0.0.1:54322/leguele_test", [DEV]),
    ).not.toThrow();
  });

  it("recusa o mesmo banco de DATABASE_URL, mesmo escrito com outro usuário ou parâmetros", () => {
    const sameDatabase = "postgresql://outro:senha@127.0.0.1:54322/leguele_test?schema=public";
    expect(() =>
      assertTestDatabase(sameDatabase, [
        "postgresql://postgres:postgres@127.0.0.1:54322/leguele_test",
      ]),
    ).toThrow(/mesmo banco/);
  });

  it("recusa um nome de banco que não termina em _test", () => {
    expect(() => assertTestDatabase(DEV, [undefined])).toThrow(/_test/);
  });
});
