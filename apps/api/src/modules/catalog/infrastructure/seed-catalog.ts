import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import { SEED_CATEGORIES } from "./seed-catalog-data.js";

/**
 * Seed de desenvolvimento do catálogo: 4 categorias e 16 cervejas. Idempotente: casa por `slug` e
 * reaplica os dados do seed (o seed é a fonte dos dados de desenvolvimento). Só toca categorias e
 * cervejas; contas e perfis não são lidos nem alterados.
 */
export async function seedCatalog(prisma: PrismaService): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const { beers, ...category } of SEED_CATEGORIES) {
      const { id: categoryId } = await tx.category.upsert({
        where: { slug: category.slug },
        create: category,
        update: category,
      });
      for (const beer of beers) {
        const data = { ...beer, categoryId };
        await tx.beer.upsert({ where: { slug: beer.slug }, create: data, update: data });
      }
    }
  });
}
