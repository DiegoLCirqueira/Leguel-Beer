import { ehWebp, FOTO_TAMANHO_MAXIMO_BYTES } from "@leguele/shared";
import type { AdminBeer, AdminBeerRepository } from "../domain/admin-beer.js";
import {
  InvalidPhotoError,
  PhotoPathInvalidError,
  type PhotoStorage,
  type PhotoUploadRepository,
} from "../domain/beer-photo.js";

export interface PublishBeerPhotoInput {
  beerId: string;
  adminId: string;
  /** Token da sessão do admin: o armazenamento confere o papel pela política, não pela API. */
  token: string;
  path: string;
}

/** Publica a foto enviada: confere, copia para o bucket público, apaga o envio e grava o endereço. */
export class PublishBeerPhoto {
  constructor(
    private readonly beers: AdminBeerRepository,
    private readonly uploads: PhotoUploadRepository,
    private readonly storage: PhotoStorage,
    private readonly now: () => Date,
    private readonly newName: () => string,
  ) {}

  /** `null` se a cerveja não existe (o caminho não é gasto). */
  async execute(input: PublishBeerPhotoInput): Promise<AdminBeer | null> {
    if (!(await this.beers.find(input.beerId))) return null;
    // Um caminho vale uma vez, para o admin que o recebeu, dentro dos 10 minutos.
    if (!(await this.uploads.consume(input.path, input.adminId, this.now()))) {
      throw new PhotoPathInvalidError();
    }

    const bytes = await this.storage.readUpload(input.path, input.token);
    if (!bytes) throw new InvalidPhotoError();
    // Os bytes decidem, não o tipo nem a extensão declarados.
    if (bytes.length > FOTO_TAMANHO_MAXIMO_BYTES || !ehWebp(bytes)) {
      await this.storage.deleteUpload(input.path, input.token);
      throw new InvalidPhotoError();
    }

    const url = await this.storage.publish(`${this.newName()}.webp`, bytes, input.token);
    await this.storage.deleteUpload(input.path, input.token);
    return this.beers.setImage(input.beerId, url);
  }
}
