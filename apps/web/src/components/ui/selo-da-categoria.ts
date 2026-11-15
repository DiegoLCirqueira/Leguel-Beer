/**
 * Fonte única de slug da categoria → token do selo: a classe do `StyleBadge` e a cor da garrafa
 * padrão saem daqui. Categoria sem selo próprio usa o neutro.
 */
const SELOS = {
  ipa: { fundo: "bg-badge-ipa", cor: "var(--color-badge-ipa)" },
  frutas: {
    fundo: "bg-badge-frutas text-texto-na-primaria",
    cor: "var(--color-badge-frutas)",
  },
  malt: { fundo: "bg-badge-malt", cor: "var(--color-badge-malt)" },
  lager: { fundo: "bg-badge-lager", cor: "var(--color-badge-lager)" },
} as const;

const NEUTRO = { fundo: "bg-badge-neutro", cor: "var(--color-badge-neutro)" };

export const seloDaCategoria = (slug: string): { fundo: string; cor: string } =>
  (SELOS as Record<string, { fundo: string; cor: string }>)[slug] ?? NEUTRO;
