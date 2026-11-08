"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";

export type BottomSheetProps = {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
  /** Fica fixo embaixo do painel; o conteúdo rola por dentro quando a tela é baixa. */
  rodape?: ReactNode;
};

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focaveis = (raiz: HTMLElement | null) =>
  Array.from(raiz?.querySelectorAll<HTMLElement>(FOCAVEIS) ?? []);

/** Painel que sobe da base da tela: diálogo modal que fecha com Esc e ao tocar no fundo. */
export function BottomSheet({ aberto, aoFechar, titulo, children, rodape }: BottomSheetProps) {
  const idTitulo = useId();
  const fechar = useRef(aoFechar);
  useEffect(() => {
    fechar.current = aoFechar;
  });

  const painel = useRef<HTMLDivElement>(null);

  // Ao abrir: trava a rolagem da página e leva o foco para dentro; ao fechar, devolve os dois.
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (focaveis(painel.current)[0] ?? painel.current)?.focus();
    return () => {
      document.body.style.overflow = overflowAnterior;
      anterior?.focus();
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    function aoApertar(evento: KeyboardEvent) {
      if (evento.key === "Escape") fechar.current();
      if (evento.key !== "Tab") return;
      const itens = focaveis(painel.current);
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      if (!primeiro || !ultimo) return;
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }
    document.addEventListener("keydown", aoApertar);
    return () => document.removeEventListener("keydown", aoApertar);
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div
      data-testid="fundo-do-sheet"
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar();
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
    >
      <div
        ref={painel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="flex max-h-[calc(100dvh-0.5rem)] outline-none w-full max-w-md flex-col rounded-t-3xl border border-b-0 border-primaria/60 bg-fundo text-texto"
      >
        <div aria-hidden="true" className="mx-auto mt-2 h-1 w-12 rounded-full bg-texto/70" />
        <h2 id={idTitulo} className="px-5 pb-3 pt-3 text-xl font-semibold">
          {titulo}
        </h2>
        <div className="min-h-0 flex-1 overflow-y-auto px-5">{children}</div>
        {rodape ? (
          <div className="border-t border-borda px-5 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-3">
            {rodape}
          </div>
        ) : null}
      </div>
    </div>
  );
}
