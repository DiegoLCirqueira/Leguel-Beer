/** Caminho de envio emitido pela API: um arquivo, um admin, 10 minutos. */
export interface IssuedUploadPath {
  path: string;
  expiresAt: Date;
}

export interface PhotoUploadRepository {
  issue(adminId: string, at: Date): Promise<IssuedUploadPath>;
  /**
   * Gasta o caminho: só vale se foi emitido a este admin, ainda não venceu e nunca foi usado. Uma
   * única chamada vê `true` (a corrida é decidida no próprio UPDATE).
   */
  consume(path: string, adminId: string, at: Date): Promise<boolean>;
}

/** O armazenamento de arquivos; sempre com o token da sessão do admin, nunca uma chave de serviço. */
export interface PhotoStorage {
  /** Os bytes do arquivo no bucket privado; `null` se não existe. */
  readUpload(path: string, token: string): Promise<Uint8Array | null>;
  deleteUpload(path: string, token: string): Promise<void>;
  /** Grava no bucket público com este nome (sem sobrescrever) e devolve o endereço público. */
  publish(name: string, bytes: Uint8Array, token: string): Promise<string>;
}

/** O caminho não foi emitido a este admin, venceu ou já foi usado. */
export class PhotoPathInvalidError extends Error {
  constructor() {
    super("O envio da foto expirou. Envie a foto de novo.");
    this.name = "PhotoPathInvalidError";
  }
}

/** O arquivo não é um WebP de até 40 KB (ou nunca chegou ao armazenamento). */
export class InvalidPhotoError extends Error {
  constructor() {
    super("Não conseguimos usar esta foto. Envie uma imagem WebP de até 40 KB.");
    this.name = "InvalidPhotoError";
  }
}
