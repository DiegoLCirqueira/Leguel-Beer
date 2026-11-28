"use client";

import { useRouter } from "next/navigation";
import { CategoryChips, IconeDaCategoria } from "@/components/ui";

const TODAS = "todas";

type Props = { categorias: { slug: string; nome: string; quantidade: number }[] };

/** Faixa de categorias da home: os mesmos chips do catálogo; tocar abre `/catalogo` com a categoria. */
export function FaixaDeCategorias({ categorias }: Props) {
  const router = useRouter();
  const comCerveja = categorias.filter((c) => c.quantidade > 0);
  if (comCerveja.length === 0) return null;
  const total = comCerveja.reduce((soma, c) => soma + c.quantidade, 0);
  const chips = [
    { id: TODAS, label: "Todas", count: total, icon: <IconeDaCategoria slug={TODAS} /> },
    ...comCerveja.map((c) => ({
      id: c.slug,
      label: c.nome,
      count: c.quantidade,
      icon: <IconeDaCategoria slug={c.slug} />,
    })),
  ];

  return (
    <nav aria-label="Categorias" className="w-full">
      <CategoryChips
        items={chips}
        value={TODAS}
        onChange={(id) =>
          router.push(id === TODAS ? "/catalogo" : `/catalogo?categoria=${encodeURIComponent(id)}`)
        }
      />
    </nav>
  );
}
