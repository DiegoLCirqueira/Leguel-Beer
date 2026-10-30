import { criarPerfilRequestSchema } from "@leguele/shared";
import { describe, expect, it } from "vitest";
import { ValidationError } from "../errors/validation-error.js";
import { zodDto } from "./zod-dto.js";
import { ZodValidationPipe } from "./zod-validation.pipe.js";

class CriarPerfilDto extends zodDto(criarPerfilRequestSchema) {}

describe("contratos compartilhados na API", () => {
  const pipe = new ZodValidationPipe();
  const metadata = { type: "body" as const, metatype: CriarPerfilDto };

  it("recusa o telefone inválido apontando o campo telefone, com a mensagem do formulário", () => {
    let error: unknown;
    try {
      pipe.transform({ nome: "Ana", telefone: "(82) 1234", aceite: true }, metadata);
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues).toEqual([
      { field: "telefone", message: "Informe um telefone com DDD." },
    ]);
  });

  it("entrega o corpo válido com o telefone só em dígitos", () => {
    expect(
      pipe.transform({ nome: "Ana", telefone: "(82) 91234-5678", aceite: true }, metadata),
    ).toEqual({ nome: "Ana", telefone: "82912345678", aceite: true });
  });
});
