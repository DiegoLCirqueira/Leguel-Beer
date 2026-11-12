import { Refrigerator } from "lucide-react";
import Link from "next/link";

/**
 * Link da Geladeira com o contador de itens (alvo de 44 px), comum aos cabeçalhos da loja e do produto.
 * Sem `count` (ainda não leu a cópia local) não mostra o número.
 */
export function LinkGeladeira({ count }: { count?: number }) {
  const itens = count === undefined ? "" : `, ${count} ${count === 1 ? "unidade" : "unidades"}`;
  return (
    <Link
      href="/geladeira"
      aria-label={`Geladeira${itens}`}
      className="relative flex size-11 items-center justify-center rounded-full text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
    >
      <Refrigerator aria-hidden="true" className="size-7" />
      {count === undefined ? null : (
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 flex min-w-5 items-center justify-center rounded-full bg-primaria px-1 text-xs font-bold leading-5 text-texto-na-primaria"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
