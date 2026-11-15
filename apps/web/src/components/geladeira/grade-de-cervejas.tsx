"use client";

import type { CervejaCard } from "@leguele/shared";
import { useState } from "react";
import { CardCerveja, Toast } from "@/components/ui";
import { useGeladeira } from "./geladeira-provider";

/** Grade de cards de cerveja com o "Adicionar" ligado à Geladeira e o toast da ação. */
export function GradeDeCervejas({ itens }: { itens: CervejaCard[] }) {
  const { adicionar } = useGeladeira();
  const [toast, setToast] = useState<{ mensagem: string } | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
        {itens.map((cerveja) => (
          <CardCerveja
            key={cerveja.id}
            cerveja={cerveja}
            aoAdicionar={() => {
              adicionar(cerveja);
              setToast({ mensagem: `${cerveja.nome} foi para a geladeira` });
            }}
          />
        ))}
      </div>
      {toast ? (
        <Toast
          mensagem={toast.mensagem}
          acao={{ rotulo: "Desfazer", aoAcionar: () => {} }}
          aoFechar={() => setToast(null)}
        />
      ) : null}
    </>
  );
}
