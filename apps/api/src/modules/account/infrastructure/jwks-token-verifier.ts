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
}

const isObject = (value: unknown): boolean =>
  typeof value === "object" && value !== null && !Array.isArray(value);

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
    if (claims.role !== "authenticated" || typeof claims.sub !== "string")
      throw new InvalidTokenError("não é de uma conta autenticada");

    return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
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
