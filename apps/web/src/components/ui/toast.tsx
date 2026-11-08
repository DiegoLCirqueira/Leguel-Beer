"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ToastProps = {
  mensagem: string;
  /** Ação do toast, como "Desfazer": roda e fecha o toast. */
  acao?: { rotulo: string; aoAcionar: () => void };
  aoFechar: () => void;
  /** Tempo até sumir sozinho; 5 segundos por padrão ([[adicionar-do-card]]). */
  duracaoMs?: number;
  className?: string;
};

/** Aviso rápido acima da barra da loja: anunciado a leitores de tela e some sozinho. */
export function Toast({ mensagem, acao, aoFechar, duracaoMs = 5000, className }: ToastProps) {
  const fechar = useRef(aoFechar);
  const fechado = useRef(false);
  const restante = useRef(duracaoMs);
  const [sobre, setSobre] = useState(false);
  const [comFoco, setComFoco] = useState(false);
  const pausado = sobre || comFoco;
  useEffect(() => {
    fechar.current = aoFechar;
  });

  const encerrar = () => {
    if (fechado.current) return;
    fechado.current = true;
    fechar.current();
  };

  // Mensagem nova (ou duração nova): o contador recomeça e o toast pode fechar de novo.
  useEffect(() => {
    restante.current = duracaoMs;
    fechado.current = false;
  }, [mensagem, duracaoMs]);

  // Conta o tempo que resta; com mouse ou foco em cima o relógio para e guarda o que sobrou.
  useEffect(() => {
    if (pausado) return;
    const inicio = Date.now();
    const espera = setTimeout(() => {
      if (fechado.current) return;
      fechado.current = true;
      fechar.current();
    }, restante.current);
    return () => {
      clearTimeout(espera);
      restante.current -= Date.now() - inicio;
    };
  }, [mensagem, duracaoMs, pausado]);

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setSobre(true)}
      onMouseLeave={() => setSobre(false)}
      onFocus={() => setComFoco(true)}
      onBlur={() => setComFoco(false)}
      className={cn(
        "fixed inset-x-4 bottom-[calc(var(--altura-barra-loja,0px)+env(safe-area-inset-bottom,0px)+0.75rem)] z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border-2 border-primaria bg-fundo px-4 py-3 text-texto shadow-lg",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primaria text-texto-na-primaria"
      >
        <Check className="size-5" strokeWidth={3} />
      </span>
      <p className="min-w-0 flex-1 font-semibold">{mensagem}</p>
      {acao ? (
        <button
          type="button"
          onClick={() => {
            acao.aoAcionar();
            encerrar();
          }}
          className="inline-flex min-h-11 items-center px-2 font-semibold text-primaria underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          {acao.rotulo}
        </button>
      ) : null}
    </div>
  );
}
