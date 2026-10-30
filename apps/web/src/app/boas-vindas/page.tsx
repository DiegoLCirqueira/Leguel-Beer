import type { Metadata } from "next";
import Image from "next/image";
import { WelcomeActions } from "@/components/welcome/welcome-actions";
import { ART } from "@/lib/arte-login";

export const metadata: Metadata = {
  title: "Boas-vindas | Leguelé Beer",
};

export default function BoasVindas() {
  return (
    <main className="relative isolate h-dvh overflow-hidden bg-fundo [@media(max-height:599px)]:overflow-y-auto [@media(max-height:599px)]:pb-[env(safe-area-inset-bottom,0px)]">
      <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
        <Image
          src="/boas-vindas/arte-login.webp"
          alt=""
          fill
          sizes="100vw"
          className="scale-110 object-cover blur-2xl brightness-50"
        />
      </div>
      <div data-testid="palco-arte" className="palco-arte">
        <Image
          src="/boas-vindas/arte-login.webp"
          alt="Garrafa de IPA Leguelé Beer ao lado de um copo cheio, entre folhas de lúpulo"
          width={ART.width}
          height={ART.height}
          sizes="(min-aspect-ratio: 11/20) 50dvh, 100vw"
          quality={90}
          priority
          className="size-full"
        />
        <h1 translate="no" className="sr-only">
          Leguelé Beer
        </h1>
        <p className="sr-only">Sabor Qualidade e Tradição</p>
        <WelcomeActions />
      </div>
    </main>
  );
}
