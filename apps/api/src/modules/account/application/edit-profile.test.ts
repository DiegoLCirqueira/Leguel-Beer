import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { Profile } from "../domain/profile.js";
import { InMemoryProfileRepository } from "../testing/in-memory.js";
import { EditProfile } from "./edit-profile.js";

const perfil: Profile = {
  id: "ana-id",
  email: "ana@exemplo.com",
  nome: "Ana Souza",
  telefone: "82912345678",
  dataNascimento: null,
  role: "customer",
  aceite: {
    termosVersao: "2026-10-30",
    privacidadeVersao: "2026-10-30",
    aceitoEm: new Date("2026-10-30T12:00:00.000Z"),
  },
};

async function setup() {
  const profiles = new InMemoryProfileRepository();
  await profiles.createProfile(perfil);
  return { profiles, edit: new EditProfile(profiles) };
}

describe("EditProfile", () => {
  it("troca nome, telefone e data de nascimento do perfil da sessão", async () => {
    const { edit } = await setup();

    const edited = await edit.execute("ana-id", {
      nome: "Ana Maria Souza",
      telefone: "82998765432",
      dataNascimento: "1992-03-15",
    });

    expect(edited).toMatchObject({
      nome: "Ana Maria Souza",
      telefone: "82998765432",
      dataNascimento: "1992-03-15",
    });
  });

  it("não muda e-mail, id, papel nem o aceite dos termos", async () => {
    const { edit, profiles } = await setup();

    await edit.execute("ana-id", { nome: "Outra", telefone: "82998765432", dataNascimento: null });

    expect(await profiles.findProfile("ana-id")).toMatchObject({
      id: "ana-id",
      email: "ana@exemplo.com",
      role: "customer",
      aceite: perfil.aceite,
    });
  });

  it("data nula apaga a data guardada", async () => {
    const { edit } = await setup();
    await edit.execute("ana-id", { nome: "Ana", telefone: "82912345678", dataNascimento: "1992-03-15" });

    const edited = await edit.execute("ana-id", {
      nome: "Ana",
      telefone: "82912345678",
      dataNascimento: null,
    });

    expect(edited.dataNascimento).toBeNull();
  });

  it("lança NotFoundError quando a conta ainda não criou o perfil", async () => {
    const profiles = new InMemoryProfileRepository();
    await profiles.ensureRole({ id: "ana-id", email: "ana@exemplo.com" }, "customer");

    await expect(
      new EditProfile(profiles).execute("ana-id", {
        nome: "Ana",
        telefone: "82912345678",
        dataNascimento: null,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
