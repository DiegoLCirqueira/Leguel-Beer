"use client";

import { novaSenhaSchema } from "@leguele/shared";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Campo } from "./campo";
import { OlhoDaSenha } from "./olho-da-senha";

export type RespostaNovaSenha =
  | { tipo: "invalido"; erros: Partial<Record<"senha" | "confirmacao", string>> }
  | { tipo: "link-invalido" }
  | { tipo: "erro" };

type Props = {
  /** Dando certo, a ação redireciona no servidor e não devolve nada. */
  salvar: (dados: { senha: string; confirmacao: string }) => Promise<RespostaNovaSenha | void>;
};

export function LinkInvalido() {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 text-center">
      <p className="text-texto">Este link expirou ou já foi usado.</p>
      <Link
        href="/recuperar-senha"
        className="inline-flex min-h-11 items-center font-semibold text-primaria underline underline-offset-2"
      >
        Pedir novo link
      </Link>
    </div>
  );
}

export function NovaSenhaForm({ salvar }: Props) {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmacao, setVerConfirmacao] = useState(false);
  const [erros, setErros] = useState<Partial<Record<"senha" | "confirmacao", string>>>({});
  const [resposta, setResposta] = useState<"link-invalido" | "erro" | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setResposta(null);
    const validacao = novaSenhaSchema.safeParse({ senha, confirmacao });
    if (!validacao.success) {
      const problemas: Partial<Record<"senha" | "confirmacao", string>> = {};
      for (const problema of validacao.error.issues) {
        const campo = problema.path[0];
        if ((campo === "senha" || campo === "confirmacao") && !problemas[campo]) {
          problemas[campo] = problema.message;
        }
      }
      setErros(problemas);
      document.getElementById(problemas.senha ? "senha" : "confirmacao")?.focus();
      return;
    }
    setErros({});
    setEnviando(true);
    try {
      const retorno = await salvar({ senha, confirmacao });
      if (!retorno) return;
      if (retorno.tipo === "invalido") setErros(retorno.erros);
      else setResposta(retorno.tipo);
    } catch {
      setResposta("erro");
    } finally {
      setEnviando(false);
    }
  }

  if (resposta === "link-invalido") return <LinkInvalido />;

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <Campo
        id="senha"
        name="senha"
        rotulo="Nova senha"
        icone={Lock}
        type={verSenha ? "text" : "password"}
        placeholder="Digite a nova senha"
        autoComplete="new-password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        erro={erros.senha}
        acao={<OlhoDaSenha visivel={verSenha} alternar={() => setVerSenha((v) => !v)} />}
      />
      <Campo
        id="confirmacao"
        name="confirmacao"
        rotulo="Confirmar senha"
        icone={Lock}
        type={verConfirmacao ? "text" : "password"}
        placeholder="Confirme a nova senha"
        autoComplete="new-password"
        value={confirmacao}
        onChange={(e) => setConfirmacao(e.target.value)}
        erro={erros.confirmacao}
        acao={
          <OlhoDaSenha visivel={verConfirmacao} alternar={() => setVerConfirmacao((v) => !v)} />
        }
      />

      {resposta === "erro" ? (
        <p role="alert" className="text-center text-sm text-erro">
          Não foi possível concluir agora. Tente de novo em instantes.
        </p>
      ) : null}

      <Button
        type="submit"
        loading={enviando}
        iconRight={<ArrowRight aria-hidden="true" className="size-5" />}
      >
        Salvar nova senha
      </Button>
    </form>
  );
}
