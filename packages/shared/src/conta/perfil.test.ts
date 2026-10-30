import { describe, expect, it } from "vitest";
import { criarPerfilRequestSchema, perfilResponseSchema } from "./perfil.js";

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
    expect(perfilResponseSchema.parse(perfil)).toEqual(perfil);
    expect(perfilResponseSchema.parse({ ...perfil, papel: "admin" }).papel).toBe("admin");
  });

  it("recusa um papel desconhecido", () => {
    expect(perfilResponseSchema.safeParse({ ...perfil, papel: "dono" }).success).toBe(false);
  });
});
