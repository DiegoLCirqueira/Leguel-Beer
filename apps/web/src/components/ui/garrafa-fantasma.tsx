import Link from "next/link";
import { CONTORNO_DA_GARRAFA } from "./imagem-da-garrafa";

export type GarrafaFantasmaProps = {
  categoria: { slug: string; nome: string };
};

/** Posição livre da prateleira: silhueta tracejada com "+" que leva ao catálogo da categoria. */
export function GarrafaFantasma({ categoria }: GarrafaFantasmaProps) {
  return (
    <Link
      href={`/catalogo?categoria=${encodeURIComponent(categoria.slug)}`}
      aria-label={`Adicionar ${categoria.nome}`}
      className="group absolute inset-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
    >
      <svg viewBox="0 0 33 92" preserveAspectRatio="none" aria-hidden="true" className="size-full">
        <path
          d={CONTORNO_DA_GARRAFA}
          stroke="var(--color-texto-suave)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          className="fill-fantasma group-hover:stroke-primaria"
        />
        <circle cx="16.5" cy="62" r="8" fill="var(--color-superficie-elevada)" />
        <path
          d="M16.5 57.5v9M12 62h9"
          stroke="var(--color-primaria)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}
