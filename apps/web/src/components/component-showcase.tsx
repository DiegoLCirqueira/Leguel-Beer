"use client";

import { ArrowRight, Link2, Lock, UserRound } from "lucide-react";
import { useState } from "react";
import { Campo } from "@/components/auth/campo";
import { Button } from "@/components/ui/button";
import { CategoryChips } from "@/components/ui/category-chips";
import { StyleBadge } from "@/components/ui/style-badge";

const swatches = [
  { name: "fundo", className: "bg-fundo" },
  { name: "superficie", className: "bg-superficie" },
  { name: "superficie-elevada", className: "bg-superficie-elevada" },
  { name: "borda", className: "bg-borda" },
  { name: "borda-campo", className: "bg-borda-campo" },
  { name: "texto", className: "bg-texto" },
  { name: "texto-suave", className: "bg-texto-suave" },
  { name: "primaria", className: "bg-primaria" },
  { name: "sucesso", className: "bg-sucesso" },
  { name: "erro", className: "bg-erro" },
  { name: "aviso", className: "bg-aviso" },
];

const categories = [
  { id: "todas", label: "Todas", count: 16 },
  { id: "ipas", label: "IPAs", count: 4 },
  { id: "frutas", label: "Frutas", count: 4 },
];

const badges = [
  { slug: "ipa", name: "IPA" },
  { slug: "frutas", name: "Frutas" },
  { slug: "malt", name: "Malt" },
  { slug: "lager", name: "Lager" },
  { slug: "categoria-nova", name: "Neutro" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-texto-suave">{title}</h2>
      {children}
    </section>
  );
}

// Vitrine para conferência visual dos componentes; usada só em /dev/tokens.
export function ComponentShowcase() {
  const [category, setCategory] = useState("todas");

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <Section title="Botões">
        <Button
          iconLeft={<UserRound className="size-5" />}
          iconRight={<ArrowRight className="size-5" />}
        >
          Entrar
        </Button>
        <Button variant="outline">Criar conta</Button>
        <Button variant="ghost" iconLeft={<Link2 className="size-5" />}>
          Continuar como convidado
        </Button>
        <div className="flex gap-3">
          <Button size="sm">Adicionar</Button>
          <Button loading>Carregando</Button>
          <Button disabled variant="ghost">
            Desabilitado
          </Button>
        </div>
      </Section>
      <Section title="Campo de digitar (clique para ver o foco)">
        <Campo
          id="campo-exemplo"
          rotulo="Senha de exemplo"
          icone={Lock}
          placeholder="Digite sua senha"
        />
        <Campo
          id="campo-exemplo-erro"
          rotulo="Campo com erro"
          icone={Lock}
          erro="Mensagem de erro de exemplo"
        />
      </Section>
      <Section title="Badges de estilo">
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <StyleBadge key={badge.slug} {...badge} />
          ))}
        </div>
      </Section>
      <Section title="Chips de categoria">
        <CategoryChips items={categories} value={category} onChange={setCategory} />
      </Section>
      <Section title="Cores">
        <ul className="grid grid-cols-2 gap-2 text-xs">
          {swatches.map((swatch) => (
            <li key={swatch.name} className="flex items-center gap-2">
              <span
                className={`size-6 rounded-md border border-borda ${swatch.className}`}
                aria-hidden="true"
              />
              {swatch.name}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
