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
  reverterAdicao as reverterAdicaoOp,
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
  /** Sobe a cada vez que a conta passa a ter a Geladeira mostrada (busca ou envio concluídos). */
  sincronizacoes: number;
  /** Avisos de preço e quantidade da última resposta da conta (a tela da Geladeira os mostra). */
  ajustes: AjusteDaGeladeira[];
  /** Esquece os avisos (a tela os mostra uma vez e, ao sair dela, eles somem). */
  limparAjustes: () => void;
  /** `geracao` é a da Geladeira logo depois do toque: o "Desfazer" só vale se ela não mudou. */
  adicionar: (cerveja: CervejaCard, quantidade?: number) => Resultado & { geracao: number };
  alterarQuantidade: (cervejaId: string, quantidade: number) => Resultado;
  remover: (cervejaId: string) => Desfazer | null;
  desfazer: (d: Desfazer) => void;
  /** O "Desfazer" de um adicionar: reverte só aquela cerveja, e só se nada mudou nela desde o toque. */
  reverterAdicao: (
    cervejaId: string,
    quantidades: { antes: number; depois: number },
    geracao: number,
  ) => void;
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
  const [sincronizacoes, setSincronizacoes] = useState(0);
  // Entrar e sair redirecionam: a mudança de página é o sinal para olhar a sessão de novo.
  const pagina = usePathname();
  // Geração da identidade/modo (convidado ou conta, página, sessão): sobe a cada mudança que torna
  // antiga uma resposta em voo. A chamada guarda a geração em que saiu e só vale se ainda for a atual.
  const geracao = useRef(0);
  const novaGeracao = useCallback(() => {
    geracao.current += 1;
  }, []);

  const aplicar = useCallback((proximo: EstadoDaGeladeira) => {
    atual.current = proximo;
    setEstado(proximo);
    gravarGeladeiraLocal(proximo);
  }, []);

  // Sessão acabou (saída da conta, ou outra conta no mesmo navegador): a cópia local é da conta anterior.
  const sairDaConta = useCallback(() => {
    novaGeracao();
    apagarGeladeiraLocal();
    gravarMarca(CHAVE_DA_CONTA, false);
    atual.current = GELADEIRA_VAZIA;
    setEstado(GELADEIRA_VAZIA);
    setAjustes([]);
  }, [novaGeracao]);

  // Manda a Geladeira inteira para a conta. Só falha de envio de mudança local deixa pendente.
  const enviar = useCallback(async () => {
    if (!conta) return;
    const resultado = await conta.enviar(paraRequest(atual.current)).catch(() => undefined);
    if (resultado?.tipo === "ok") {
      gravarMarca(CHAVE_PENDENTE, false);
      gravarMarca(CHAVE_DA_CONTA, true);
      setAjustes(resultado.resposta.ajustes);
      setSincronizacoes((n) => n + 1);
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
    novaGeracao();
    if (conta && lerMarca(CHAVE_DA_CONTA)) void enviar();
  }, [conta, enviar, novaGeracao]);

  // Convidado: ao abrir, a API confere preço e estoque da Geladeira local (não grava nada) e o que ela
  // devolve vira a Geladeira, com os avisos. Falha da validação deixa tudo como estava.
  const validarConvidado = useCallback(async () => {
    if (!conta || atual.current.itens.length === 0) return;
    const dela = geracao.current;
    const resultado = await conta.validar(paraRequest(atual.current)).catch(() => undefined);
    // Mudança de identidade, de página ou local enquanto a chamada estava em voo: a resposta é de
    // outro momento e é descartada, nem preço nem aviso.
    if (resultado?.tipo !== "ok" || dela !== geracao.current) return;
    setAjustes(resultado.resposta.ajustes);
    aplicar(aplicarResposta(atual.current, resultado.resposta));
  }, [conta, aplicar]);

  // A cada página (inclusive depois de entrar ou sair, que redirecionam): com sessão, aplica a regra
  // ao entrar; sem sessão, apaga a cópia de quem acabou de sair.
  useEffect(() => {
    if (!conta) return;
    novaGeracao();
    let ativo = true;
    (async () => {
      const sincronizada = lerMarca(CHAVE_DA_CONTA);
      if (sincronizada && lerMarca(CHAVE_PENDENTE)) return enviar();
      const antes = versao.current;
      const resultado = await conta.buscar().catch(() => undefined);
      if (!ativo || !resultado) return;
      if (resultado.tipo === "sem-sessao") {
        if (sincronizada) return sairDaConta();
        // A API só é chamada ao abrir a Geladeira, não a cada página.
        return pagina === "/geladeira" ? validarConvidado() : undefined;
      }
      // Erro ou conta sem perfil: nada muda e nada fica pendente (a cópia local não vale mais que a conta).
      if (resultado.tipo !== "ok") return;
      // Mudança feita enquanto o buscar estava em voo: a resposta é antiga.
      if (sincronizada && versao.current !== antes) return;
      // Um envio em voo pode ter falhado enquanto o buscar rodava: a mudança local pendente vale mais.
      if (sincronizada && lerMarca(CHAVE_PENDENTE)) return;
      gravarMarca(CHAVE_DA_CONTA, true);
      // A conta passa a mandar: qualquer validação do convidado em voo ficou para trás.
      novaGeracao();
      setAjustes(resultado.resposta.ajustes);
      setSincronizacoes((n) => n + 1);
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
  }, [conta, enviar, aplicar, sairDaConta, validarConvidado, novaGeracao, pagina]);

  // Estável: a tela o usa na limpeza de um efeito.
  const limparAjustes = useCallback(() => setAjustes([]), []);

  const contexto = useMemo<GeladeiraContexto>(
    () => ({
      pronta,
      estado,
      quantidadeTotal: quantidadeTotal(estado),
      sincronizacoes,
      ajustes,
      limparAjustes,
      adicionar: (cerveja, quantidade) => {
        const resultado = adicionarOp(atual.current, cerveja, quantidade);
        if (resultado.estado !== atual.current) {
          aplicar(resultado.estado);
          sincronizar();
        }
        return { ...resultado, geracao: geracao.current };
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
      reverterAdicao: (cervejaId, quantidades, daGeracao) => {
        // Login, logout, chegada da conta ou outra mudança local desde o toque: o Desfazer não vale mais.
        if (daGeracao !== geracao.current) return;
        const proximo = reverterAdicaoOp(atual.current, cervejaId, quantidades);
        if (proximo !== atual.current) {
          aplicar(proximo);
          sincronizar();
        }
      },
    }),
    [pronta, estado, sincronizacoes, ajustes, limparAjustes, aplicar, sincronizar],
  );

  return <Contexto.Provider value={contexto}>{children}</Contexto.Provider>;
}
