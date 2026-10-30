import { createHmac, generateKeyPairSync, randomUUID, sign } from "node:crypto";

type Claims = Record<string, unknown> & { sub: string; email: string };

const encode = (value: object): string => Buffer.from(JSON.stringify(value)).toString("base64url");

/**
 * Tokens de teste no formato do Supabase local: ES256, com a chave pública publicada num JWKS falso.
 * A chave privada nasce a cada chamada e nunca sai deste objeto.
 */
export function createTestTokens(issuer = "http://127.0.0.1:54321/auth/v1") {
  const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const kid = randomUUID();
  const jwks = {
    keys: [{ ...publicKey.export({ format: "jwk" }), kid, alg: "ES256", use: "sig" }],
  };
  const customerId = randomUUID();
  const adminId = randomUUID();

  const now = () => Math.floor(Date.now() / 1000);

  function es256(claims: Claims): string {
    const signedPart = `${encode({ alg: "ES256", typ: "JWT", kid })}.${encode({
      role: "authenticated",
      aud: "authenticated",
      iss: issuer,
      exp: now() + 3600,
      ...claims,
    })}`;
    const signature = sign("sha256", Buffer.from(signedPart), {
      key: privateKey,
      dsaEncoding: "ieee-p1363",
    });
    return `${signedPart}.${signature.toString("base64url")}`;
  }

  function hs256(claims: Claims): string {
    const signedPart = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
      role: "authenticated",
      aud: "authenticated",
      iss: issuer,
      exp: now() + 3600,
      ...claims,
    })}`;
    const signature = createHmac("sha256", randomUUID()).update(signedPart).digest("base64url");
    return `${signedPart}.${signature}`;
  }

  return {
    jwks,
    issuer,
    customerId,
    adminId,
    customer: () => es256({ sub: customerId, email: "cliente@leguele.test" }),
    admin: () => es256({ sub: adminId, email: "admin@leguele.test" }),
    /** Token do cliente com claims sobrescritas, para os casos de recusa (iss, aud...). */
    custom: (claims: Record<string, unknown>) =>
      es256({ sub: customerId, email: "cliente@leguele.test", ...claims }),
    expired: () => es256({ sub: customerId, email: "cliente@leguele.test", exp: now() - 60 }),
    // Corpo de admin com a assinatura de outro token: a verificação tem que recusar.
    tampered: () => {
      const [header, , signature] = es256({ sub: customerId, email: "cliente@leguele.test" }).split(
        ".",
      ) as [string, string, string];
      const payload = encode({
        role: "authenticated",
        aud: "authenticated",
        iss: issuer,
        exp: now() + 3600,
        sub: adminId,
      });
      return `${header}.${payload}.${signature}`;
    },
    hs256: () => hs256({ sub: customerId, email: "cliente@leguele.test" }),
  };
}
