import type { AdminBeer, AdminBeerRepository } from "../domain/admin-beer.js";
import type { PhotoStorage, PhotoUploadRepository } from "../domain/beer-photo.js";

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

  async execute(input: PublishBeerPhotoInput): Promise<AdminBeer | null> {
    void this.beers;
    void this.uploads;
    void this.storage;
    void this.now;
    void this.newName;
    void input;
    return null;
  }
}
