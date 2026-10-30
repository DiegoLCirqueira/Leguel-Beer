"use client";

import { ArrowRight, Info, Link2, UserPlus, UserRound } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { buttonVariants } from "@/components/ui/button";

const HINT =
  "Sua sessão continua ativa neste aparelho por até 30 dias, mesmo depois de fechar o navegador.";

export function WelcomeActions() {
  const [keepConnected, setKeepConnected] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const checkboxId = useId();
  const hintId = useId();

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Link
        href={`/entrar?manter-conectado=${keepConnected ? 1 : 0}`}
        className={buttonVariants({ variant: "primary" })}
      >
        <UserRound aria-hidden="true" className="size-5" />
        Entrar
        <ArrowRight aria-hidden="true" className="size-5" />
      </Link>
      <Link href="/criar-conta" className={buttonVariants({ variant: "outline" })}>
        <UserPlus aria-hidden="true" className="size-5" />
        Criar conta
      </Link>
      <p className="text-sm text-texto-suave">ou</p>
      <Link href="/" className={buttonVariants({ variant: "ghost" })}>
        <Link2 aria-hidden="true" className="size-5" />
        Continuar como convidado
      </Link>
      <div className="flex min-h-11 items-center gap-2 text-sm">
        <input
          id={checkboxId}
          type="checkbox"
          checked={keepConnected}
          onChange={(event) => setKeepConnected(event.target.checked)}
          className="size-5 accent-primaria"
        />
        <label htmlFor={checkboxId}>Manter-me conectado</label>
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
      </div>
      <div id={hintId} className="text-center text-xs text-texto-suave">
        {showHint ? HINT : null}
      </div>
    </div>
  );
}
