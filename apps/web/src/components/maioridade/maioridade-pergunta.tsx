"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AVISOS_RODAPE } from "@/lib/avisos";

type Props = {
  retorno: string;
  confirmar: (formData: FormData) => void | Promise<void>;
};

export function MaioridadePergunta({ retorno, confirmar }: Props) {
  const [negado, setNegado] = useState(false);

  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-fundo px-6 py-10 text-center">
      <Image
        src="/maioridade/folhagem-topo.webp"
        alt=""
        width={420}
        height={351}
        priority
        className="pointer-events-none absolute left-0 top-0 -z-10 w-48 max-w-[55%] select-none"
      />
      <Image
        src="/maioridade/folhagem-base.webp"
        alt=""
        width={420}
        height={389}
        className="pointer-events-none absolute bottom-0 right-0 -z-10 w-48 max-w-[55%] select-none"
      />
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <Image
          src="/maioridade/logo.webp"
          alt="Leguelé Beer"
          width={320}
          height={320}
          priority
          className="size-32"
        />
        {negado ? (
          <>
            <h1 className="font-titulo text-3xl text-texto">Acesso não permitido</h1>
            <p className="text-texto-suave">Este site é só para maiores de 18 anos.</p>
          </>
        ) : (
          <>
            <h1 className="font-titulo text-3xl text-texto">Você tem 18 anos ou mais?</h1>
            <p className="text-texto-suave">Para entrar, confirme sua idade.</p>
            <form action={confirmar} className="flex w-full flex-col gap-3">
              <input type="hidden" name="retorno" value={retorno} />
              <Button type="submit" iconLeft={<Check aria-hidden="true" className="size-5" />}>
                Sim, tenho 18 anos ou mais
              </Button>
              <Button variant="outline" onClick={() => setNegado(true)}>
                Não
              </Button>
            </form>
          </>
        )}
        <div className="flex flex-col gap-1 text-sm text-texto-suave">
          {AVISOS_RODAPE.map((aviso) => (
            <p key={aviso}>{aviso}</p>
          ))}
        </div>
      </div>
    </main>
  );
}
