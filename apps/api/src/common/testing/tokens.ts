import { generateKeyPairSync, randomUUID, sign } from "node:crypto";

interface Claims {
  sub: string;
  email: string;
  exp?: number;
}

const encode = (value: object): string => Buffer.from(JSON.stringify(value)).toString("base64url");

/**
 * Tokens de teste no formato do Supabase local: ES256, com a chave pública publicada num JWKS falso.
 * A chave privada nasce a cada chamada e nunca sai deste objeto.
 */
export function createTestTokens() {
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
      exp: now() + 3600,
      ...claims,
    })}`;
    const signature = sign("sha256", Buffer.from(signedPart), {
      key: privateKey,
      dsaEncoding: "ieee-p1363",
    });
    return `${signedPart}.${signature.toString("base64url")}`;
  }

  return {
    jwks,
    customerId,
    adminId,
    customer: () => es256({ sub: customerId, email: "cliente@leguele.test" }),
    admin: () => es256({ sub: adminId, email: "admin@leguele.test" }),
  };
}
