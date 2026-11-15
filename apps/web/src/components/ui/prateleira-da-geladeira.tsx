"use client";

import type { CSSProperties } from "react";
import { useAnimacaoDasGarrafas } from "@/lib/geladeira/animacao-das-garrafas";
import { arrumarPrateleira } from "@/lib/geladeira/arrumar-prateleira";
import type { ItemLocal } from "@/lib/geladeira/estado";
import { posicaoDaFaixa, posicaoDaGarrafa } from "@/lib/geladeira/geometria";
import { FaixaDaPrateleira } from "./faixa-da-prateleira";
import { GarrafaFantasma } from "./garrafa-fantasma";
import { ImagemDaGarrafa } from "./imagem-da-garrafa";

export const IMAGEM_DA_MOLDURA = "/geladeira/moldura.webp";

export type PrateleiraDaGeladeiraProps = {
  /** Posição da prateleira na moldura, de 0 (em cima) a 3. */
  indice: number;
  categoria: { slug: string; nome: string };
  /** Só os itens desta categoria, na ordem de entrada. */
  itens: ItemLocal[];
};

const emPercentual = (p: ReturnType<typeof posicaoDaGarrafa>): CSSProperties => ({
  left: `${p.left}%`,
  bottom: `${p.bottom}%`,
  width: `${p.width}%`,
  height: `${p.height}%`,
});

/** Uma prateleira da moldura: garrafas, garrafas fantasma e a faixa sobre o parapeito. */
export function PrateleiraDaGeladeira({ indice, categoria, itens }: PrateleiraDaGeladeiraProps) {
  const arrumacao = arrumarPrateleira(
    itens.map((i) => ({ cervejaId: i.cerveja.id, nome: i.cerveja.nome, quantidade: i.quantidade })),
  );
  const porId = new Map(itens.map((i) => [i.cerveja.id, i]));
  const garrafas = useAnimacaoDasGarrafas(
    arrumacao.garrafas.map((g) => ({
      ...g,
      imagemUrl: porId.get(g.cervejaId)?.cerveja.imagemUrl ?? null,
    })),
  );
  const faixa = posicaoDaFaixa(indice);
  return (
    <section aria-label={categoria.nome} className="pointer-events-none absolute inset-0">
      {garrafas.map((garrafa) => {
        const posicao = posicaoDaGarrafa(indice, garrafa.coluna, garrafa.fileira);
        return (
          <div
            key={garrafa.chave}
            data-garrafa=""
            data-animacao={garrafa.animacao}
            className="absolute"
            style={{
              ...emPercentual(posicao),
              zIndex: 30 - garrafa.fileira,
              filter: `brightness(${posicao.brilho})`,
            }}
          >
            <div
              key={garrafa.rodada}
              className="relative size-full origin-bottom"
              style={{ animationDelay: `${garrafa.atraso}ms` }}
            >
              <ImagemDaGarrafa imagemUrl={garrafa.imagemUrl} categoriaSlug={categoria.slug} />
            </div>
          </div>
        );
      })}
      {arrumacao.fantasmas.map((coluna) => (
        <div
          key={`fantasma-${coluna}`}
          className="pointer-events-auto absolute z-25"
          style={emPercentual(posicaoDaGarrafa(indice, coluna, 0))}
        >
          <GarrafaFantasma categoria={categoria} />
        </div>
      ))}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-35"
        style={{
          backgroundImage: `url(${IMAGEM_DA_MOLDURA})`,
          backgroundSize: "100% 100%",
          clipPath: faixa.recorte,
        }}
      />
      <div
        className="pointer-events-auto absolute left-[17.2%] z-40 flex h-[3.1%] w-[71%] origin-top-left flex-col justify-center rounded-t-[3px] rounded-b-lg border-t border-primaria/55 bg-gradient-to-b from-superficie to-fundo shadow-[0_4px_10px_var(--color-sombra)]"
        style={{ bottom: `${faixa.bottom}%`, transform: `rotate(${faixa.giro}rad)` }}
      >
        <FaixaDaPrateleira
          categoriaNome={categoria.nome}
          rotulos={arrumacao.rotulos.map((rotulo) => ({
            ...rotulo,
            totalCentavos:
              rotulo.quantidade * (porId.get(rotulo.cervejaId)?.cerveja.precoCentavos ?? 0),
          }))}
        />
      </div>
    </section>
  );
}
