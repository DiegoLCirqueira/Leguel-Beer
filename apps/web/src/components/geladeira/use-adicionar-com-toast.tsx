"use client";

import type { CervejaCard } from "@leguele/shared";
import { useState, type ReactNode } from "react";
import { Toast } from "@/components/ui";
import { mensagemDoLimite, type EstadoDaGeladeira } from "@/lib/geladeira/estado";
import { useGeladeira } from "./geladeira-provider";

type AvisoDeAdicionar = { mensagem: string; antes?: EstadoDaGeladeira };

/**
 * "Adicionar" com o aviso da ação: toast "foi para a geladeira" com "Desfazer", ou "Só temos N
 * unidades" (sem "Desfazer") quando passa do limite. Um toque novo substitui o aviso anterior.
 */
export function useAdicionarComToast(): {
  adicionarComToast: (cerveja: CervejaCard, quantidade?: number) => void;
  toast: ReactNode;
} {
  const { estado, adicionar, restaurar } = useGeladeira();
  const [aviso, setAviso] = useState<AvisoDeAdicionar | null>(null);

  const adicionarComToast = (cerveja: CervejaCard, quantidade = 1) => {
    const { limite } = adicionar(cerveja, quantidade);
    setAviso(
      limite !== undefined
        ? { mensagem: mensagemDoLimite(limite) }
        : { mensagem: `${cerveja.nome} foi para a geladeira`, antes: estado },
    );
  };

  const toast = aviso ? (
    <Toast
      mensagem={aviso.mensagem}
      acao={
        aviso.antes ? { rotulo: "Desfazer", aoAcionar: () => restaurar(aviso.antes!) } : undefined
      }
      aoFechar={() => setAviso(null)}
    />
  ) : null;

  return { adicionarComToast, toast };
}
