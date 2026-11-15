"use client";

import type { CervejaCard } from "@leguele/shared";
import { CardCerveja } from "@/components/ui";
import { useAdicionarComToast } from "./use-adicionar-com-toast";

/** Grade de cards de cerveja com o "Adicionar" ligado à Geladeira e o toast da ação. */
export function GradeDeCervejas({ itens }: { itens: CervejaCard[] }) {
  const { adicionarComToast, toast } = useAdicionarComToast();

  return (
    <>
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
        {itens.map((cerveja) => (
          <CardCerveja
            key={cerveja.id}
            cerveja={cerveja}
            aoAdicionar={() => adicionarComToast(cerveja)}
          />
        ))}
      </div>
      {toast}
    </>
  );
}
