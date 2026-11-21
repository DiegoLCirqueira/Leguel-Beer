"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { excluirEnderecoAction, tornarPadraoAction } from "@/app/(loja)/conta/enderecos/actions";
import type { ResultadoDaAcao } from "@/app/(loja)/conta/enderecos/actions";
import { Button } from "@/components/ui";

const AVISOS: Record<Exclude<ResultadoDaAcao["tipo"], "ok">, string> = {
  erro: "Não foi possível concluir agora. Tente de novo.",
  "nao-encontrado": "Este endereço não existe mais.",
  "sem-sessao": "Sua sessão acabou. Entre de novo para continuar.",
};

/** Id do título da página: o foco vai para ele quando o botão pressionado some da lista. */
export const ID_TITULO_ENDERECOS = "titulo-meus-enderecos";

type Props = { id: string; nome: string; padrao: boolean };

/** "Tornar padrão" e "Excluir" de um endereço. A lista se atualiza pela ação do servidor. */
export function AcoesDoEndereco({ id, nome, padrao }: Props) {
  const [ocupado, iniciar] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);

  const executar = (acao: (id: string) => Promise<ResultadoDaAcao>, excluindo = false) => {
    setAviso(null);
    iniciar(async () => {
      const { tipo } = await acao(id);
      if (tipo !== "ok") setAviso(AVISOS[tipo]);
      else if (excluindo) document.getElementById(ID_TITULO_ENDERECOS)?.focus();
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {padrao ? null : (
          <Button
            size="sm"
            variant="outline"
            className="w-auto"
            disabled={ocupado}
            aria-label={`Tornar padrão: ${nome}`}
            onClick={() => executar(tornarPadraoAction)}
          >
            Tornar padrão
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="w-auto"
          disabled={ocupado}
          aria-label={`Excluir: ${nome}`}
          iconLeft={<Trash2 aria-hidden="true" className="size-4" />}
          onClick={() => executar(excluirEnderecoAction, true)}
        >
          Excluir
        </Button>
      </div>
      {aviso ? (
        <p role="alert" className="text-sm text-erro">
          {aviso}
        </p>
      ) : null}
    </div>
  );
}
