import type { EnderecoResposta } from "@leguele/shared";
import { MapPin } from "lucide-react";
import type { ReactNode } from "react";

const comMascara = (cep: string) => `${cep.slice(0, 5)}-${cep.slice(5)}`;

/** Um endereço da lista de "Meus endereços", com os selos "Padrão" e "Fora da área". */
export function CartaoDeEndereco({
  endereco,
  acoes,
}: {
  endereco: EnderecoResposta;
  /** Botões do endereço (tornar padrão, excluir), vindos da tela. */
  acoes?: ReactNode;
}) {
  return (
    <li className="flex gap-3 rounded-2xl border border-borda-campo bg-superficie/70 p-4">
      <MapPin aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-primaria" />
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm text-texto">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold">{endereco.apelido ?? "Endereço"}</h2>
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
        </div>
        <p>
          {endereco.rua}, {endereco.numero}
        </p>
        <p>
          {endereco.bairro} — {endereco.cidade}/{endereco.uf}
        </p>
        <p className="text-texto-suave">CEP {comMascara(endereco.cep)}</p>
        {acoes}
      </div>
    </li>
  );
}
