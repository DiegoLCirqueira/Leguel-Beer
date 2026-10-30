import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ValidationError } from "../errors/validation-error.js";
import { zodDto } from "./zod-dto.js";
import { ZodValidationPipe } from "./zod-validation.pipe.js";

class QuantidadeDto extends zodDto(z.object({ quantidade: z.number() })) {}

describe("ZodValidationPipe", () => {
  const pipe = new ZodValidationPipe();

  it("devolve o valor validado", () => {
    expect(pipe.transform({ quantidade: 2 }, { type: "body", metatype: QuantidadeDto })).toEqual({
      quantidade: 2,
    });
  });

  it("devolve as mensagens do Zod em pt-BR", () => {
    let error: unknown;
    try {
      pipe.transform({ quantidade: "abc" }, { type: "body", metatype: QuantidadeDto });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(ValidationError);
    const [issue] = (error as ValidationError).issues;
    expect(issue?.field).toBe("quantidade");
    expect(issue?.message).not.toMatch(/Invalid input/);
    expect(issue?.message).toMatch(/esperado|inválid/i);
  });
});
