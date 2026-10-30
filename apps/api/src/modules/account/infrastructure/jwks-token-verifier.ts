import { createPublicKey, verify, type JsonWebKey } from "node:crypto";
import {
  InvalidTokenError,
  type AuthenticatedUser,
  type TokenVerifier,
} from "../domain/token-verifier.js";

const CACHE_TTL_MS = 10 * 60_000;
const REFETCH_COOLDOWN_MS = 30_000;

interface Jwk extends JsonWebKey {
  kid?: string;
  alg?: string;
}

interface Header {
  alg?: string;
  kid?: string;
}

interface Claims {
  sub?: unknown;
  email?: unknown;
  exp?: unknown;
  nbf?: unknown;
  role?: unknown;
  iss?: unknown;
  aud?: unknown;
}

const isObject = (value: unknown): boolean =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A chave tem de servir ao algoritmo do header: ES256 pede EC P-256, RS256 pede RSA, e um `alg` na chave tem de ser o mesmo. */
function matchesAlgorithm(jwk: Jwk, alg: string): boolean {
  if (jwk.alg !== undefined && jwk.alg !== alg) return false;
  return alg === "ES256" ? jwk.kty === "EC" && jwk.crv === "P-256" : jwk.kty === "RSA";
}

const decode = <T>(part: string): T => JSON.parse(Buffer.from(part, "base64url").toString()) as T;

/**
 * Valida o JWT do Supabase Auth pelas chaves públicas do JWKS (cache em memória).
 * Aceita só chaves assimétricas (ES256 e RS256): o segredo compartilhado (HS256) é recusado.
 */
export class JwksTokenVerifier implements TokenVerifier {
  private keys: Jwk[] = [];
  private fetchedAt = 0;

  constructor(
    private readonly jwksUrl: string,
    private readonly issuer: string,
    private readonly fetchFn: typeof fetch = fetch,
    private readonly now: () => number = Date.now,
  ) {}

  async verify(token: string): Promise<AuthenticatedUser> {
    const parts = token.split(".");
    if (parts.length !== 3) throw new InvalidTokenError("formato");
    const [headerPart, payloadPart, signaturePart] = parts as [string, string, string];

    let header: Header;
    let claims: Claims;
    try {
      header = decode<Header>(headerPart);
      claims = decode<Claims>(payloadPart);
    } catch {
      throw new InvalidTokenError("formato");
    }
    if (!isObject(header) || !isObject(claims)) throw new InvalidTokenError("formato");
    if (header.alg !== "ES256" && header.alg !== "RS256") throw new InvalidTokenError("algoritmo");

    const jwk = await this.findKey(header.kid);
    if (!jwk) throw new InvalidTokenError("chave desconhecida");
    if (!matchesAlgorithm(jwk, header.alg)) throw new InvalidTokenError("chave incompatível");

    const valid = verify(
      "sha256",
      Buffer.from(`${headerPart}.${payloadPart}`),
      header.alg === "ES256"
        ? { key: createPublicKey({ key: jwk, format: "jwk" }), dsaEncoding: "ieee-p1363" }
        : createPublicKey({ key: jwk, format: "jwk" }),
      Buffer.from(signaturePart, "base64url"),
    );
    if (!valid) throw new InvalidTokenError("assinatura");

    const nowSeconds = this.now() / 1000;
    if (typeof claims.exp !== "number" || claims.exp <= nowSeconds)
      throw new InvalidTokenError("expirado");
    if (typeof claims.nbf === "number" && claims.nbf > nowSeconds)
      throw new InvalidTokenError("ainda não válido");
    if (claims.iss !== this.issuer || claims.aud !== "authenticated")
      throw new InvalidTokenError("emissor ou audiência");
    if (claims.role !== "authenticated" || typeof claims.sub !== "string")
      throw new InvalidTokenError("não é de uma conta autenticada");

    // O produto só tem conta de e-mail e senha: token sem e-mail não é de uma conta nossa.
    if (typeof claims.email !== "string" || claims.email === "")
      throw new InvalidTokenError("sem e-mail");

    return { id: claims.sub, email: claims.email };
  }

  private async findKey(kid: string | undefined): Promise<Jwk | undefined> {
    const find = () => this.keys.find((k) => k.kid === kid);
    const age = this.now() - this.fetchedAt;
    if (age > CACHE_TTL_MS || (!find() && age > REFETCH_COOLDOWN_MS)) await this.refresh();
    return find();
  }

  private async refresh(): Promise<void> {
    try {
      const response = await this.fetchFn(this.jwksUrl);
      if (!response.ok) return;
      const body = (await response.json()) as { keys?: Jwk[] };
      this.keys = body.keys ?? [];
    } catch {
      // Sem JWKS não há chave: o token é recusado (falha fechada).
    } finally {
      this.fetchedAt = this.now();
    }
  }
}
