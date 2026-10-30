import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EntrarForm } from "@/components/auth/entrar-form";
import { SiteFooter } from "@/components/site/site-footer";
import { reenviarAction, entrarAction } from "./actions";

export const metadata: Metadata = {
  title: "Entrar | Leguelé Beer",
};

type Props = {
  searchParams: Promise<{
    retorno?: string;
    email?: string;
    "manter-conectado"?: string;
  }>;
};

export default async function Entrar({ searchParams }: Props) {
  const busca = await searchParams;

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

        <Link
          href="/boas-vindas"
          aria-label="Voltar"
          className="absolute left-4 top-12 flex size-11 items-center justify-center rounded-full border border-primaria text-primaria transition-colors hover:bg-primaria/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          <ChevronLeft aria-hidden="true" className="size-6" />
        </Link>

        <div className="flex w-full max-w-sm flex-col gap-6">
          <Image
            src="/acesso/logo-nome.webp"
            alt="Leguelé Beer"
            width={772}
            height={750}
            sizes="144px"
            quality={90}
            priority
            className="mx-auto w-36"
          />
          <header className="flex flex-col gap-3">
            <h1 className="font-titulo text-balance text-4xl leading-tight text-texto">
              Entrar na sua <span className="text-primaria">conta</span>
            </h1>
            <p className="text-texto">Que bom te ver de novo!</p>
          </header>
          <EntrarForm
            entrar={entrarAction.bind(null, busca.retorno)}
            reenviar={reenviarAction}
            emailInicial={busca.email}
            manterConectadoInicial={busca["manter-conectado"] !== "0"}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
