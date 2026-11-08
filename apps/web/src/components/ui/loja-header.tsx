import { Refrigerator } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = { count: number; className?: string };

/** Cabeçalho da loja: logo à esquerda e a Geladeira com o contador de itens à direita (alvos de 44 px). */
export function LojaHeader({ count, className }: Props) {
  const itens = `${count} ${count === 1 ? "item" : "itens"}`;
  return (
    <header className={cn("flex items-center justify-between px-4 pt-2", className)}>
      <Link
        href="/"
        aria-label="Leguelé Beer, início"
        className="flex min-h-11 items-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
      >
        <Image
          src="/acesso/logo-nome.webp"
          alt=""
          width={507}
          height={492}
          sizes="64px"
          priority
          className="w-16"
        />
      </Link>
      <Link
        href="/geladeira"
        aria-label={`Geladeira, ${itens}`}
        className="relative flex size-11 items-center justify-center rounded-full text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
      >
        <Refrigerator aria-hidden="true" className="size-7" />
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 flex min-w-5 items-center justify-center rounded-full bg-primaria px-1 text-xs font-bold leading-5 text-texto-na-primaria"
        >
          {count}
        </span>
      </Link>
    </header>
  );
}
