import { describe, expect, it } from "vitest";
import { EnsureAdminAccount } from "./ensure-admin-account.js";
import { InMemoryAuthAdmin, InMemoryProfileRepository } from "../testing/in-memory.js";

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

  it("só garante o papel admin, sem recriar a conta nem trocar a senha, quando a conta já existe", async () => {
    const { auth, profiles, useCase } = setup();
    await auth.createConfirmedUser("admin@leguele.test", "senha-original-123");
    await profiles.ensureRole({ id: "user-1", email: "admin@leguele.test" }, "customer");

    const result = await useCase.execute({
      email: "admin@leguele.test",
      password: "outra-senha-456789",
    });

    expect(result).toEqual({ userId: "user-1", created: false });
    expect(auth.users).toHaveLength(1);
    expect(auth.users[0]?.password).toBe("senha-original-123");
    expect(profiles.profiles.get("user-1")?.role).toBe("admin");
  });

  it("compara o e-mail sem diferenciar maiúsculas e minúsculas, e repetir não duplica", async () => {
    const { auth, profiles, useCase } = setup();

    await useCase.execute({ email: " Admin@Leguele.Test ", password: "senha-forte-123456" });
    const second = await useCase.execute({
      email: "admin@leguele.test",
      password: "senha-forte-123456",
    });

    expect(second.created).toBe(false);
    expect(auth.users.map((u) => u.email)).toEqual(["admin@leguele.test"]);
    expect(profiles.profiles.size).toBe(1);
  });
});
