import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import { SEED_CATEGORIES } from "./seed-catalog-data.js";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function isLocal(url: string): boolean {
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

/**
 * Seed de desenvolvimento do catálogo: 4 categorias e 16 cervejas. Idempotente: casa por `slug` e
 * reaplica os dados do seed (o seed é a fonte dos dados de desenvolvimento). Só toca categorias e
 * cervejas; contas e perfis não são lidos nem alterados.
 */
export async function seedCatalog(
  prisma: PrismaService,
  env: { DATABASE_URL?: string | undefined } = process.env,
): Promise<void> {
  if (env.DATABASE_URL && !isLocal(env.DATABASE_URL)) {
    throw new Error("O seed do catálogo só roda contra o banco local: DATABASE_URL não é local");
  }
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
