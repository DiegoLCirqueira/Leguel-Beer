import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LinkGeladeira } from "./link-geladeira";

type Props = {
  count?: number;
  className?: string;
  /** Logo maior, como no design da home; as outras telas da loja mantêm o tamanho padrão. */
  grande?: boolean;
};

/** Cabeçalho da loja: logo à esquerda e a Geladeira com o contador de itens à direita (alvos de 44 px). */
export function LojaHeader({ count, className, grande = false }: Props) {
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
          sizes={grande ? "112px" : "64px"}
          priority
          className={grande ? "w-28" : "w-16"}
        />
      </Link>
      <LinkGeladeira count={count} />
    </header>
  );
}
