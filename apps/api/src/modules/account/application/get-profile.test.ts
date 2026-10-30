import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { InMemoryProfileRepository } from "../testing/in-memory.js";
import { GetProfile } from "./get-profile.js";

const perfil = {
  id: "ana-id",
  email: "ana@exemplo.com",
  nome: "Ana Souza",
  telefone: "82912345678",
  role: "customer" as const,
  aceite: {
    termosVersao: "2026-10-30",
    privacidadeVersao: "2026-10-30",
    aceitoEm: new Date("2026-10-30T12:00:00.000Z"),
  },
};

describe("GetProfile", () => {
  it("devolve o perfil da conta", async () => {
    const profiles = new InMemoryProfileRepository();
    await profiles.createProfile(perfil);

    await expect(new GetProfile(profiles).execute("ana-id")).resolves.toEqual(perfil);
  });

  it("lança NotFoundError quando a conta ainda não tem perfil", async () => {
    const profiles = new InMemoryProfileRepository();
    await profiles.ensureRole({ id: "ana-id", email: "ana@exemplo.com" }, "customer");

    await expect(new GetProfile(profiles).execute("ana-id")).rejects.toBeInstanceOf(NotFoundError);
  });
});
