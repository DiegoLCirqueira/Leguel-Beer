"use client";

import type { CervejaCard } from "@leguele/shared";
import { useState, type ReactNode } from "react";
import { Toast } from "@/components/ui";
import { mensagemDoLimite } from "@/lib/geladeira/estado";
import { useGeladeira } from "./geladeira-provider";

type AvisoDeAdicionar = {
  mensagem: string;
  desfazer?: { cervejaId: string; antes: number; depois: number };
};

/**
 * "Adicionar" com o aviso da ação: toast "foi para a geladeira" com "Desfazer", ou "Só temos N
 * unidades" (sem "Desfazer") quando passa do limite. Um toque novo substitui o aviso anterior.
 */
export function useAdicionarComToast(): {
  adicionarComToast: (cerveja: CervejaCard, quantidade?: number) => void;
  toast: ReactNode;
} {
  const { estado, adicionar, reverterAdicao } = useGeladeira();
  const [aviso, setAviso] = useState<AvisoDeAdicionar | null>(null);

  const adicionarComToast = (cerveja: CervejaCard, quantidade = 1) => {
    const antes = estado.itens.find((i) => i.cerveja.id === cerveja.id)?.quantidade ?? 0;
    const { limite } = adicionar(cerveja, quantidade);
    setAviso(
      limite !== undefined
        ? { mensagem: mensagemDoLimite(limite) }
        : {
            mensagem: `${cerveja.nome} foi para a geladeira`,
            desfazer: { cervejaId: cerveja.id, antes, depois: antes + quantidade },
          },
    );
  };

  const desfazer = aviso?.desfazer;
  const toast = aviso ? (
    <Toast
      mensagem={aviso.mensagem}
      acao={
        desfazer
          ? {
              rotulo: "Desfazer",
              aoAcionar: () => reverterAdicao(desfazer.cervejaId, desfazer),
            }
          : undefined
      }
      aoFechar={() => setAviso(null)}
    />
  ) : null;

  return { adicionarComToast, toast };
}
