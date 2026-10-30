import { describe, expect, it } from "vitest";
import { InsufficientRoleError } from "../domain/access.js";
import { InvalidTokenError, type TokenVerifier } from "../domain/token-verifier.js";
import { InMemoryProfileRepository } from "../testing/in-memory.js";
import { AuthorizeRequest } from "./authorize-request.js";

const ana = { id: "ana-id", email: "ana@exemplo.com" };

function setup() {
  const verifier: TokenVerifier = {
    verify: (token) =>
      token === "token-da-ana"
        ? Promise.resolve(ana)
        : Promise.reject(new InvalidTokenError("assinatura")),
  };
  const profiles = new InMemoryProfileRepository();
  return { profiles, useCase: new AuthorizeRequest(verifier, profiles) };
}

describe("AuthorizeRequest", () => {
  it.each([undefined, "", "token-da-ana", "Basic token-da-ana", "Bearer"])(
    "recusa o cabeçalho Authorization %j",
    async (authorization) => {
      const { useCase } = setup();

      await expect(useCase.execute({ authorization })).rejects.toBeInstanceOf(InvalidTokenError);
    },
  );

  it("recusa o token que o verificador rejeita", async () => {
    const { useCase } = setup();

    await expect(useCase.execute({ authorization: "Bearer outro" })).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });

  it("autentica a conta com o token válido; sem perfil ela é cliente", async () => {
    const { useCase } = setup();

    await expect(useCase.execute({ authorization: "Bearer token-da-ana" })).resolves.toEqual({
      ...ana,
      role: "customer",
    });
  });

  it("deixa o cliente passar quando a rota não exige papel e o admin quando exige admin", async () => {
    const { profiles, useCase } = setup();
    await profiles.ensureRole(ana, "admin");

    await expect(
      useCase.execute({ authorization: "Bearer token-da-ana", requiredRole: "admin" }),
    ).resolves.toMatchObject({ id: ana.id, role: "admin" });
  });

  it("nega ao cliente a rota de admin", async () => {
    const { profiles, useCase } = setup();
    await profiles.ensureRole(ana, "customer");

    await expect(
      useCase.execute({ authorization: "Bearer token-da-ana", requiredRole: "admin" }),
    ).rejects.toBeInstanceOf(InsufficientRoleError);
  });
});
