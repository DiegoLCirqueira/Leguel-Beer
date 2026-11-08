import type { CatalogoResponse, CervejaCard, DestaquesResponse } from "@leguele/shared";
import type { CatalogResult } from "../application/list-beers.js";
import { availableQuantity, isSoldOut, type Beer } from "../domain/beer.js";

export function toCervejaCard(beer: Beer): CervejaCard {
  return {
    id: beer.id,
    slug: beer.slug,
    nome: beer.name,
    estilo: beer.style,
    categoria: { slug: beer.category.slug, nome: beer.category.name, ordem: beer.category.order },
    teorAlcoolico: beer.abv,
    ibu: beer.ibu,
    volumeMl: beer.volumeMl,
    precoCentavos: beer.priceCents,
    destaque: beer.featured,
    quantidadeDisponivel: availableQuantity(beer),
    esgotada: isSoldOut(beer),
    imagemUrl: beer.imageUrl,
    cadastradaEm: beer.createdAt.toISOString(),
  };
}

export function toCatalogoResponse(result: CatalogResult): CatalogoResponse {
  return {
    itens: result.items.map(toCervejaCard),
    total: result.total,
    categorias: result.categories.map((category) => ({
      slug: category.slug,
      nome: category.name,
      ordem: category.order,
      quantidade: category.quantity,
    })),
  };
}

export function toDestaquesResponse(beers: readonly Beer[]): DestaquesResponse {
  return { itens: beers.map(toCervejaCard) };
}
