import type { CaminhoDeEnvioResposta } from "@leguele/shared";
import type { PhotoUploadRepository } from "../domain/beer-photo.js";

/** Emite o caminho de envio da foto: aleatório, de um admin, válido por 10 minutos. */
export class IssuePhotoPath {
  constructor(
    private readonly uploads: PhotoUploadRepository,
    private readonly now: () => Date,
  ) {}

  async execute(adminId: string): Promise<CaminhoDeEnvioResposta> {
    const issued = await this.uploads.issue(adminId, this.now());
    return { caminho: issued.path, expiraEm: issued.expiresAt.toISOString() };
  }
}
