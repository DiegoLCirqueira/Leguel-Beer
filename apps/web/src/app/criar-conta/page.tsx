import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { CriarContaForm } from "@/components/auth/criar-conta-form";
import { criarContaAction } from "./actions";

export const metadata: Metadata = {
  title: "Criar sua conta | Leguelé Beer",
};

export default function CriarConta() {
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
        <Image
          src="/maioridade/folhagem-base.webp"
          alt=""
          width={420}
          height={389}
          className="pointer-events-none absolute bottom-0 right-0 -z-10 w-40 max-w-[45%] select-none"
        />
        <Image
          src="/maioridade/folhagem-base.webp"
          alt=""
          width={420}
          height={389}
          className="pointer-events-none absolute bottom-0 left-0 -z-10 w-40 max-w-[45%] -scale-x-100 select-none"
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
              Criar sua <span className="text-primaria">conta</span>
            </h1>
            <p className="text-texto">Faça parte do nosso clube e viva experiências exclusivas!</p>
          </header>
          <CriarContaForm criar={criarContaAction} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
