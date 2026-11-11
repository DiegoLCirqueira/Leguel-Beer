"use client";

import type { CervejaCard } from "@leguele/shared";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ContaDaGeladeira } from "@/lib/geladeira/conta";
import { gravarGeladeiraLocal, lerGeladeiraLocal } from "@/lib/geladeira/armazenamento";
import {
  adicionar as adicionarOp,
  alterarQuantidade as alterarOp,
  desfazer as desfazerOp,
  quantidadeTotal,
  remover as removerOp,
  type Desfazer,
  type EstadoDaGeladeira,
  type Resultado,
} from "@/lib/geladeira/estado";

export type GeladeiraContexto = {
  /** `false` até ler a cópia local: o contador só aparece depois, para o HTML não divergir. */
  pronta: boolean;
  estado: EstadoDaGeladeira;
  quantidadeTotal: number;
  adicionar: (cerveja: CervejaCard, quantidade?: number) => Resultado;
  alterarQuantidade: (cervejaId: string, quantidade: number) => Resultado;
  remover: (cervejaId: string) => Desfazer | null;
  desfazer: (d: Desfazer) => void;
};

const semAssinatura = () => () => {};

const Contexto = createContext<GeladeiraContexto | null>(null);

export function useGeladeira(): GeladeiraContexto {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useGeladeira precisa estar dentro do GeladeiraProvider.");
  return contexto;
}

export function GeladeiraProvider({
  children,
  conta,
}: {
  children: ReactNode;
  /** Sem `conta` (testes, telas sem sessão) a Geladeira é só local. */
  conta?: ContaDaGeladeira;
}) {
  void conta;
  // A cópia local só existe no navegador: lida uma vez ao montar (no servidor fica vazia).
  const [estado, setEstado] = useState<EstadoDaGeladeira>(() => lerGeladeiraLocal());
  // `false` no HTML do servidor e na hidratação; `true` depois: o contador só aparece então.
  const pronta = useSyncExternalStore(
    semAssinatura,
    () => true,
    () => false,
  );
  // Sempre o estado mais novo, para os resultados síncronos das operações (limite, desfazer).
  const atual = useRef(estado);

  const aplicar = useCallback((proximo: EstadoDaGeladeira) => {
    atual.current = proximo;
    setEstado(proximo);
    gravarGeladeiraLocal(proximo);
  }, []);

  const contexto = useMemo<GeladeiraContexto>(
    () => ({
      pronta,
      estado,
      quantidadeTotal: quantidadeTotal(estado),
      adicionar: (cerveja, quantidade) => {
        const resultado = adicionarOp(atual.current, cerveja, quantidade);
        if (resultado.estado !== atual.current) aplicar(resultado.estado);
        return resultado;
      },
      alterarQuantidade: (cervejaId, quantidade) => {
        const resultado = alterarOp(atual.current, cervejaId, quantidade);
        if (resultado.estado !== atual.current) aplicar(resultado.estado);
        return resultado;
      },
      remover: (cervejaId) => {
        const { estado: proximo, desfazer: d } = removerOp(atual.current, cervejaId);
        if (d) aplicar(proximo);
        return d;
      },
      desfazer: (d) => aplicar(desfazerOp(atual.current, d)),
    }),
    [pronta, estado, aplicar],
  );

  return <Contexto.Provider value={contexto}>{children}</Contexto.Provider>;
}
