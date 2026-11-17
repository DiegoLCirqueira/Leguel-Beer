"use client";

import { enderecoFormSchema, type EnderecoResposta } from "@leguele/shared";
import { Building2, Hash, Home, MapPin, Navigation, Search, StickyNote, Tag } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import type { ResultadoDoSalvar } from "@/app/(loja)/conta/enderecos/actions";
import { Button, Campo } from "@/components/ui";
import type { ResultadoDoCep } from "@/lib/enderecos/cep";

export type FormularioProps = {
  buscarCep: (cep: string) => Promise<ResultadoDoCep>;
  salvar: (entrada: unknown) => Promise<ResultadoDoSalvar>;
  aoSalvar: () => void;
  aoCancelar: () => void;
  /** Endereço em edição; sem ele, o formulário é de um endereço novo. */
  inicial?: EnderecoResposta;
};

type Valores = {
  apelido: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
};

const AVISOS_DO_CEP: Record<Exclude<ResultadoDoCep["tipo"], "ok" | "invalido">, string> = {
  "nao-encontrado": "CEP não encontrado.",
  "fora-de-alagoas": "Por enquanto só entregamos em Alagoas.",
  indisponivel: "Não foi possível buscar o CEP agora.",
};

/** "57035000" vira "57035-000": o que não é dígito sai e passa de 8 dígitos é cortado. */
function mascararCep(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

const valoresIniciais = (inicial?: EnderecoResposta): Valores => ({
  apelido: inicial?.apelido ?? "",
  cep: inicial ? mascararCep(inicial.cep) : "",
  rua: inicial?.rua ?? "",
  numero: inicial?.numero ?? "",
  complemento: inicial?.complemento ?? "",
  bairro: inicial?.bairro ?? "",
  cidade: inicial?.cidade ?? "",
});

/** Mensagem de cada campo, na ordem dos problemas (a primeira de cada campo vale). */
function errosPorCampo(problemas: { path: PropertyKey[]; message: string }[]) {
  const erros: Record<string, string> = {};
  for (const problema of problemas) {
    const campo = String(problema.path[0] ?? "");
    if (campo && !(campo in erros)) erros[campo] = problema.message;
  }
  return erros;
}

/** Formulário de endereço (tela 20): o CEP completo preenche rua, bairro e cidade; o resto é à mão. */
export function FormularioDeEndereco({
  buscarCep,
  salvar,
  aoSalvar,
  aoCancelar,
  inicial,
}: FormularioProps) {
  const [valores, setValores] = useState<Valores>(() => valoresIniciais(inicial));
  const [erros, setErros] = useState<Record<string, string>>({});
  const [avisoDoCep, setAvisoDoCep] = useState<string | undefined>();
  const [erroGeral, setErroGeral] = useState<string | undefined>();
  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  // O CEP da busca mais recente: resposta de um CEP já trocado é descartada.
  const cepDaBusca = useRef("");

  const mudar = (campo: keyof Valores, valor: string) =>
    setValores((atual) => ({ ...atual, [campo]: valor }));

  async function procurar(cep: string) {
    cepDaBusca.current = cep;
    setBuscando(true);
    setAvisoDoCep(undefined);
    let resultado: ResultadoDoCep;
    try {
      resultado = await buscarCep(cep);
    } catch {
      resultado = { tipo: "indisponivel" };
    }
    if (cepDaBusca.current !== cep) return;
    setBuscando(false);
    if (resultado.tipo === "ok") {
      setValores((atual) => ({
        ...atual,
        rua: resultado.rua,
        bairro: resultado.bairro,
        cidade: resultado.cidade,
      }));
      setErros((atual) => ({ ...atual, cep: "", rua: "", bairro: "", cidade: "" }));
      document.getElementById("numero")?.focus();
    } else if (resultado.tipo !== "invalido") {
      setAvisoDoCep(AVISOS_DO_CEP[resultado.tipo]);
    }
  }

  function mudarCep(digitado: string) {
    const cep = mascararCep(digitado);
    mudar("cep", cep);
    setAvisoDoCep(undefined);
    if (cep.length === 9) void procurar(cep);
    else {
      cepDaBusca.current = "";
      setBuscando(false);
    }
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErroGeral(undefined);
    const entrada = { ...valores, uf: "AL" };
    const validacao = enderecoFormSchema.safeParse(entrada);
    if (!validacao.success) {
      const novos = errosPorCampo(validacao.error.issues);
      setErros(novos);
      document.getElementById(Object.keys(novos)[0] ?? "")?.focus();
      return;
    }
    setErros({});
    setEnviando(true);
    try {
      const resultado = await salvar(entrada);
      if (resultado.tipo === "ok") aoSalvar();
      else if (resultado.tipo === "invalido") setErros(resultado.erros);
      else if (resultado.tipo === "sem-sessao") {
        setErroGeral("Sua sessão acabou. Entre de novo para continuar.");
      } else setErroGeral(resultado.mensagem);
    } catch {
      setErroGeral("Não foi possível salvar agora. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-texto">
        {inicial ? "Editar endereço" : "Novo endereço"}
      </h2>
      <Campo
        id="apelido"
        name="apelido"
        rotulo="Apelido"
        icone={Tag}
        placeholder="Casa, Trabalho..."
        maxLength={30}
        value={valores.apelido}
        onChange={(e) => mudar("apelido", e.target.value)}
        erro={erros.apelido}
      />
      <div className="flex flex-col gap-1">
        <Campo
          id="cep"
          name="cep"
          rotulo="CEP"
          icone={Search}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={valores.cep}
          onChange={(e) => mudarCep(e.target.value)}
          erro={erros.cep}
        />
        {buscando ? (
          <p role="status" className="px-2 text-sm text-texto-suave">
            Buscando o CEP...
          </p>
        ) : avisoDoCep ? (
          <p role="status" className="px-2 text-sm text-erro">
            {avisoDoCep}
          </p>
        ) : null}
      </div>
      <Campo
        id="rua"
        name="rua"
        rotulo="Rua"
        icone={Navigation}
        autoComplete="address-line1"
        maxLength={120}
        value={valores.rua}
        onChange={(e) => mudar("rua", e.target.value)}
        erro={erros.rua}
      />
      <Campo
        id="numero"
        name="numero"
        rotulo="Número"
        icone={Hash}
        maxLength={10}
        value={valores.numero}
        onChange={(e) => mudar("numero", e.target.value)}
        erro={erros.numero}
      />
      <Campo
        id="complemento"
        name="complemento"
        rotulo="Complemento"
        icone={StickyNote}
        autoComplete="address-line2"
        maxLength={60}
        value={valores.complemento}
        onChange={(e) => mudar("complemento", e.target.value)}
        erro={erros.complemento}
      />
      <Campo
        id="bairro"
        name="bairro"
        rotulo="Bairro"
        icone={Home}
        maxLength={80}
        value={valores.bairro}
        onChange={(e) => mudar("bairro", e.target.value)}
        erro={erros.bairro}
      />
      <Campo
        id="cidade"
        name="cidade"
        rotulo="Cidade"
        icone={Building2}
        autoComplete="address-level2"
        maxLength={80}
        value={valores.cidade}
        onChange={(e) => mudar("cidade", e.target.value)}
        erro={erros.cidade}
      />
      <Campo id="uf" name="uf" rotulo="UF" icone={MapPin} value="AL" readOnly />
      {erroGeral ? (
        <p role="alert" className="px-2 text-sm text-erro">
          {erroGeral}
        </p>
      ) : null}
      <Button type="submit" loading={enviando} disabled={enviando}>
        Salvar endereço
      </Button>
      <Button type="button" variant="outline" disabled={enviando} onClick={aoCancelar}>
        Cancelar
      </Button>
    </form>
  );
}
