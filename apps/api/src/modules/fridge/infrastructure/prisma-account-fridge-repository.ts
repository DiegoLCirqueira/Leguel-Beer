import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import {
  FridgeOwnerNotFoundError,
  type AccountFridgeRepository,
  type StoredFridgeItem,
} from "../domain/account-fridge-repository.js";

export class PrismaAccountFridgeRepository implements AccountFridgeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(profileId: string): Promise<StoredFridgeItem[]> {
    const items = await this.prisma.fridgeItem.findMany({
      where: { fridge: { profileId } },
      orderBy: { position: "asc" },
    });
    return items.map(({ beerId, quantity, seenPriceCents }) => ({
      beerId,
      quantity,
      seenPriceCents,
    }));
  }

  async replace(profileId: string, items: readonly StoredFridgeItem[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const owner = await tx.profile.findUnique({ where: { id: profileId }, select: { id: true } });
      if (!owner) throw new FridgeOwnerNotFoundError();
      const fridge = await tx.fridge.upsert({
        where: { profileId },
        update: {},
        create: { profileId },
      });
      await tx.fridgeItem.deleteMany({ where: { fridgeId: fridge.id } });
      await tx.fridgeItem.createMany({
        data: items.map((item, position) => ({ ...item, fridgeId: fridge.id, position })),
      });
    });
  }
}
