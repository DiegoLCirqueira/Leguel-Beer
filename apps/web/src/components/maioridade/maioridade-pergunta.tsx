"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AVISOS_RODAPE } from "@/lib/avisos";

type Props = {
  retorno: string;
  confirmar: (formData: FormData) => void | Promise<void>;
};

export function MaioridadePergunta({ retorno, confirmar }: Props) {
  const [negado, setNegado] = useState(false);
  const [voltou, setVoltou] = useState(false);
  const tituloNegado = useRef<HTMLHeadingElement>(null);
  const tituloPergunta = useRef<HTMLHeadingElement>(null);

  // O botão "Não" some ao negar: o foco vai para o novo título, para não se perder.
  useEffect(() => {
    if (negado) tituloNegado.current?.focus();
  }, [negado]);

  // O botão de voltar some ao voltar para a pergunta: o foco vai para o título dela.
  useEffect(() => {
    if (voltou && !negado) tituloPergunta.current?.focus();
  }, [voltou, negado]);

  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-fundo px-6 py-10 text-center">
      <Image
        src="/maioridade/fundo.webp"
        quality={90}
        alt=""
        fill
        sizes="100vw"
        priority
        className="pointer-events-none -z-20 select-none object-cover brightness-75"
      />
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
        priority
        className="pointer-events-none absolute bottom-0 right-0 -z-10 w-[clamp(3rem,calc((100dvh-472px)/1.85),10rem)] max-w-[45%] select-none"
      />
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <Image
          src="/maioridade/logo.webp"
          quality={90}
          alt="Leguelé Beer"
          width={768}
          height={768}
          sizes="128px"
          priority
          className="size-32"
        />
        {negado ? (
          <>
            <h1
              ref={tituloNegado}
              tabIndex={-1}
              className="font-titulo text-balance text-3xl text-texto outline-none"
            >
              Acesso não permitido
            </h1>
            <p className="text-texto-suave">Este site é só para maiores de 18 anos.</p>
            <Button
              onClick={() => {
                setVoltou(true);
                setNegado(false);
              }}
            >
              Voltar para a página inicial
            </Button>
          </>
        ) : (
          <>
            <h1
              ref={tituloPergunta}
              tabIndex={-1}
              className="font-titulo text-balance text-3xl text-texto outline-none"
            >
              Você tem 18 anos ou mais?
            </h1>
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
