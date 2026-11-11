/**
 * Slugs que são outras rotas de `/catalogo` (a rota fixa vem antes da parametrizada) e por isso nunca
 * são cerveja. O site e a API usam esta lista para não tratá-los como slug de cerveja.
 */
export const SLUGS_RESERVADOS: readonly string[] = ["destaques"];

export function slugReservado(slug: string): boolean {
  return SLUGS_RESERVADOS.includes(slug);
}
