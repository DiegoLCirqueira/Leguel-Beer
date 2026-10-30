import type { Metadata } from "next";
import Image from "next/image";
import { WelcomeActions } from "@/components/welcome/welcome-actions";
import { ART } from "@/lib/arte-login";

export const metadata: Metadata = {
  title: "Boas-vindas | Leguelé Beer",
};

export default function BoasVindas() {
  return (
    <main className="relative isolate h-dvh min-h-[560px] overflow-hidden bg-fundo">
      <Image
        src="/boas-vindas/arte-login.webp"
        alt=""
        fill
        sizes="100vw"
        className="hidden scale-110 object-cover blur-2xl brightness-50 [@media(min-aspect-ratio:11/20)]:block"
      />
      <div
        data-testid="palco-arte"
        className="absolute left-1/2 top-1/2 aspect-[818/1765] w-[max(100vw,calc(100dvh*818/1765))] -translate-x-1/2 -translate-y-1/2 [container-type:inline-size] [@media(min-aspect-ratio:11/20)]:w-[calc(100dvh*818/1765)]"
      >
        <Image
          src="/boas-vindas/arte-login.webp"
          alt=""
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
        <p className="sr-only">Cervejas artesanais e muito mais!</p>
        <WelcomeActions />
      </div>
    </main>
  );
}
