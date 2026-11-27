"use client";

import { CONTORNO_DA_GARRAFA } from "./imagem-da-garrafa";

export type GarrafaFantasmaProps = {
  categoria: { slug: string; nome: string };
  /** Abre a lista de adicionar da categoria; recebe o botão tocado, para devolver o foco a ele. */
  aoTocar?: (categoria: { slug: string; nome: string }, botao: HTMLElement) => void;
};

/** Posição livre da prateleira: silhueta tracejada com "+" que abre a lista de adicionar da categoria. */
export function GarrafaFantasma({ categoria, aoTocar }: GarrafaFantasmaProps) {
  return (
    <button
      type="button"
      onClick={(evento) => aoTocar?.(categoria, evento.currentTarget)}
      aria-label={`Adicionar ${categoria.nome}`}
      className="group absolute left-1/2 top-1/2 h-[max(100%,44px)] w-[max(100%,44px)] -translate-x-1/2 -translate-y-1/2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
    >
      <svg
        viewBox="0 0 33 92"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        className="size-full"
      >
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
    </button>
  );
}
