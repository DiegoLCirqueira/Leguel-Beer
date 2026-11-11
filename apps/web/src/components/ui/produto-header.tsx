"use client";

import { ChevronLeft, Refrigerator } from "lucide-react";
import Link from "next/link";
import { ESTILO_BOTAO_VOLTAR } from "./estilo-botao-voltar";

type Props = { count: number; voltarHref?: string };

const veioDoSite = () => {
  try {
    return new URL(document.referrer).origin === window.location.origin;
  } catch {
    return false;
  }
};

/** Cabeçalho da página de produto: Voltar à esquerda e a Geladeira com o contador à direita (44 px). */
export function ProdutoHeader({ count, voltarHref = "/catalogo" }: Props) {
  const itens = `${count} ${count === 1 ? "item" : "itens"}`;
  return (
    <header className="flex items-center justify-between px-4 pt-3">
      <Link
        href={voltarHref}
        aria-label="Voltar"
        className={ESTILO_BOTAO_VOLTAR}
        onClick={(evento) => {
          // Veio de outra página do site (ex.: os destaques da home): volta pelo histórico; senão vale o link.
          if (veioDoSite()) {
            evento.preventDefault();
            window.history.back();
          }
        }}
      >
        <ChevronLeft aria-hidden="true" className="size-6" />
      </Link>
      <Link
        href="/geladeira"
        aria-label={`Geladeira, ${itens}`}
        className="relative flex size-11 items-center justify-center rounded-full text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
      >
        <Refrigerator aria-hidden="true" className="size-7" />
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 flex min-w-5 items-center justify-center rounded-full bg-primaria px-1 text-xs font-bold leading-5 text-texto-na-primaria"
        >
          {count}
        </span>
      </Link>
    </header>
  );
}
