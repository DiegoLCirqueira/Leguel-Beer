"use client";

import { estoqueBaixo, type CervejaDetalhe } from "@leguele/shared";
import { Layers, PackageX, Refrigerator, Truck } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { BarraFixa, BlocoDePreco, Button, Stepper, StyleBadge } from "@/components/ui";

// Sem imagemUrl a página usa uma imagem padrão (a marca); as imagens por categoria vêm do LB-124.
const IMAGEM_PADRAO = "/maioridade/logo.webp";

const teor = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
    valor,
  );

const avisoDeEstoque = (n: number) =>
  n === 1 ? "Última unidade em estoque!" : `Últimas ${n} unidades em estoque!`;

/** Página de produto: ficha, preço com desconto, aviso de estoque, quantidade e o botão fixo. */
export function ProdutoConteudo({ cerveja }: { cerveja: CervejaDetalhe }) {
  const idMotivo = useId();
  const [quantidade, setQuantidade] = useState(1);
  const {
    nome,
    estilo,
    categoria,
    teorAlcoolico,
    ibu,
    volumeMl,
    imagemUrl,
    descricao,
    esgotada,
    quantidadeDisponivel,
  } = cerveja;

  return (
    <>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pb-6 pt-2">
        <div className="relative flex min-h-56 items-center justify-center">
          <Image
            src={imagemUrl ?? IMAGEM_PADRAO}
            alt={imagemUrl ? `${nome}, ${estilo}` : ""}
            width={240}
            height={240}
            sizes="240px"
            priority
            className="h-52 w-auto object-contain"
          />
          {esgotada ? (
            <span className="absolute right-0 top-1/3 inline-flex items-center gap-1 rounded-full border-2 border-erro bg-fundo px-3 py-1 text-sm font-semibold text-erro">
              <PackageX aria-hidden="true" className="size-4" />
              Esgotado
            </span>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-2">
          <StyleBadge slug={categoria.slug} name={categoria.nome} />
          <h1 className="font-titulo text-balance text-4xl leading-tight text-texto">{nome}</h1>
          <p className="text-lg text-texto-suave">{estilo}</p>
        </div>
        <ul aria-label="Ficha técnica" className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Teor alcoólico", `${teor(teorAlcoolico)}%`],
            ["IBU", String(ibu)],
            ["Volume", `${volumeMl} ml`],
          ].map(([rotulo, valor]) => (
            <li
              key={rotulo}
              className="flex flex-col gap-1 rounded-2xl border border-borda bg-superficie/70 px-2 py-3"
            >
              <span className="text-xs text-texto-suave">{rotulo}</span>
              <span className="text-lg font-semibold text-texto">{valor}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-4 rounded-3xl border border-borda bg-superficie/70 p-4">
          <BlocoDePreco
            precoCentavos={cerveja.precoCentavos}
            precoAnteriorCentavos={cerveja.precoAnteriorCentavos}
            descontoPercentual={cerveja.descontoPercentual}
          />
          {esgotada ? null : (
            <Stepper
              valor={quantidade}
              aoAlterar={setQuantidade}
              max={quantidadeDisponivel}
              rotulo={`Quantidade de ${nome}`}
              className="self-start"
            />
          )}
        </div>
        {!esgotada && estoqueBaixo(quantidadeDisponivel) ? (
          <p className="flex items-center gap-3 rounded-2xl border border-aviso bg-superficie/70 px-4 py-3 font-semibold text-aviso">
            <Layers aria-hidden="true" className="size-6 shrink-0" />
            {avisoDeEstoque(quantidadeDisponivel)}
          </p>
        ) : null}
        <p className="flex items-center gap-3 rounded-2xl border border-borda px-4 py-3 text-texto">
          <Truck aria-hidden="true" className="size-6 shrink-0 text-primaria" />
          Frete grátis em compras acima de R$ 150,00
        </p>
        {descricao ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-texto">Sobre a cerveja</h2>
            <p className="leading-relaxed text-texto-suave">{descricao}</p>
          </section>
        ) : null}
      </main>
      <BarraFixa>
        <Button
          disabled
          aria-describedby={idMotivo}
          iconLeft={<Refrigerator aria-hidden="true" className="size-5" />}
        >
          Adicionar à geladeira
        </Button>
        <span id={idMotivo} className="sr-only">
          {esgotada ? "Cerveja esgotada." : "A Geladeira ainda não está disponível."}
        </span>
      </BarraFixa>
    </>
  );
}
