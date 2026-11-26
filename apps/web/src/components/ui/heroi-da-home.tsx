import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "./button";

/** Herói da home (spec home-topo): chamada fixa, sem rotação, com a arte decorativa à direita. */
export function HeroiDaHome() {
  return (
    <section
      aria-labelledby="heroi-titulo"
      className="relative isolate w-full overflow-hidden rounded-3xl border border-borda bg-superficie"
    >
      <Image
        src="/home/heroi.webp"
        alt=""
        width={640}
        height={800}
        sizes="(min-width: 448px) 224px, 50vw"
        priority
        className="absolute inset-y-0 right-0 -z-10 h-full w-3/5 object-cover object-center opacity-80 [mask-image:linear-gradient(to_right,transparent,black_45%)]"
      />
      <div className="flex w-3/5 flex-col items-start gap-3 p-4">
        <span className="whitespace-nowrap rounded-full border border-primaria px-2.5 py-1 text-[11px] font-semibold uppercase text-primaria">
          Cervejas artesanais
        </span>
        <h2 id="heroi-titulo" className="font-titulo text-3xl leading-tight text-texto">
          Sabor de verdade em <span className="text-primaria">cada gole!</span>
        </h2>
        <p className="text-sm text-texto-suave">
          Cervejas artesanais feitas com os melhores ingredientes e muito mais sabor.
        </p>
        <Link
          href="/catalogo"
          className={`${buttonVariants({ variant: "primary" })} whitespace-nowrap`}
        >
          Ver catálogo
          <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </div>
    </section>
  );
}
