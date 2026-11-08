import type { CatalogoQuery } from "@leguele/shared";

/** Filtros e ordem na URL: só o que foge do padrão, sempre na mesma ordem (link compartilhável). */
export function paraQueryString(query: CatalogoQuery): string {
  const params = new URLSearchParams();
  if (query.categoria) params.set("categoria", query.categoria);
  if (query.teor) params.set("teor", query.teor);
  if (query.ibu) params.set("ibu", query.ibu);
  if (query.preco) params.set("preco", query.preco);
  if (query.disponiveis) params.set("disponiveis", "true");
  if (query.ordem !== "relevancia") params.set("ordem", query.ordem);
  return params.toString();
}

/** Quantos filtros do sheet estão ativos: a categoria (chips) e a ordem não entram na conta. */
export function contarFiltros(query: CatalogoQuery): number {
  return [query.teor, query.ibu, query.preco].filter(Boolean).length + (query.disponiveis ? 1 : 0);
}
