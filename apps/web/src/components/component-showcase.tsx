"use client";

import { ArrowRight, Link2, Lock, UserRound } from "lucide-react";
import { useState } from "react";
import {
  BottomSheet,
  Button,
  Campo,
  CategoryChips,
  DivisorOu,
  LojaHeader,
  LojaTabBar,
  Skeleton,
  StyleBadge,
  Toast,
} from "@/components/ui";

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
  const [sheetAberto, setSheetAberto] = useState(false);
  const [toastAberto, setToastAberto] = useState(false);

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
      <Section title="Divisor ou">
        <DivisorOu />
      </Section>
      <Section title="Cabeçalho e barra inferior da loja">
        <LojaHeader count={2} className="px-0" />
        <div className="relative h-16 overflow-hidden rounded-2xl border border-borda">
          <LojaTabBar className="absolute" />
        </div>
      </Section>
      <Section title="Bottom sheet, toast e skeleton">
        <div className="flex flex-wrap gap-3">
          <Button size="sm" variant="outline" onClick={() => setSheetAberto(true)}>
            Abrir bottom sheet
          </Button>
          <Button size="sm" variant="outline" onClick={() => setToastAberto(true)}>
            Mostrar toast
          </Button>
        </div>
        <div data-testid="exemplo-skeleton" className="flex flex-col gap-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <BottomSheet
          aberto={sheetAberto}
          aoFechar={() => setSheetAberto(false)}
          titulo="Filtros e ordenação"
          rodape={<Button onClick={() => setSheetAberto(false)}>Aplicar</Button>}
        >
          <div className="flex flex-col gap-3 pb-3">
            {Array.from({ length: 8 }, (_, i) => (
              <Campo
                key={i}
                id={`sheet-campo-${i}`}
                rotulo={`Campo ${i + 1}`}
                icone={Lock}
                placeholder="Exemplo de conteúdo que rola"
              />
            ))}
          </div>
        </BottomSheet>
        {toastAberto ? (
          <Toast
            mensagem="Munich Lager foi para a geladeira"
            acao={{ rotulo: "Desfazer", aoAcionar: () => undefined }}
            aoFechar={() => setToastAberto(false)}
          />
        ) : null}
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
