import Image from "next/image";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { BotaoVoltar } from "./botao-voltar";

type Props = {
  /** Título da tela; a última palavra costuma vir num <span> no verde da marca. */
  titulo: ReactNode;
  subtitulo?: string;
  voltarHref?: string;
  children: ReactNode;
};

/** Moldura das telas de acesso (fundo do estúdio, folhagem, voltar, logo e título) e o rodapé. */
export function TelaDeAcesso({ titulo, subtitulo, voltarHref = "/entrar", children }: Props) {
  return (
    <>
      <main className="relative isolate flex min-h-dvh flex-col items-center overflow-hidden bg-fundo px-6 pb-12 pt-14">
        <Image
          src="/maioridade/fundo.webp"
          alt=""
          fill
          sizes="100vw"
          quality={90}
          priority
          className="pointer-events-none -z-20 select-none object-cover brightness-75"
        />
        <Image
          src="/maioridade/folhagem-topo.webp"
          alt=""
          width={420}
          height={351}
          className="pointer-events-none absolute left-0 top-0 -z-10 w-40 max-w-[45%] select-none"
        />
        <Image
          src="/maioridade/folhagem-topo.webp"
          alt=""
          width={420}
          height={351}
          className="pointer-events-none absolute right-0 top-0 -z-10 w-40 max-w-[45%] -scale-x-100 select-none"
        />
        <BotaoVoltar href={voltarHref} />

        <div className="flex w-full max-w-sm flex-col gap-6">
          <Image
            src="/acesso/logo-nome.webp"
            alt="Leguelé Beer"
            width={507}
            height={492}
            sizes="144px"
            quality={90}
            priority
            className="mx-auto w-36"
          />
          <header className="flex flex-col gap-3">
            <h1 className="font-titulo text-balance text-4xl leading-tight text-texto">{titulo}</h1>
            {subtitulo ? <p className="text-texto">{subtitulo}</p> : null}
          </header>
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
