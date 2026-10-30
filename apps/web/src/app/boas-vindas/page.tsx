import type { Metadata } from "next";
import Image from "next/image";
import { WelcomeActions } from "@/components/welcome/welcome-actions";

export const metadata: Metadata = {
  title: "Boas-vindas | Leguelé Beer",
};

const foliage = [
  {
    name: "topo-esquerda",
    width: 420,
    height: 351,
    className: "left-0 top-0 w-[44%]",
    priority: true,
  },
  {
    name: "topo-direita",
    width: 420,
    height: 411,
    className: "right-0 top-0 w-[30%]",
    priority: true,
  },
];

const depthFoliage = [
  {
    name: "base-esquerda",
    width: 420,
    height: 364,
    className: "-left-[12%] top-[30%] w-[34%] -scale-y-100",
  },
  {
    name: "base-direita",
    width: 420,
    height: 389,
    className: "-right-[10%] top-[24%] w-[30%] -scale-y-100",
  },
];

export default function BoasVindas() {
  return (
    <main className="relative isolate h-dvh min-h-[560px] overflow-hidden bg-[radial-gradient(ellipse_at_50%_38%,var(--color-superficie-elevada),var(--color-superficie)_55%,var(--color-fundo)_100%)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_42%,color-mix(in_oklab,var(--color-primaria)_16%,transparent),transparent_62%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-[30%] bg-linear-to-t from-fundo via-fundo/80 to-transparent"
      />
      {foliage.map((leaf) => (
        <Image
          key={leaf.name}
          src={`/boas-vindas/folhagem-${leaf.name}.webp`}
          alt=""
          width={leaf.width}
          height={leaf.height}
          sizes="(min-width: 768px) 360px, 45vw"
          priority={leaf.priority}
          className={`pointer-events-none absolute -z-10 max-w-[360px] ${leaf.className}`}
        />
      ))}
      {depthFoliage.map((leaf) => (
        <Image
          key={leaf.name}
          src={`/boas-vindas/folhagem-${leaf.name}.webp`}
          alt=""
          width={leaf.width}
          height={leaf.height}
          sizes="35vw"
          className={`pointer-events-none absolute -z-10 max-w-none opacity-50 blur-[2px] ${leaf.className}`}
        />
      ))}
      <div className="mx-auto flex h-full w-full max-w-md flex-col items-center px-[max(1rem,env(safe-area-inset-left))] pb-[max(2dvh,env(safe-area-inset-bottom))] pt-[max(3dvh,env(safe-area-inset-top))]">
        <h1 translate="no" className="h-[23dvh] shrink-0">
          <Image
            src="/boas-vindas/logo-leguele-beer.webp"
            alt="Leguelé Beer"
            width={640}
            height={673}
            sizes="(min-width: 768px) 288px, 64vw"
            priority
            className="h-full w-auto"
          />
        </h1>
        <p className="mt-[1.5dvh] -rotate-6 text-balance text-center font-titulo text-[clamp(1.1rem,3.2dvh,1.5rem)] leading-tight text-texto">
          Cervejas artesanais{" "}
          <span className="block underline decoration-primaria decoration-2 underline-offset-4">
            e <span className="text-primaria">muito mais!</span>
          </span>
        </p>
        <div className="mt-[1dvh] flex min-h-0 w-full flex-1 justify-center">
          <div className="relative aspect-[775/615] h-full max-w-full">
            <Image
              src="/boas-vindas/tampo-de-madeira.webp"
              alt=""
              width={1000}
              height={99}
              sizes="(min-width: 768px) 448px, 100vw"
              className="pointer-events-none absolute -inset-x-[6%] bottom-0 h-[19%] w-[112%] max-w-none object-cover brightness-75 [mask-composite:intersect] [mask-image:linear-gradient(to_bottom,transparent,black_45%,black_80%,transparent),linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
            />
            <Image
              src="/boas-vindas/barril-com-lupulo.webp"
              alt=""
              width={900}
              height={515}
              sizes="(min-width: 768px) 440px, 98vw"
              className="pointer-events-none absolute left-[43%] top-[37%] h-[46%] w-auto max-w-none brightness-[0.7] saturate-[0.9] blur-[0.5px]"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-[9%] left-[24%] h-[6%] w-[50%] rounded-full bg-fundo/80 blur-md"
            />
            <Image
              src="/boas-vindas/garrafa-e-copo.webp"
              alt="Garrafa de IPA Leguelé Beer ao lado de um copo cheio, entre folhas de lúpulo"
              width={520}
              height={808}
              sizes="(min-width: 768px) 200px, 45vw"
              priority
              className="absolute left-[27%] top-[0.5%] h-[90%] w-auto max-w-none drop-shadow-[0_6px_8px_var(--color-fundo)]"
            />
            <Image
              src="/boas-vindas/lupulo-esquerda.webp"
              alt=""
              width={260}
              height={291}
              sizes="(min-width: 768px) 120px, 30vw"
              className="pointer-events-none absolute bottom-[6%] left-[16%] h-[24%] w-auto max-w-none"
            />
          </div>
        </div>
        <WelcomeActions />
      </div>
    </main>
  );
}
