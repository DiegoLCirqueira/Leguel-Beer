import type { Metadata } from "next";
import Image from "next/image";
import { WelcomeActions } from "@/components/welcome/welcome-actions";

export const metadata: Metadata = {
  title: "Boas-vindas | Leguelé Beer",
};

const foliage = [
  { name: "topo-esquerda", width: 420, height: 351, position: "left-0 top-0" },
  { name: "topo-direita", width: 420, height: 411, position: "right-0 top-0" },
  { name: "base-esquerda", width: 420, height: 364, position: "bottom-0 left-0" },
  { name: "base-direita", width: 420, height: 389, position: "bottom-0 right-0" },
];

export default function BoasVindas() {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center overflow-x-clip bg-linear-to-b from-superficie via-fundo to-fundo">
      {foliage.map((leaf) => (
        <Image
          key={leaf.name}
          src={`/boas-vindas/folhagem-${leaf.name}.webp`}
          alt=""
          width={leaf.width}
          height={leaf.height}
          sizes="(min-width: 768px) 360px, 45vw"
          className={`pointer-events-none absolute -z-10 w-[45vw] max-w-[360px] opacity-90 ${leaf.position}`}
        />
      ))}
      <div className="flex w-full max-w-md flex-1 flex-col items-center justify-between gap-4 px-4 pb-6 pt-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1>
            <Image
              src="/boas-vindas/logo-leguele-beer.webp"
              alt="Leguelé Beer"
              width={640}
              height={673}
              sizes="(min-width: 768px) 288px, 64vw"
              priority
              className="w-[64vw] max-w-72"
            />
          </h1>
          <p className="font-titulo text-3xl leading-tight text-texto">
            Cervejas artesanais{" "}
            <span className="inline-block underline decoration-primaria decoration-2 underline-offset-4">
              e <span className="text-primaria">muito mais!</span>
            </span>
          </p>
        </div>
        <div className="relative w-full">
          <p className="absolute left-[2%] top-[34%] w-[26%] -rotate-12 font-titulo text-sm leading-snug text-primaria">
            Sabor Qualidade Tradição
          </p>
          <Image
            src="/boas-vindas/garrafa-e-copo-ipa.webp"
            alt="Garrafa de IPA Leguelé Beer ao lado de um copo cheio, entre folhas de lúpulo"
            width={748}
            height={724}
            sizes="(min-width: 768px) 448px, 100vw"
            priority
            className="ml-auto h-auto w-[78%]"
          />
        </div>
        <WelcomeActions />
      </div>
    </main>
  );
}
