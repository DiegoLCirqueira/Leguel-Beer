import Image from "next/image";

export type ImagemDaGarrafaProps = {
  imagemUrl: string | null;
  categoriaSlug: string;
};

/** Contorno da garrafa (viewBox 33 x 92), o mesmo da garrafa fantasma. */
export const CONTORNO_DA_GARRAFA =
  "M13 3h7v20c0 6 4 9 7 13 3 3 4 7 4 11v39c0 3-2 5-5 5H7c-3 0-5-2-5-5V47c0-4 1-8 4-11 3-4 7-7 7-13z";

/** Cor do selo da categoria; categoria sem selo próprio usa o neutro, como o `StyleBadge`. */
const corDoSelo = (slug: string) =>
  ["ipa", "frutas", "malt", "lager"].includes(slug)
    ? `var(--color-badge-${slug})`
    : "var(--color-badge-neutro)";

/**
 * Foto da garrafa; sem foto, a garrafa sem rótulo na cor do selo da categoria. Preenche a caixa do
 * pai e se apoia na base dela (eixo do balanço); decorativa, o nome fica na faixa da prateleira.
 */
export function ImagemDaGarrafa({ imagemUrl, categoriaSlug }: ImagemDaGarrafaProps) {
  if (imagemUrl) {
    return (
      <Image src={imagemUrl} alt="" fill sizes="80px" className="object-contain object-bottom" />
    );
  }
  return (
    <svg
      viewBox="0 0 33 92"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      className="absolute inset-0 size-full"
    >
      <path d={CONTORNO_DA_GARRAFA} fill={corDoSelo(categoriaSlug)} />
    </svg>
  );
}
