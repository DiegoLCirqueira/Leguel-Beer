"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepperProps = {
  valor: number;
  aoAlterar: (valor: number) => void;
  min?: number;
  max?: number;
  /** Nome do grupo para leitores de tela, ex.: "Quantidade de Maré Alta IPA". */
  rotulo: string;
  className?: string;
};

const BOTAO =
  "flex size-11 items-center justify-center rounded-full text-primaria transition-colors hover:bg-primaria/10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primaria disabled:opacity-40 disabled:hover:bg-transparent";

/** Seletor de quantidade (− 1 +): reusado pelo produto e pela Geladeira; alvos de 44 px. */
export function Stepper({ valor, aoAlterar, min = 1, max, rotulo, className }: StepperProps) {
  return (
    <div
      role="group"
      aria-label={rotulo}
      className={cn(
        "inline-flex items-center rounded-full border-2 border-primaria text-texto",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={valor <= min}
        onClick={() => aoAlterar(valor - 1)}
        className={BOTAO}
      >
        <Minus aria-hidden="true" className="size-5" />
      </button>
      <span className="min-w-8 text-center text-lg font-semibold tabular-nums">{valor}</span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={max !== undefined && valor >= max}
        onClick={() => aoAlterar(valor + 1)}
        className={BOTAO}
      >
        <Plus aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}
