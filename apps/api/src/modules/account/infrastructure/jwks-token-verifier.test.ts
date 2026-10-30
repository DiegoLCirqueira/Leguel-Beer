import { describe, expect, it } from "vitest";
import { createTestTokens } from "../../../common/testing/tokens.js";
import { InvalidTokenError } from "../domain/token-verifier.js";
import { JwksTokenVerifier } from "./jwks-token-verifier.js";

const JWKS_URL = "http://127.0.0.1:54321/auth/v1/.well-known/jwks.json";

function setup(tokens = createTestTokens()) {
  let fetches = 0;
  const fetchFake = () => {
    fetches++;
    return Promise.resolve(new Response(JSON.stringify(tokens.jwks), { status: 200 }));
  };
  const verifier = new JwksTokenVerifier(JWKS_URL, fetchFake as typeof fetch);
  return { tokens, verifier, fetches: () => fetches };
}

describe("JwksTokenVerifier", () => {
  it("aceita o token de cliente e devolve o id e o e-mail da conta", async () => {
    const { tokens, verifier } = setup();

    await expect(verifier.verify(tokens.customer())).resolves.toEqual({
      id: tokens.customerId,
      email: "cliente@leguele.test",
    });
  });

  it.each([
    ["expirado", (t: ReturnType<typeof createTestTokens>) => t.expired()],
    ["adulterado", (t: ReturnType<typeof createTestTokens>) => t.tampered()],
    ["assinado com HS256", (t: ReturnType<typeof createTestTokens>) => t.hs256()],
    ["sem formato de JWT", () => "isto-nao-e-um-jwt"],
  ])("recusa o token %s", async (_caso, make) => {
    const { tokens, verifier } = setup();

    await expect(verifier.verify(make(tokens))).rejects.toBeInstanceOf(InvalidTokenError);
  });

  it("recusa o token assinado por outra chave, mesmo com o kid conhecido", async () => {
    const { verifier } = setup();
    const outro = createTestTokens();

    await expect(verifier.verify(outro.customer())).rejects.toBeInstanceOf(InvalidTokenError);
  });

  it("guarda o JWKS em cache entre as verificações", async () => {
    const { tokens, verifier, fetches } = setup();

    await verifier.verify(tokens.customer());
    await verifier.verify(tokens.admin());

    expect(fetches()).toBe(1);
  });

  it("falha fechado, como token inválido, quando o JWKS não responde", async () => {
    const tokens = createTestTokens();
    const verifier = new JwksTokenVerifier(JWKS_URL, (() =>
      Promise.resolve(new Response("{}", { status: 503 }))) as typeof fetch);

    await expect(verifier.verify(tokens.customer())).rejects.toBeInstanceOf(InvalidTokenError);
  });

  it.each([
    ["header", "null", '{"sub":"x"}'],
    ["payload", '{"alg":"ES256"}', "null"],
    ["header", "[]", "{}"],
    ["payload", '{"alg":"ES256"}', '"texto"'],
  ])(
    "recusa o token cujo %s não é um objeto JSON, sem erro interno",
    async (_parte, header, payload) => {
      const { verifier } = setup();
      const b64 = (valor: string) => Buffer.from(valor).toString("base64url");

      await expect(
        verifier.verify(`${b64(header)}.${b64(payload)}.assinatura`),
      ).rejects.toBeInstanceOf(InvalidTokenError);
    },
  );

  it.each([
    ["alg diferente do header", { alg: "RS256" }],
    ["kty que não é EC", { kty: "RSA" }],
    ["curva que não é P-256", { crv: "P-384" }],
  ])("recusa o token quando a chave do JWKS tem %s", async (_caso, alteracao) => {
    const tokens = createTestTokens();
    const jwks = { keys: tokens.jwks.keys.map((key) => ({ ...key, ...alteracao })) };
    const verifier = new JwksTokenVerifier(JWKS_URL, (() =>
      Promise.resolve(new Response(JSON.stringify(jwks)))) as typeof fetch);

    await expect(verifier.verify(tokens.customer())).rejects.toBeInstanceOf(InvalidTokenError);
  });
});
