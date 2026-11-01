"use client";

import { ArrowRight, Check, Lock, Mail, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, Campo, OlhoDaSenha } from "@/components/ui";
import {
  validarCadastro,
  type CampoCadastro,
  type EntradaCadastro,
  type ResultadoCriarConta,
} from "@/lib/auth/criar-conta";
import { mascararTelefone } from "@/lib/mascara-telefone";

type Props = { criar: (entrada: EntradaCadastro) => Promise<ResultadoCriarConta> };

type Aviso =
  | { tipo: "enviado"; email: string }
  | { tipo: "email-ja-cadastrado"; email: string }
  | { tipo: "erro" };

const ORDEM_DOS_CAMPOS: CampoCadastro[] = [
  "nome",
  "email",
  "telefone",
  "senha",
  "confirmacao",
  "aceite",
];

const VAZIO: EntradaCadastro = {
  nome: "",
  email: "",
  telefone: "",
  senha: "",
  confirmacao: "",
  aceite: false,
};

export function CriarContaForm({ criar }: Props) {
  const [valores, setValores] = useState<EntradaCadastro>(VAZIO);
  const [erros, setErros] = useState<Partial<Record<CampoCadastro, string>>>({});
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmacao, setVerConfirmacao] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  function alterar<K extends keyof EntradaCadastro>(campo: K, valor: EntradaCadastro[K]) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setAviso(null);
    const validacao = validarCadastro(valores);
    if (!validacao.ok) {
      setErros(validacao.erros);
      const primeiro = ORDEM_DOS_CAMPOS.find((campo) => validacao.erros[campo]);
      if (primeiro) document.getElementById(primeiro)?.focus();
      return;
    }
    setErros({});
    setEnviando(true);
    try {
      const resultado = await criar(valores);
      if (resultado.tipo === "invalido") setErros(resultado.erros);
      else setAviso(resultado);
    } catch {
      setAviso({ tipo: "erro" });
    } finally {
      setEnviando(false);
    }
  }

  if (aviso?.tipo === "enviado") {
    return (
      <p
        role="status"
        className="rounded-2xl border border-primaria bg-superficie/70 px-4 py-4 text-center text-texto"
      >
        {`Enviamos um link de confirmação para ${aviso.email}. Abra o e-mail para ativar sua conta.`}
      </p>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <Campo
        id="nome"
        name="nome"
        rotulo="Nome completo"
        icone={UserRound}
        placeholder="Digite seu nome completo"
        autoComplete="name"
        value={valores.nome}
        onChange={(e) => alterar("nome", e.target.value)}
        erro={erros.nome}
      />
      <Campo
        id="email"
        name="email"
        rotulo="E-mail"
        icone={Mail}
        type="email"
        placeholder="Digite seu e-mail"
        autoComplete="email"
        spellCheck={false}
        value={valores.email}
        onChange={(e) => alterar("email", e.target.value)}
        erro={erros.email}
      />
      <Campo
        id="telefone"
        name="telefone"
        rotulo="Telefone"
        icone={Phone}
        type="tel"
        inputMode="numeric"
        placeholder="(00) 00000-0000"
        autoComplete="tel-national"
        value={valores.telefone}
        onChange={(e) => alterar("telefone", mascararTelefone(e.target.value))}
        erro={erros.telefone}
      />
      <Campo
        id="senha"
        name="senha"
        rotulo="Senha"
        icone={Lock}
        type={verSenha ? "text" : "password"}
        placeholder="Digite sua senha"
        autoComplete="new-password"
        value={valores.senha}
        onChange={(e) => alterar("senha", e.target.value)}
        erro={erros.senha}
        acao={<OlhoDaSenha visivel={verSenha} alternar={() => setVerSenha((v) => !v)} />}
      />
      <Campo
        id="confirmacao"
        name="confirmacao"
        rotulo="Confirmar senha"
        icone={Lock}
        type={verConfirmacao ? "text" : "password"}
        placeholder="Confirme sua senha"
        autoComplete="new-password"
        value={valores.confirmacao}
        onChange={(e) => alterar("confirmacao", e.target.value)}
        erro={erros.confirmacao}
        acao={
          <OlhoDaSenha visivel={verConfirmacao} alternar={() => setVerConfirmacao((v) => !v)} />
        }
      />

      <div className="flex flex-col gap-1">
        <label className="relative flex cursor-pointer items-center gap-3 text-sm text-texto">
          <span className="relative block size-6 shrink-0">
            <input
              id="aceite"
              name="aceite"
              type="checkbox"
              checked={valores.aceite}
              onChange={(e) => alterar("aceite", e.target.checked)}
              aria-describedby={erros.aceite ? "aceite-erro" : undefined}
              aria-invalid={erros.aceite ? true : undefined}
              className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-md border-2 border-primaria checked:bg-primaria focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
            />
            <Check
              aria-hidden="true"
              strokeWidth={3}
              className="pointer-events-none absolute inset-[15%] hidden size-[70%] text-texto-na-primaria peer-checked:block"
            />
          </span>
          <span>
            Eu aceito os{" "}
            <Link
              href="/termos"
              target="_blank"
              rel="noopener"
              className="font-semibold text-primaria underline underline-offset-2"
            >
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link
              href="/privacidade"
              target="_blank"
              rel="noopener"
              className="font-semibold text-primaria underline underline-offset-2"
            >
              Política de Privacidade
            </Link>
          </span>
        </label>
        {erros.aceite ? (
          <p id="aceite-erro" className="px-2 text-sm text-erro">
            {erros.aceite}
          </p>
        ) : null}
      </div>

      {aviso?.tipo === "email-ja-cadastrado" ? (
        <p role="alert" className="text-center text-sm text-erro">
          Este e-mail já tem conta.{" "}
          <Link
            href={`/entrar?email=${encodeURIComponent(aviso.email)}`}
            className="font-semibold text-primaria underline underline-offset-2"
          >
            Entrar
          </Link>
          ?
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
        Criar conta
      </Button>

      <div className="flex flex-col items-center gap-1 pt-2 text-sm text-texto">
        <p>Já tem uma conta?</p>
        <Link
          href="/entrar"
          className="inline-flex min-h-11 items-center font-semibold text-primaria underline underline-offset-2"
        >
          Entrar
        </Link>
      </div>
    </form>
  );
}
