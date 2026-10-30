import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors/not-found-error.js";
import { ownedOrNotFound } from "./owned-or-not-found.js";

const recursoDoBruno = { id: "r1", ownerId: "bruno" };

describe("ownedOrNotFound", () => {
  it("devolve o recurso quando a conta é a dona", () => {
    expect(ownedOrNotFound(recursoDoBruno, "bruno")).toBe(recursoDoBruno);
  });

  it("lança o mesmo NotFoundError para o recurso de outra conta e para um id que não existe", () => {
    const erro = (fn: () => unknown): unknown => {
      try {
        fn();
      } catch (e) {
        return e;
      }
      return undefined;
    };

    const doOutro = erro(() => ownedOrNotFound(recursoDoBruno, "ana"));
    const inexistente = erro(() => ownedOrNotFound(null, "ana"));

    expect(doOutro).toBeInstanceOf(NotFoundError);
    expect(inexistente).toBeInstanceOf(NotFoundError);
    expect((doOutro as Error).message).toBe((inexistente as Error).message);
  });
});
