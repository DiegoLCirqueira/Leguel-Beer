"use client";

import { ArrowRight, Info, Link2, UserPlus, UserRound } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { markGuest } from "@/lib/guest";
import { cn } from "@/lib/utils";

const HINT =
  "Sua sessão continua ativa neste aparelho por até 30 dias, mesmo depois de fechar o navegador.";

export function WelcomeActions() {
  const [keepConnected, setKeepConnected] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const hintId = useId();

  return (
    <div className="flex w-full shrink-0 flex-col items-center gap-2">
      <Link
        href={`/entrar?manter-conectado=${keepConnected ? 1 : 0}`}
        className={cn(buttonVariants({ variant: "primary" }), "w-[88%] text-[15px]")}
      >
        <UserRound aria-hidden="true" className="size-5" />
        Entrar
        <ArrowRight aria-hidden="true" className="size-5" />
      </Link>
      <Link
        href="/criar-conta"
        className={cn(buttonVariants({ variant: "outline" }), "w-[88%] text-[15px]")}
      >
        <UserPlus aria-hidden="true" className="size-5" />
        Criar conta
      </Link>
      <div className="flex w-[88%] items-center gap-3 text-xs text-texto-suave">
        <span aria-hidden="true" className="h-px flex-1 bg-borda" />
        <p>ou</p>
        <span aria-hidden="true" className="h-px flex-1 bg-borda" />
      </div>
      <Link
        href="/"
        onClick={markGuest}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-[72%] whitespace-nowrap text-[13px]",
        )}
      >
        <Link2 aria-hidden="true" className="size-5" />
        Continuar como convidado
      </Link>
      <div className="relative flex items-center gap-1 text-xs">
        <label className="flex min-h-11 cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={keepConnected}
            onChange={(event) => setKeepConnected(event.target.checked)}
            className="size-5 accent-primaria focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
          />
          Manter-me conectado
        </label>
        <button
          type="button"
          aria-label="Saiba mais sobre Manter-me conectado"
          aria-expanded={showHint}
          aria-controls={hintId}
          onClick={() => setShowHint((shown) => !shown)}
          className="inline-flex size-11 items-center justify-center rounded-full text-texto-suave focus-visible:outline-2 focus-visible:outline-primaria"
        >
          <Info aria-hidden="true" className="size-4" />
        </button>
        <div
          id={hintId}
          aria-live="polite"
          className="absolute bottom-full left-1/2 z-20 w-64 -translate-x-1/2 rounded-campo border border-borda bg-superficie px-3 py-2 text-center text-xs text-texto-suave empty:hidden"
        >
          {showHint ? HINT : null}
        </div>
      </div>
    </div>
  );
}
