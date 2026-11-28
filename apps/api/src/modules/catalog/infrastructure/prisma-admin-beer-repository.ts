import { gerarSlug, type CriarCerveja, type EditarCerveja } from "@leguele/shared";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import {
  BeerNameTakenError,
  CategoryFullError,
  CategoryNotFoundError,
  MAX_ACTIVE_BEERS_PER_CATEGORY,
  type AdminBeer,
  type AdminBeerFilter,
  type AdminBeerRepository,
} from "../domain/admin-beer.js";

type Tx = Prisma.TransactionClient;

const WITH_CATEGORY = { category: { select: { slug: true, name: true } } } as const;

type Row = Prisma.BeerGetPayload<{ include: typeof WITH_CATEGORY }>;

function toAdminBeer(row: Row): AdminBeer {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: row.category.slug,
    categoryName: row.category.name,
    style: row.style,
    description: row.description,
    priceCents: row.priceCents,
    previousPriceCents: row.previousPriceCents,
    volumeMl: row.volumeMl,
    abv: Number(row.abv),
    ibu: row.ibu,
    stock: row.stock,
    minStock: row.minStock,
    featured: row.featured,
    active: row.active,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt,
  };
}

export class PrismaAdminBeerRepository implements AdminBeerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: AdminBeerFilter): Promise<AdminBeer[]> {
    const busca = filter.busca?.trim();
    const rows = await this.prisma.beer.findMany({
      where: {
        ...(filter.estado === "ativas" ? { active: true } : {}),
        ...(filter.estado === "inativas" ? { active: false } : {}),
        ...(busca ? { name: { contains: escapeLike(busca), mode: "insensitive" } } : {}),
      },
      include: WITH_CATEGORY,
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
    return rows.map(toAdminBeer);
  }

  async find(id: string): Promise<AdminBeer | null> {
    const row = await this.prisma.beer.findUnique({ where: { id }, include: WITH_CATEGORY });
    return row ? toAdminBeer(row) : null;
  }

  async create(input: CriarCerveja, actorId?: string): Promise<AdminBeer> {
    return this.prisma.$transaction(async (tx) => {
      await lockWrites(tx);
      const category = await lockCategory(tx, input.categoriaSlug);
      await ensureNameFree(tx, input.nome);
      if (input.ativa) await ensureRoom(tx, category, null);

      const base = gerarSlug(input.nome, []);
      const taken = await tx.beer.findMany({
        where: { slug: { startsWith: base } },
        select: { slug: true },
      });
      const row = await tx.beer.create({
        data: {
          slug: gerarSlug(
            input.nome,
            taken.map((t) => t.slug),
          ),
          name: input.nome,
          style: input.estilo,
          categoryId: category.id,
          abv: input.teorAlcoolico,
          ibu: input.ibu,
          volumeMl: input.volumeMl,
          priceCents: input.precoCentavos,
          previousPriceCents: input.precoAnteriorCentavos ?? null,
          description: input.descricao ?? null,
          featured: input.destaque,
          active: input.ativa,
          stock: input.estoqueInicial,
          minStock: input.estoqueMinimo,
        },
        include: WITH_CATEGORY,
      });
      if (input.estoqueInicial > 0) {
        await tx.stockMovement.create({
          data: {
            beerId: row.id,
            type: "ENTRY",
            quantity: input.estoqueInicial,
            reason: "Entrada inicial",
            balanceAfter: input.estoqueInicial,
            actorId: actorId ?? null,
          },
        });
      }
      return toAdminBeer(row);
    });
  }

  async update(id: string, input: EditarCerveja): Promise<AdminBeer | null> {
    return this.prisma.$transaction(async (tx) => {
      await lockWrites(tx);
      const current = await tx.beer.findUnique({ where: { id } });
      if (!current) return null;
      const category = await lockCategory(tx, input.categoriaSlug);
      await ensureNameFree(tx, input.nome, id);
      // Só a cerveja que passa a ocupar uma vaga confere o limite: ativar ou mudar de categoria.
      const takesASeat = input.ativa && (!current.active || current.categoryId !== category.id);
      if (takesASeat) await ensureRoom(tx, category, id);

      const row = await tx.beer.update({
        where: { id },
        // O slug e o estoque físico não mudam por aqui.
        data: {
          name: input.nome,
          style: input.estilo,
          categoryId: category.id,
          abv: input.teorAlcoolico,
          ibu: input.ibu,
          volumeMl: input.volumeMl,
          priceCents: input.precoCentavos,
          previousPriceCents: input.precoAnteriorCentavos ?? null,
          description: input.descricao ?? null,
          featured: input.destaque,
          active: input.ativa,
          minStock: input.estoqueMinimo,
        },
        include: WITH_CATEGORY,
      });
      return toAdminBeer(row);
    });
  }
}

/** `%`, `_` e `\` da busca valem como texto, não como curinga do LIKE. */
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, "\\$&");
}

/**
 * Serializa os cadastros e edições do admin (nome único sem diferenciar maiúsculas e slug único
 * não têm índice que decida a corrida). Ordem de travas: esta primeiro, depois a categoria.
 */
async function lockWrites(tx: Tx): Promise<void> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('admin-beers'))`;
}

/** Trava a categoria até o fim da transação: duas gravações na mesma categoria passam uma de cada vez. */
async function lockCategory(tx: Tx, slug: string): Promise<{ id: string; name: string }> {
  const rows = await tx.$queryRaw<{ id: string; name: string }[]>`
    SELECT id::text AS id, name FROM categories WHERE slug = ${slug} FOR UPDATE`;
  const category = rows[0];
  if (!category) throw new CategoryNotFoundError();
  return category;
}

async function ensureNameFree(tx: Tx, name: string, exceptId?: string): Promise<void> {
  const clash = await tx.beer.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(exceptId ? { NOT: { id: exceptId } } : {}),
    },
    select: { id: true },
  });
  if (clash) throw new BeerNameTakenError();
}

async function ensureRoom(
  tx: Tx,
  category: { id: string; name: string },
  exceptId: string | null,
): Promise<void> {
  const active = await tx.beer.count({
    where: {
      categoryId: category.id,
      active: true,
      ...(exceptId ? { NOT: { id: exceptId } } : {}),
    },
  });
  if (active >= MAX_ACTIVE_BEERS_PER_CATEGORY) throw new CategoryFullError(category.name);
}
