import type { Prisma } from "../../../generated/prisma/client.js";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import {
  FridgeOwnerNotFoundError,
  type AccountFridgeRepository,
  type FridgeUpdate,
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
      if (!(await lockOwner(tx, profileId))) throw new FridgeOwnerNotFoundError();
      await writeItems(tx, profileId, items);
    });
  }

  async update<T>(
    profileId: string,
    decide: (current: StoredFridgeItem[]) => FridgeUpdate<T> | Promise<FridgeUpdate<T>>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const locked = await lockOwner(tx, profileId);
      const rows = locked
        ? await tx.fridgeItem.findMany({
            where: { fridge: { profileId } },
            orderBy: { position: "asc" },
          })
        : [];
      const outcome = await decide(
        rows.map(({ beerId, quantity, seenPriceCents }) => ({ beerId, quantity, seenPriceCents })),
      );
      if (outcome.items) {
        if (!locked) throw new FridgeOwnerNotFoundError();
        await writeItems(tx, profileId, outcome.items);
      }
      return outcome.result;
    });
  }
}

async function writeItems(
  tx: Prisma.TransactionClient,
  profileId: string,
  items: readonly StoredFridgeItem[],
): Promise<void> {
  const fridge = await tx.fridge.upsert({
    where: { profileId },
    update: {},
    create: { profileId },
  });
  await tx.fridgeItem.deleteMany({ where: { fridgeId: fridge.id } });
  await tx.fridgeItem.createMany({
    data: items.map((item, position) => ({ ...item, fridgeId: fridge.id, position })),
  });
}

/**
 * Trava a linha do perfil até o fim da transação: as operações da mesma conta passam uma de cada
 * vez, então duas gravações simultâneas não se atropelam (vale a última a entrar). Devolve falso
 * quando a conta não tem perfil: não há linha para travar e não há onde guardar a Geladeira.
 */
async function lockOwner(tx: Prisma.TransactionClient, profileId: string): Promise<boolean> {
  const rows = await tx.$queryRaw<{ id: string }[]>`
    SELECT id FROM profiles WHERE id = ${profileId}::uuid FOR UPDATE`;
  return rows.length > 0;
}
