"use client";

import { ArrowRight, Check, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, Campo, OlhoDaSenha } from "@/components/ui";
import { validarEntrada } from "@/lib/auth/entrar";
import { ehErroDeRedirect } from "@/lib/erro-de-redirect";

export type RespostaEntrar =
  | { tipo: "invalido"; erros: Partial<Record<"email" | "senha", string>> }
  | { tipo: "credenciais" }
  | { tipo: "nao-confirmado"; email: string }
  | { tipo: "erro" };

type Props = {
  /** Em caso de sucesso a ação redireciona no servidor e não devolve nada. */
  entrar: (entrada: {
    email: string;
    senha: string;
    manterConectado: boolean;
  }) => Promise<RespostaEntrar | void>;
  reenviar: (email: string) => Promise<"enviado" | "erro">;
  emailInicial?: string;
  manterConectadoInicial: boolean;
};

type Aviso =
  | { tipo: "credenciais" }
  | { tipo: "nao-confirmado"; email: string }
  | { tipo: "reenviado"; email: string }
  | { tipo: "erro" };

export function EntrarForm({ entrar, reenviar, emailInicial = "", manterConectadoInicial }: Props) {
  const [email, setEmail] = useState(emailInicial);
  const [senha, setSenha] = useState("");
  const [manterConectado, setManterConectado] = useState(manterConectadoInicial);
  const [verSenha, setVerSenha] = useState(false);
  const [erros, setErros] = useState<Partial<Record<"email" | "senha", string>>>({});
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setAviso(null);
    const validacao = validarEntrada({ email, senha, manterConectado });
    if (!validacao.ok) {
      setErros(validacao.erros);
      document.getElementById(validacao.erros.email ? "email" : "senha")?.focus();
      return;
    }
    setErros({});
    setEnviando(true);
    try {
      const resposta = await entrar({ email, senha, manterConectado });
      if (!resposta) return;
      if (resposta.tipo === "invalido") setErros(resposta.erros);
      else setAviso(resposta);
    } catch (e) {
      // No sucesso a ação redireciona no servidor e a promise rejeita com o erro de redirect do Next.
      if (ehErroDeRedirect(e)) return;
      setAviso({ tipo: "erro" });
    } finally {
      setEnviando(false);
    }
  }

  /** Ao editar, o aviso vermelho some; "não confirmado" e "reenviado" continuam. */
  function limparAvisoVermelho() {
    setAviso((atual) => (atual?.tipo === "credenciais" || atual?.tipo === "erro" ? null : atual));
  }

  async function reenviarLink(destino: string) {
    const resultado = await reenviar(destino);
    setAviso(resultado === "enviado" ? { tipo: "reenviado", email: destino } : { tipo: "erro" });
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <Campo
        id="email"
        name="email"
        rotulo="E-mail"
        icone={Mail}
        type="email"
        placeholder="Digite seu e-mail"
        autoComplete="email"
        spellCheck={false}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          limparAvisoVermelho();
        }}
        erro={erros.email}
      />
      <Campo
        id="senha"
        name="senha"
        rotulo="Senha"
        icone={Lock}
        type={verSenha ? "text" : "password"}
        placeholder="Digite sua senha"
        autoComplete="current-password"
        value={senha}
        onChange={(e) => {
          setSenha(e.target.value);
          limparAvisoVermelho();
        }}
        erro={erros.senha}
        acao={<OlhoDaSenha visivel={verSenha} alternar={() => setVerSenha((v) => !v)} />}
      />

      <div className="flex items-center justify-between gap-3 text-sm text-texto">
        <label className="flex cursor-pointer items-center gap-3">
          <span className="relative block size-6 shrink-0">
            <input
              type="checkbox"
              name="manterConectado"
              checked={manterConectado}
              onChange={(e) => setManterConectado(e.target.checked)}
              className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-md border-2 border-primaria checked:bg-primaria focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
            />
            <Check
              aria-hidden="true"
              strokeWidth={3}
              className="pointer-events-none absolute inset-[15%] hidden size-[70%] text-texto-na-primaria peer-checked:block"
            />
          </span>
          Manter-me conectado
        </label>
        <Link
          href="/recuperar-senha"
          className="inline-flex min-h-11 items-center font-semibold text-primaria underline underline-offset-2"
        >
          Esqueci minha senha
        </Link>
      </div>

      {aviso?.tipo === "credenciais" ? (
        <p role="alert" className="text-center text-sm text-erro">
          E-mail ou senha inválidos
        </p>
      ) : null}
      {aviso?.tipo === "nao-confirmado" ? (
        <p role="alert" className="text-center text-sm text-aviso">
          Confirme seu e-mail para entrar. Não recebeu?{" "}
          <button
            type="button"
            onClick={() => reenviarLink(aviso.email)}
            className="inline-flex min-h-11 items-center font-semibold text-primaria underline underline-offset-2"
          >
            Reenviar link
          </button>
        </p>
      ) : null}
      {aviso?.tipo === "reenviado" ? (
        <p role="status" className="text-center text-sm text-sucesso">
          {`Enviamos um novo link para ${aviso.email}.`}
        </p>
      ) : null}
      {aviso?.tipo === "erro" ? (
        <p role="alert" className="text-center text-sm text-erro">
          Não foi possível concluir agora. Tente de novo em instantes.
        </p>
      ) : null}

      <Button
        type="submit"
        loading={enviando}
        iconRight={<ArrowRight aria-hidden="true" className="size-5" />}
      >
        Entrar
      </Button>

      <div className="flex flex-col items-center gap-1 pt-2 text-sm text-texto">
        <p>Ainda não tem conta?</p>
        <Link
          href="/criar-conta"
          className="inline-flex min-h-11 items-center font-semibold text-primaria underline underline-offset-2"
        >
          Criar conta
        </Link>
      </div>
    </form>
  );
}
