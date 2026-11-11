"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { cliqueSimples, destinoNoNavegador } from "@/lib/destino-no-navegador";
import { ESTILO_BOTAO_VOLTAR } from "./estilo-botao-voltar";
import { LinkGeladeira } from "./link-geladeira";

type Props = { count: number; voltarHref?: string };

const semAssinatura = () => () => {};

/** Cabeçalho da página de produto: Voltar à esquerda e a Geladeira com o contador à direita (44 px). */
export function ProdutoHeader({ count, voltarHref = "/catalogo" }: Props) {
  // O destino depende do navegador (referrer, história e entrada de navegação): no servidor vale a reserva.
  const destino = useSyncExternalStore(
    semAssinatura,
    () => destinoNoNavegador(voltarHref),
    () => voltarHref,
  );
  return (
    <header className="flex items-center justify-between px-4 pt-3">
      <Link
        href={destino === "voltar" ? voltarHref : destino}
        aria-label="Voltar"
        className={ESTILO_BOTAO_VOLTAR}
        onClick={(evento) => {
          // Veio de outra página do site e há para onde voltar: volta pelo histórico (sem gravar nada).
          if (destino !== "voltar" || !cliqueSimples(evento)) return;
          evento.preventDefault();
          window.history.back();
        }}
      >
        <ChevronLeft aria-hidden="true" className="size-6" />
      </Link>
      <LinkGeladeira count={count} />
    </header>
  );
}
