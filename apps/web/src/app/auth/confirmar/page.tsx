import { Check } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site/site-footer";
import { confirmarContaAction } from "./actions";

export const metadata: Metadata = {
  title: "Confirmar conta | Leguelé Beer",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ token_hash?: string; type?: string }> };

/**
 * Destino do link do e-mail de confirmação. Abrir o link (GET) só mostra o botão; quem gasta o
 * token e entra na conta é o POST da ação, para scanners de e-mail não consumirem o link.
 */
export default async function Confirmar({ searchParams }: Props) {
  const { token_hash: tokenHash, type } = await searchParams;
  if (!tokenHash || type !== "signup") redirect("/entrar?aviso=link-invalido");

  return (
    <>
      <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-fundo px-6 py-12">
        <Image
          src="/maioridade/fundo.webp"
          alt=""
          fill
          sizes="100vw"
          quality={90}
          priority
          className="pointer-events-none -z-20 select-none object-cover brightness-75"
        />
        <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
          <Image
            src="/acesso/logo-nome.webp"
            alt="Leguelé Beer"
            width={772}
            height={750}
            sizes="144px"
            quality={90}
            priority
            className="w-36"
          />
          <h1 className="sr-only">Confirmar sua conta</h1>
          <p className="text-texto">Toque no botão abaixo para ativar sua conta na Leguelé Beer.</p>
          <form action={confirmarContaAction} className="w-full">
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type} />
            <Button type="submit" iconLeft={<Check aria-hidden="true" className="size-5" />}>
              Confirmar minha conta
            </Button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
