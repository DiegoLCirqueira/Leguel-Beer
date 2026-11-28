import type {
  IssuedUploadPath,
  PhotoStorage,
  PhotoUploadRepository,
} from "../domain/beer-photo.js";

/** Caminhos emitidos em memória, com a mesma regra do banco (admin, validade e uso único). */
export class InMemoryPhotoUploads implements PhotoUploadRepository {
  readonly issued = new Map<string, { adminId: string; expiresAt: Date; used: boolean }>();
  private seq = 0;

  async issue(adminId: string, at: Date): Promise<IssuedUploadPath> {
    this.seq += 1;
    const path = `00000000-0000-4000-8000-${String(this.seq).padStart(12, "0")}.webp`;
    const expiresAt = new Date(at.getTime() + 10 * 60_000);
    this.issued.set(path, { adminId, expiresAt, used: false });
    return { path, expiresAt };
  }

  async consume(path: string, adminId: string, at: Date): Promise<boolean> {
    const entry = this.issued.get(path);
    if (!entry || entry.used || entry.adminId !== adminId || entry.expiresAt <= at) return false;
    entry.used = true;
    return true;
  }
}

export class InMemoryPhotoStorage implements PhotoStorage {
  readonly uploads = new Map<string, Uint8Array>();
  readonly published = new Map<string, Uint8Array>();
  readonly deleted: string[] = [];
  readonly tokens: string[] = [];
  failPublish = false;

  async readUpload(path: string, token: string): Promise<Uint8Array | null> {
    this.tokens.push(token);
    return this.uploads.get(path) ?? null;
  }

  async deleteUpload(path: string, token: string): Promise<void> {
    this.tokens.push(token);
    this.deleted.push(path);
    this.uploads.delete(path);
  }

  async publish(name: string, bytes: Uint8Array, token: string): Promise<string> {
    this.tokens.push(token);
    if (this.failPublish) throw new Error("armazenamento fora");
    if (this.published.has(name)) throw new Error("não sobrescreve");
    this.published.set(name, bytes);
    return `https://storage.test/public/cervejas/${name}`;
  }
}
