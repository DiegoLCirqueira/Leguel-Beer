import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import { SEED_CATEGORIES } from "./seed-catalog-data.js";

/** Seed de desenvolvimento do catálogo: 4 categorias e 16 cervejas. */
export async function seedCatalog(prisma: PrismaService): Promise<void> {
  for (const { beers, ...category } of SEED_CATEGORIES) {
    await prisma.category.create({
      data: { ...category, beers: { create: beers } },
    });
  }
}
