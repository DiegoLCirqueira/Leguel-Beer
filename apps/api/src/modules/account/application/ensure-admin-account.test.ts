import { describe, expect, it } from "vitest";
import { EnsureAdminAccount } from "./ensure-admin-account.js";
import { InMemoryAuthAdmin, InMemoryProfileRepository } from "./in-memory.js";

function setup() {
  const auth = new InMemoryAuthAdmin();
  const profiles = new InMemoryProfileRepository();
  return { auth, profiles, useCase: new EnsureAdminAccount(auth, profiles) };
}

describe("EnsureAdminAccount", () => {
  it("cria a conta confirmada e grava o perfil com papel admin quando a conta não existe", async () => {
    const { auth, profiles, useCase } = setup();

    const result = await useCase.execute({
      email: "admin@leguele.test",
      password: "senha-forte-123456",
    });

    expect(result).toEqual({ userId: "user-1", created: true });
    expect(auth.users).toEqual([
      { id: "user-1", email: "admin@leguele.test", password: "senha-forte-123456" },
    ]);
    expect(profiles.profiles.get("user-1")).toEqual({
      id: "user-1",
      email: "admin@leguele.test",
      role: "admin",
    });
  });
});
