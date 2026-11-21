import type { EnderecoResposta } from "@leguele/shared";
import { MapPin } from "lucide-react";

const comMascara = (cep: string) => `${cep.slice(0, 5)}-${cep.slice(5)}`;

type Props = {
  endereco: EnderecoResposta;
  /** `name` do grupo de radios. */
  grupo: string;
  selecionado: boolean;
  aoEscolher: (id: string) => void;
};

/** Um endereço para escolher entre vários (Entrega do checkout), como um radio em cartão. */
export function OpcaoDeEndereco({ endereco, grupo, selecionado, aoEscolher }: Props) {
  return (
    <li>
      <label
        className={`flex min-h-11 cursor-pointer gap-3 rounded-2xl border p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primaria ${
          selecionado ? "border-primaria bg-superficie" : "border-borda-campo bg-superficie/70"
        }`}
      >
        <input
          type="radio"
          name={grupo}
          value={endereco.id}
          checked={selecionado}
          onChange={() => aoEscolher(endereco.id)}
          className="mt-1 size-5 shrink-0 accent-primaria"
        />
        <MapPin aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-primaria" />
        <span className="flex min-w-0 flex-1 flex-col gap-1 text-sm text-texto">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold">{endereco.apelido ?? "Endereço"}</span>
            {endereco.padrao ? (
              <span className="rounded-full bg-primaria px-3 py-1 text-xs font-semibold text-texto-badge">
                Padrão
              </span>
            ) : null}
            {endereco.foraDaArea ? (
              <span className="rounded-full border border-erro px-3 py-1 text-xs font-semibold text-erro">
                Fora da área
              </span>
            ) : null}
          </span>
          <span>
            {endereco.rua}, {endereco.numero}
          </span>
          <span>
            {endereco.bairro} — {endereco.cidade}/{endereco.uf}
          </span>
          <span className="text-texto-suave">CEP {comMascara(endereco.cep)}</span>
        </span>
      </label>
    </li>
  );
}
