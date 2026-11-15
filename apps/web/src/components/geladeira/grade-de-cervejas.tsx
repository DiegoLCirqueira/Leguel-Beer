"use client";

import type { CervejaCard } from "@leguele/shared";
import { useState } from "react";
import { CardCerveja, Toast } from "@/components/ui";
import { mensagemDoLimite, type EstadoDaGeladeira } from "@/lib/geladeira/estado";
import { useGeladeira } from "./geladeira-provider";

/** Grade de cards de cerveja com o "Adicionar" ligado à Geladeira e o toast da ação. */
export function GradeDeCervejas({ itens }: { itens: CervejaCard[] }) {
  const { estado, adicionar, restaurar } = useGeladeira();
  const [toast, setToast] = useState<{ mensagem: string; antes?: EstadoDaGeladeira } | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
        {itens.map((cerveja) => (
          <CardCerveja
            key={cerveja.id}
            cerveja={cerveja}
            aoAdicionar={() => {
              const { limite } = adicionar(cerveja);
              setToast(
                limite !== undefined
                  ? { mensagem: mensagemDoLimite(limite) }
                  : { mensagem: `${cerveja.nome} foi para a geladeira`, antes: estado },
              );
            }}
          />
        ))}
      </div>
      {toast ? (
        <Toast
          mensagem={toast.mensagem}
          acao={
            toast.antes
              ? { rotulo: "Desfazer", aoAcionar: () => restaurar(toast.antes!) }
              : undefined
          }
          aoFechar={() => setToast(null)}
        />
      ) : null}
    </>
  );
}
