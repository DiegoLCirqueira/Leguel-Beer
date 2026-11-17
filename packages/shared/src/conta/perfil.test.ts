import { describe, expect, it } from "vitest";
import {
  criarPerfilRequestSchema,
  editarPerfilRequestSchema,
  papelResponseSchema,
  perfilResponseSchema,
} from "./perfil.js";

describe("criarPerfilRequestSchema", () => {
  const valido = { nome: "Ana Souza", telefone: "(82) 91234-5678", aceite: true };

  it("aceita nome, telefone e aceite, e entrega o telefone só com dígitos", () => {
    expect(criarPerfilRequestSchema.parse(valido)).toEqual({
      nome: "Ana Souza",
      telefone: "82912345678",
      aceite: true,
    });
  });

  it("aponta o campo telefone quando o telefone é inválido", () => {
    const issue = criarPerfilRequestSchema.safeParse({ ...valido, telefone: "(82) 1234" }).error
      ?.issues[0];

    expect(issue?.path).toEqual(["telefone"]);
    expect(issue?.message).toBe("Informe um telefone com DDD.");
  });

  it("recusa o aceite ausente ou falso", () => {
    expect(criarPerfilRequestSchema.safeParse({ ...valido, aceite: false }).success).toBe(false);
    expect(
      criarPerfilRequestSchema.safeParse({ nome: valido.nome, telefone: valido.telefone }).success,
    ).toBe(false);
  });

  it("recusa e-mail, id e papel no corpo: vêm do token, não do cliente", () => {
    for (const extra of [{ email: "x@y.com" }, { id: "1" }, { papel: "admin" }]) {
      expect(criarPerfilRequestSchema.safeParse({ ...valido, ...extra }).success).toBe(false);
    }
  });
});

describe("perfilResponseSchema", () => {
  const perfil = {
    id: "0b0f6f0e-3f65-4e4e-8a4e-5d6a7c2d9a11",
    email: "ana@exemplo.com",
    nome: "Ana Souza",
    telefone: "82912345678",
    papel: "cliente",
    aceite: {
      termosVersao: "2026-10-29",
      privacidadeVersao: "2026-10-29",
      aceitoEm: "2026-10-30T12:00:00.000Z",
    },
  };

  it("aceita o perfil do cliente e do admin", () => {
    expect(perfilResponseSchema.parse(perfil)).toEqual({ ...perfil, dataNascimento: null });
    expect(perfilResponseSchema.parse({ ...perfil, papel: "admin" }).papel).toBe("admin");
  });

  it("traz a data de nascimento ou null quando o cliente ainda não informou", () => {
    expect(perfilResponseSchema.parse({ ...perfil, dataNascimento: "1992-03-15" })).toMatchObject({
      dataNascimento: "1992-03-15",
    });
    expect(perfilResponseSchema.parse(perfil).dataNascimento).toBeNull();
  });

  it("recusa uma data de nascimento fora do formato AAAA-MM-DD", () => {
    expect(
      perfilResponseSchema.safeParse({ ...perfil, dataNascimento: "15/03/1992" }).success,
    ).toBe(false);
  });

  it("recusa um papel desconhecido", () => {
    expect(perfilResponseSchema.safeParse({ ...perfil, papel: "dono" }).success).toBe(false);
  });
});

describe("papelResponseSchema", () => {
  it("aceita só o papel cliente ou admin", () => {
    expect(papelResponseSchema.parse({ papel: "cliente" })).toEqual({ papel: "cliente" });
    expect(papelResponseSchema.parse({ papel: "admin" })).toEqual({ papel: "admin" });
    expect(papelResponseSchema.safeParse({ papel: "dono" }).success).toBe(false);
    expect(papelResponseSchema.safeParse({}).success).toBe(false);
  });
});

describe("editarPerfilRequestSchema", () => {
  const valido = { nome: "Ana Souza", telefone: "(82) 99876-5432", dataNascimento: "15/03/1992" };

  it("aceita nome, telefone e data, e entrega telefone só com dígitos e data AAAA-MM-DD", () => {
    expect(editarPerfilRequestSchema.parse(valido)).toEqual({
      nome: "Ana Souza",
      telefone: "82998765432",
      dataNascimento: "1992-03-15",
    });
  });

  it("a data é opcional: ausente, nula ou em branco guarda null", () => {
    const semData = { nome: valido.nome, telefone: valido.telefone };
    for (const corpo of [
      semData,
      { ...semData, dataNascimento: null },
      { ...semData, dataNascimento: "" },
    ]) {
      expect(editarPerfilRequestSchema.parse(corpo).dataNascimento).toBeNull();
    }
  });

  it("aponta o campo de cada dado inválido", () => {
    const campo = (extra: object) =>
      editarPerfilRequestSchema.safeParse({ ...valido, ...extra }).error?.issues[0];

    expect(campo({ nome: "  " })?.path).toEqual(["nome"]);
    expect(campo({ telefone: "(82) 1234" })?.path).toEqual(["telefone"]);
    expect(campo({ dataNascimento: "31/04/1990" })?.path).toEqual(["dataNascimento"]);
    expect(campo({ dataNascimento: "31/04/1990" })?.message).toBe(
      "Informe uma data de nascimento válida.",
    );
  });

  it("recusa e-mail, id, papel e aceite no corpo: não mudam por esta tela", () => {
    for (const extra of [{ email: "x@y.com" }, { id: "1" }, { papel: "admin" }, { aceite: true }]) {
      expect(editarPerfilRequestSchema.safeParse({ ...valido, ...extra }).success).toBe(false);
    }
  });
});
