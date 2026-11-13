"use client";

import type { AjusteDaGeladeira, CervejaCard } from "@leguele/shared";
import {
  createContext,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { ContaDaGeladeira } from "@/lib/geladeira/conta";
import {
  CHAVE_DA_CONTA,
  CHAVE_PENDENTE,
  apagarGeladeiraLocal,
  gravarGeladeiraLocal,
  gravarMarca,
  lerGeladeiraLocal,
  lerMarca,
} from "@/lib/geladeira/armazenamento";
import { resolverAoEntrar } from "@/lib/geladeira/ao-entrar";
import {
  adicionar as adicionarOp,
  alterarQuantidade as alterarOp,
  desfazer as desfazerOp,
  GELADEIRA_VAZIA,
  aplicarResposta,
  paraRequest,
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
  /** Avisos de preço e quantidade da última resposta da conta (a tela da Geladeira os mostra). */
  ajustes: AjusteDaGeladeira[];
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
  // Conta as mudanças locais, para descartar a resposta antiga de um buscar que ficou em voo.
  const versao = useRef(0);
  const [ajustes, setAjustes] = useState<AjusteDaGeladeira[]>([]);
  // Entrar e sair redirecionam: a mudança de página é o sinal para olhar a sessão de novo.
  const pagina = usePathname();

  const aplicar = useCallback((proximo: EstadoDaGeladeira) => {
    atual.current = proximo;
    setEstado(proximo);
    gravarGeladeiraLocal(proximo);
  }, []);

  // Sessão acabou (saída da conta, ou outra conta no mesmo navegador): a cópia local é da conta anterior.
  const sairDaConta = useCallback(() => {
    apagarGeladeiraLocal();
    gravarMarca(CHAVE_DA_CONTA, false);
    atual.current = GELADEIRA_VAZIA;
    setEstado(GELADEIRA_VAZIA);
    setAjustes([]);
  }, []);

  // Manda a Geladeira inteira para a conta. Só falha de envio de mudança local deixa pendente.
  const enviar = useCallback(async () => {
    if (!conta) return;
    const resultado = await conta.enviar(paraRequest(atual.current)).catch(() => undefined);
    if (resultado?.tipo === "ok") {
      gravarMarca(CHAVE_PENDENTE, false);
      gravarMarca(CHAVE_DA_CONTA, true);
      setAjustes(resultado.resposta.ajustes);
    } else if (resultado?.tipo === "sem-sessao") {
      if (lerMarca(CHAVE_DA_CONTA)) sairDaConta();
      else gravarMarca(CHAVE_PENDENTE, false);
    } else if (lerMarca(CHAVE_DA_CONTA)) {
      gravarMarca(CHAVE_PENDENTE, true);
    }
  }, [conta, sairDaConta]);

  // Depois de uma mudança: com a conta, manda tudo (ou reenvia o que ficou pendente).
  const sincronizar = useCallback(() => {
    versao.current += 1;
    if (conta && lerMarca(CHAVE_DA_CONTA)) void enviar();
  }, [conta, enviar]);

  // A cada página (inclusive depois de entrar ou sair, que redirecionam): com sessão, aplica a regra
  // ao entrar; sem sessão, apaga a cópia de quem acabou de sair.
  useEffect(() => {
    if (!conta) return;
    let ativo = true;
    (async () => {
      const sincronizada = lerMarca(CHAVE_DA_CONTA);
      if (sincronizada && lerMarca(CHAVE_PENDENTE)) return enviar();
      const antes = versao.current;
      const resultado = await conta.buscar().catch(() => undefined);
      if (!ativo || !resultado) return;
      if (resultado.tipo === "sem-sessao") {
        if (sincronizada) sairDaConta();
        return;
      }
      // Erro ou conta sem perfil: nada muda e nada fica pendente (a cópia local não vale mais que a conta).
      if (resultado.tipo !== "ok") return;
      // Mudança feita enquanto o buscar estava em voo: a resposta é antiga.
      if (sincronizada && versao.current !== antes) return;
      // Um envio em voo pode ter falhado enquanto o buscar rodava: a mudança local pendente vale mais.
      if (sincronizada && lerMarca(CHAVE_PENDENTE)) return;
      gravarMarca(CHAVE_DA_CONTA, true);
      setAjustes(resultado.resposta.ajustes);
      const daConta = aplicarResposta(GELADEIRA_VAZIA, resultado.resposta);
      if (sincronizada) return aplicar(daConta);
      const { geladeira, enviarParaConta } = resolverAoEntrar({
        convidado: atual.current,
        conta: daConta,
      });
      aplicar(geladeira);
      if (enviarParaConta) await enviar();
    })();
    return () => {
      ativo = false;
    };
  }, [conta, enviar, aplicar, sairDaConta, pagina]);

  const contexto = useMemo<GeladeiraContexto>(
    () => ({
      pronta,
      estado,
      quantidadeTotal: quantidadeTotal(estado),
      ajustes,
      adicionar: (cerveja, quantidade) => {
        const resultado = adicionarOp(atual.current, cerveja, quantidade);
        if (resultado.estado !== atual.current) {
          aplicar(resultado.estado);
          sincronizar();
        }
        return resultado;
      },
      alterarQuantidade: (cervejaId, quantidade) => {
        const resultado = alterarOp(atual.current, cervejaId, quantidade);
        if (resultado.estado !== atual.current) {
          aplicar(resultado.estado);
          sincronizar();
        }
        return resultado;
      },
      remover: (cervejaId) => {
        const { estado: proximo, desfazer: d } = removerOp(atual.current, cervejaId);
        if (d) {
          aplicar(proximo);
          sincronizar();
        }
        return d;
      },
      desfazer: (d) => {
        aplicar(desfazerOp(atual.current, d));
        sincronizar();
      },
    }),
    [pronta, estado, ajustes, aplicar, sincronizar],
  );

  return <Contexto.Provider value={contexto}>{children}</Contexto.Provider>;
}
