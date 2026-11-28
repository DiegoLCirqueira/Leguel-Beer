import type { PhotoStorage } from "../domain/beer-photo.js";

/** Bucket privado de envio e bucket público das fotos ([[ADR-017-fotos-com-sessao-do-admin]]). */
export const UPLOAD_BUCKET = "cervejas-envio";
export const PUBLIC_BUCKET = "cervejas";

/**
 * Armazenamento de arquivos do Supabase pela API REST, sempre com o token da sessão do admin e a
 * chave pública (anon): nenhuma chave de serviço entra na API. Quem decide é a política do bucket.
 */
export class SupabasePhotoStorage implements PhotoStorage {
  constructor(
    private readonly baseUrl: string,
    private readonly anonKey: string,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  async readUpload(
    path: string,
    token: string,
    maxBytes: number,
  ): Promise<Uint8Array | null | "too-large"> {
    const response = await this.fetchFn(
      `${this.baseUrl}/storage/v1/object/authenticated/${UPLOAD_BUCKET}/${path}`,
      { method: "GET", headers: this.headers(token) },
    );
    if (response.status === 404 || response.status === 400) return null;
    if (!response.ok) throw new Error(`STORAGE_READ_${response.status}`);
    // Recusa pelo cabeçalho, antes de baixar o corpo de um arquivo que já passa do teto.
    const declared = Number(response.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > maxBytes) return "too-large";
    return new Uint8Array(await response.arrayBuffer());
  }

  async deleteUpload(path: string, token: string): Promise<void> {
    const response = await this.fetchFn(
      `${this.baseUrl}/storage/v1/object/${UPLOAD_BUCKET}/${path}`,
      { method: "DELETE", headers: this.headers(token) },
    );
    if (!response.ok && response.status !== 404) {
      throw new Error(`STORAGE_DELETE_${response.status}`);
    }
  }

  async publish(name: string, bytes: Uint8Array, token: string): Promise<string> {
    const response = await this.fetchFn(
      `${this.baseUrl}/storage/v1/object/${PUBLIC_BUCKET}/${name}`,
      {
        method: "POST",
        // Nunca sobrescreve: o nome é novo a cada publicação.
        headers: { ...this.headers(token), "Content-Type": "image/webp", "x-upsert": "false" },
        body: Buffer.from(bytes),
      },
    );
    if (!response.ok) throw new Error(`STORAGE_PUBLISH_${response.status}`);
    return `${this.baseUrl}/storage/v1/object/public/${PUBLIC_BUCKET}/${name}`;
  }

  private headers(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}`, apikey: this.anonKey };
  }
}
