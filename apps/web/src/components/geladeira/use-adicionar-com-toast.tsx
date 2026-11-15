"use client";

import type { CervejaCard } from "@leguele/shared";
import { useRef, useState, type ReactNode } from "react";
import { Toast } from "@/components/ui";
import { mensagemDoLimite } from "@/lib/geladeira/estado";
import { useGeladeira } from "./geladeira-provider";

type AvisoDeAdicionar = {
  /** Um por toque: o toast recomeça os 5 segundos mesmo com a mesma mensagem. */
  toque: number;
  mensagem: string;
  desfazer?: { cervejaId: string; antes: number; depois: number; geracao: number };
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
  const toques = useRef(0);

  const adicionarComToast = (cerveja: CervejaCard, quantidade = 1) => {
    const antes = estado.itens.find((i) => i.cerveja.id === cerveja.id)?.quantidade ?? 0;
    const { limite, geracao } = adicionar(cerveja, quantidade);
    const toque = ++toques.current;
    setAviso(
      limite !== undefined
        ? { toque, mensagem: mensagemDoLimite(limite) }
        : {
            toque,
            mensagem: `${cerveja.nome} foi para a geladeira`,
            desfazer: { cervejaId: cerveja.id, antes, depois: antes + quantidade, geracao },
          },
    );
  };

  const desfazer = aviso?.desfazer;
  const toast = aviso ? (
    <Toast
      key={aviso.toque}
      mensagem={aviso.mensagem}
      acao={
        desfazer
          ? {
              rotulo: "Desfazer",
              aoAcionar: () => reverterAdicao(desfazer.cervejaId, desfazer, desfazer.geracao),
            }
          : undefined
      }
      aoFechar={() => setAviso(null)}
    />
  ) : null;

  return { adicionarComToast, toast };
}
