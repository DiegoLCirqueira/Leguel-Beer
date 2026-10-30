import { describe, expect, it } from "vitest";
import { InMemoryProfileRepository } from "../testing/in-memory.js";
import { CreateProfile } from "./create-profile.js";

const AGORA = new Date("2026-10-30T12:00:00.000Z");
const ana = { id: "ana-id", email: "ana@exemplo.com" };
const dados = { nome: "Ana Souza", telefone: "82912345678", aceite: true as const };

function setup(adminEmail?: string) {
  const profiles = new InMemoryProfileRepository();
  const useCase = new CreateProfile(profiles, {
    now: () => AGORA,
    legal: { termosVersao: "2026-10-30", privacidadeVersao: "2026-10-29" },
    adminEmail,
  });
  return { profiles, useCase };
}

describe("CreateProfile", () => {
  it("cria o perfil de cliente com id e e-mail do token, e aceite pelo relógio e versões da API", async () => {
    const { useCase } = setup();

    const result = await useCase.execute({ user: ana, ...dados });

    expect(result).toEqual({
      created: true,
      profile: {
        id: "ana-id",
        email: "ana@exemplo.com",
        nome: "Ana Souza",
        telefone: "82912345678",
        role: "customer",
        aceite: { termosVersao: "2026-10-30", privacidadeVersao: "2026-10-29", aceitoEm: AGORA },
      },
    });
  });

  it("grava o papel admin quando o e-mail do token é o ADMIN_EMAIL, sem diferenciar maiúsculas", async () => {
    const { useCase } = setup(" Ana@Exemplo.com ");

    const result = await useCase.execute({
      user: { id: "ana-id", email: "ANA@exemplo.com" },
      ...dados,
    });

    expect(result.profile.role).toBe("admin");
    expect(result.profile.email).toBe("ana@exemplo.com");
  });

  it("é cliente quando o ADMIN_EMAIL não está definido", async () => {
    const { useCase } = setup(undefined);

    const result = await useCase.execute({ user: ana, ...dados });

    expect(result.profile.role).toBe("customer");
  });

  it("repetir devolve o perfil existente, sem alterar nada", async () => {
    const { useCase } = setup();
    const first = await useCase.execute({ user: ana, ...dados });

    const second = await useCase.execute({
      user: ana,
      nome: "Outro Nome",
      telefone: "11987654321",
      aceite: true,
    });

    expect(second).toEqual({ profile: first.profile, created: false });
  });
});
