import type { CervejaCard } from "@leguele/shared";
import Link from "next/link";
import { CardCerveja } from "@/components/ui";

/** "Cervejas em destaque": até 6 cards na ordem da API (esgotadas no fim) e o link para o catálogo. Sem destaques, some. */
export function DestaquesDaHome({ itens }: { itens: CervejaCard[] }) {
  if (itens.length === 0) return null;
  return (
    <section aria-labelledby="destaques-titulo" className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="destaques-titulo" className="text-lg font-semibold text-texto">
          Cervejas em destaque
        </h2>
        <Link
          href="/catalogo"
          className="inline-flex min-h-11 items-center font-semibold text-primaria underline underline-offset-2"
        >
          Ver todas
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
        {itens.map((cerveja) => (
          <CardCerveja key={cerveja.id} cerveja={cerveja} />
        ))}
      </div>
    </section>
  );
}
