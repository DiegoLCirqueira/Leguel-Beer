import { createPublicKey, verify } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createTestTokens } from "./tokens.js";

function decode(token: string) {
  const [header, payload, signature] = token.split(".") as [string, string, string];
  return {
    header: JSON.parse(Buffer.from(header, "base64url").toString()) as Record<string, unknown>,
    payload: JSON.parse(Buffer.from(payload, "base64url").toString()) as Record<string, unknown>,
    signature,
    signedPart: `${header}.${payload}`,
  };
}

function signatureIsValid(token: string, jwks: { keys: object[] }): boolean {
  const { signedPart, signature } = decode(token);
  const key = createPublicKey({ key: jwks.keys[0] as never, format: "jwk" });
  return verify(
    "sha256",
    Buffer.from(signedPart),
    { key, dsaEncoding: "ieee-p1363" },
    Buffer.from(signature, "base64url"),
  );
}

describe("createTestTokens", () => {
  it("publica a chave pública ES256 num JWKS e assina o token de cliente com ela", () => {
    const tokens = createTestTokens();

    const { header, payload } = decode(tokens.customer());

    expect(tokens.jwks.keys).toHaveLength(1);
    expect(tokens.jwks.keys[0]).toMatchObject({ kty: "EC", alg: "ES256", use: "sig" });
    expect(tokens.jwks.keys[0]).not.toHaveProperty("d");
    expect(header).toMatchObject({ alg: "ES256", kid: tokens.jwks.keys[0]?.kid });
    expect(payload).toMatchObject({ sub: tokens.customerId, role: "authenticated" });
    expect(Number(payload["exp"])).toBeGreaterThan(Date.now() / 1000);
    expect(signatureIsValid(tokens.customer(), tokens.jwks)).toBe(true);
  });

  it("gera o token do admin com outra conta", () => {
    const tokens = createTestTokens();

    expect(decode(tokens.admin()).payload["sub"]).toBe(tokens.adminId);
    expect(tokens.adminId).not.toBe(tokens.customerId);
    expect(signatureIsValid(tokens.admin(), tokens.jwks)).toBe(true);
  });

  it("gera um token expirado, com assinatura válida", () => {
    const tokens = createTestTokens();

    const { payload } = decode(tokens.expired());

    expect(Number(payload["exp"])).toBeLessThan(Date.now() / 1000);
    expect(signatureIsValid(tokens.expired(), tokens.jwks)).toBe(true);
  });

  it("gera um token adulterado, com a assinatura inválida", () => {
    const tokens = createTestTokens();

    const forged = decode(tokens.tampered());

    expect(forged.payload["sub"]).toBe(tokens.adminId);
    expect(signatureIsValid(tokens.tampered(), tokens.jwks)).toBe(false);
  });

  it("gera um token HS256 para o caso de recusa do segredo compartilhado", () => {
    const tokens = createTestTokens();

    expect(decode(tokens.hs256()).header["alg"]).toBe("HS256");
  });

  it("emite iss e aud do Supabase e aceita sobrescrever claims para os casos de recusa", () => {
    const tokens = createTestTokens("http://127.0.0.1:54321/auth/v1");

    expect(decode(tokens.customer()).payload).toMatchObject({
      iss: "http://127.0.0.1:54321/auth/v1",
      aud: "authenticated",
    });
    const outro = decode(tokens.custom({ iss: "https://outro.test/auth/v1", aud: "anon" }));
    expect(outro.payload).toMatchObject({ iss: "https://outro.test/auth/v1", aud: "anon" });
    expect(outro.payload["sub"]).toBe(tokens.customerId);
    expect(signatureIsValid(tokens.custom({ aud: "anon" }), tokens.jwks)).toBe(true);
  });
});
