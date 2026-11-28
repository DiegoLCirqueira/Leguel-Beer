import { randomUUID } from "node:crypto";
import { FOTO_VALIDADE_MINUTOS } from "@leguele/shared";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { IssuedUploadPath, PhotoUploadRepository } from "../domain/beer-photo.js";

export class PrismaPhotoUploadRepository implements PhotoUploadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async issue(adminId: string, at: Date): Promise<IssuedUploadPath> {
    // O nome é gerado aqui, aleatório e novo a cada envio: o cliente nunca escolhe, e nada se sobrescreve.
    const path = `${randomUUID()}.webp`;
    const expiresAt = new Date(at.getTime() + FOTO_VALIDADE_MINUTOS * 60_000);
    // Os caminhos vencidos há mais de um dia não servem mais: a tabela não cresce para sempre.
    await this.prisma.beerPhotoUpload.deleteMany({
      where: { expiresAt: { lt: new Date(at.getTime() - 24 * 3_600_000) } },
    });
    await this.prisma.beerPhotoUpload.create({ data: { path, adminId, expiresAt } });
    return { path, expiresAt };
  }

  async consume(path: string, adminId: string, at: Date): Promise<boolean> {
    // A condição no próprio UPDATE decide a corrida: só uma chamada vê uma linha afetada.
    const { count } = await this.prisma.beerPhotoUpload.updateMany({
      where: { path, adminId, usedAt: null, expiresAt: { gt: at } },
      data: { usedAt: at },
    });
    return count > 0;
  }
}
