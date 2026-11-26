"use client";

import { formatPriceBRL, type CervejaCard } from "@leguele/shared";
import { BottomSheet, Button, ImagemDaGarrafa, SeloEsgotado } from "@/components/ui";

export type ListaDeAdicionarProps = {
  /** Categoria da garrafa fantasma tocada; `null` = lista fechada. */
  categoria: { slug: string; nome: string } | null;
  /** Catálogo na ordem de relevância: a lista mostra só as da categoria, nessa ordem. */
  cervejas: CervejaCard[];
  aoFechar: () => void;
  aoAdicionar: (cerveja: CervejaCard) => void;
};

/** Lista de adicionar da Geladeira: as cervejas da categoria, 1 unidade por toque em "Adicionar". */
export function ListaDeAdicionar({
  categoria,
  cervejas,
  aoFechar,
  aoAdicionar,
}: ListaDeAdicionarProps) {
  const daCategoria = categoria ? cervejas.filter((c) => c.categoria.slug === categoria.slug) : [];
  return (
    <BottomSheet
      aberto={categoria !== null}
      aoFechar={aoFechar}
      titulo={`Adicionar ${categoria?.nome ?? ""}`}
    >
      {daCategoria.length === 0 ? (
        <p className="py-4 text-texto-suave">{`Nenhuma cerveja de ${categoria?.nome} disponível agora.`}</p>
      ) : (
        <ul className="flex flex-col gap-3 pb-4">
          {daCategoria.map((cerveja) => (
            <li
              key={cerveja.id}
              className="flex items-center gap-3 rounded-2xl border border-borda bg-superficie p-3"
            >
              <span className="relative h-14 w-8 shrink-0">
                <ImagemDaGarrafa
                  imagemUrl={cerveja.imagemUrl}
                  categoriaSlug={cerveja.categoria.slug}
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-semibold">{cerveja.nome}</span>
                <span className="text-sm text-primaria">
                  {formatPriceBRL(cerveja.precoCentavos)}
                </span>
                {cerveja.esgotada ? <SeloEsgotado className="self-start" /> : null}
              </span>
              <Button
                size="sm"
                className="w-auto"
                disabled={cerveja.esgotada}
                onClick={() => aoAdicionar(cerveja)}
              >
                Adicionar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </BottomSheet>
  );
}
