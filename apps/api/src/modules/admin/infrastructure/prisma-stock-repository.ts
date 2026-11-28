import type { AjusteDeEstoque } from "@leguele/shared";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { StockItem, StockMovement, StockRepository } from "../domain/stock.js";

export class PrismaStockRepository implements StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(at: Date): Promise<StockItem[]> {
    void this.prisma;
    void at;
    return [];
  }

  async movements(beerId: string): Promise<StockMovement[] | null> {
    void beerId;
    return null;
  }

  async adjust(
    beerId: string,
    actorId: string,
    adjustment: AjusteDeEstoque,
    at: Date,
  ): Promise<StockMovement | null> {
    void beerId;
    void actorId;
    void adjustment;
    void at;
    return null;
  }
}
