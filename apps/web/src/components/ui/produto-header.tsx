"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ESTILO_BOTAO_VOLTAR } from "./estilo-botao-voltar";
import { LinkGeladeira } from "./link-geladeira";

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
      <LinkGeladeira count={count} />
    </header>
  );
}
