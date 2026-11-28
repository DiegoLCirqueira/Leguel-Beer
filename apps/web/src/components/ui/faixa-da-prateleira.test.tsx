import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FaixaDaPrateleira } from "./faixa-da-prateleira";

describe("FaixaDaPrateleira", () => {
  it("prateleira vazia convida a escolher uma cerveja da categoria", () => {
    render(<FaixaDaPrateleira categoriaNome="Frutas" rotulos={[]} />);

    expect(screen.getByText("Toque no + para escolher uma Frutas")).toBeInTheDocument();
  });

  it("cada rótulo mostra o nome e ×N, e o leitor de tela lê nome, unidades e total", () => {
    render(
      <FaixaDaPrateleira
        categoriaNome="IPA"
        rotulos={[
          { cervejaId: "a", nome: "Maré Alta", quantidade: 2, totalCentavos: 6400, coluna: 0 },
          {
            cervejaId: "b",
            nome: "Leguelé Carnaval",
            quantidade: 1,
            totalCentavos: 3200,
            coluna: 1,
          },
        ]}
      />,
    );

    expect(screen.getByText("×2")).toBeInTheDocument();
    expect(screen.getByText("×1")).toBeInTheDocument();
    expect(screen.getByText(/^Maré Alta, 2 unidades, R\$\s64,00$/)).toBeInTheDocument();
    expect(screen.getByText(/^Leguelé Carnaval, 1 unidade, R\$\s32,00$/)).toBeInTheDocument();
    expect(screen.queryByText(/Toque no \+/)).not.toBeInTheDocument();
  });

  it("cada cerveja ganha a própria placa em pílula, com o nome curto (sem o prefixo da marca) inteiro", () => {
    const { container } = render(
      <FaixaDaPrateleira
        categoriaNome="IPA"
        rotulos={[
          { cervejaId: "a", nome: "Maré Alta", quantidade: 2, totalCentavos: 6400, coluna: 0 },
          {
            cervejaId: "b",
            nome: "Leguelé Carnaval",
            quantidade: 4,
            totalCentavos: 12800,
            coluna: 2,
          },
        ]}
      />,
    );

    const placas = container.querySelectorAll("[data-placa]");
    expect(placas).toHaveLength(2);
    placas.forEach((placa) => expect(placa.className).toMatch(/rounded-full/));
    expect(screen.getByText("Carnaval")).toBeInTheDocument();
    expect(screen.queryByText("Leguelé Carnaval", { selector: "[aria-hidden]" })).toBeNull();
  });

  it("o convite da prateleira vazia é uma pílula centralizada", () => {
    const { container } = render(<FaixaDaPrateleira categoriaNome="Malt" rotulos={[]} />);

    const placa = container.querySelector("[data-placa]");
    expect(placa).toHaveTextContent("Toque no + para escolher uma Malt");
    expect(placa?.className).toMatch(/rounded-full/);
    expect(placa?.className).toMatch(/justify-self-center/);
    // Legível sobre a faixa escura: texto pleno (não o suave) e borda um pouco mais viva.
    expect(placa?.className).toMatch(/text-texto(?!-)/);
    expect(placa?.className).toMatch(/border-primaria\/60/);
  });

  it("nome longo ou sem espaço fica dentro da coluna: só o nome trunca e o ×N segue visível", () => {
    const { container } = render(
      <FaixaDaPrateleira
        categoriaNome="Lager"
        rotulos={[
          {
            cervejaId: "a",
            nome: "Ponta Verde Pilsen",
            quantidade: 1,
            totalCentavos: 3200,
            coluna: 0,
          },
          {
            cervejaId: "b",
            nome: "Superlongonomesemespaco",
            quantidade: 1,
            totalCentavos: 3200,
            coluna: 1,
          },
        ]}
      />,
    );

    container.querySelectorAll("[data-placa]").forEach((placa) => {
      expect(placa.className).toMatch(/min-w-0/);
      expect(placa.className).toMatch(/max-w-full/);
      expect(placa.querySelector("em")?.className).not.toMatch(/truncate/);
      expect(placa.querySelector("em")?.className).toMatch(/shrink-0/);
    });
    expect(screen.getByText("Ponta").className).toMatch(/truncate/);
    expect(screen.getByText("Superlongonomesemespaco").className).toMatch(/truncate/);
  });

  it("com várias cervejas na prateleira, a placa mostra o apelido (1ª palavra), reconhecível sem truncar", () => {
    render(
      <FaixaDaPrateleira
        categoriaNome="IPA"
        rotulos={[
          { cervejaId: "a", nome: "Maré Alta IPA", quantidade: 2, totalCentavos: 6400, coluna: 0 },
          {
            cervejaId: "b",
            nome: "Jaraguá Premium",
            quantidade: 1,
            totalCentavos: 3200,
            coluna: 1,
          },
          {
            cervejaId: "c",
            nome: "Leguelé Carnaval",
            quantidade: 4,
            totalCentavos: 12800,
            coluna: 2,
          },
        ]}
      />,
    );

    expect(screen.getByText("Maré")).toBeInTheDocument();
    expect(screen.getByText("Jaraguá")).toBeInTheDocument();
    expect(screen.getByText("Carnaval")).toBeInTheDocument();
    expect(screen.getByText(/^Maré Alta IPA, 2 unidades/)).toBeInTheDocument();
  });

  it("com uma cerveja só, a placa mostra até duas palavras do nome", () => {
    render(
      <FaixaDaPrateleira
        categoriaNome="IPA"
        rotulos={[
          { cervejaId: "a", nome: "Maré Alta IPA", quantidade: 2, totalCentavos: 6400, coluna: 0 },
        ]}
      />,
    );

    expect(screen.getByText("Maré Alta")).toBeInTheDocument();
  });

  it("quando a 1ª palavra se repete, a placa mostra o que distingue (sem o prefixo comum), curto e único", () => {
    render(
      <FaixaDaPrateleira
        categoriaNome="Lager"
        rotulos={[
          {
            cervejaId: "a",
            nome: "Jaraguá Premium",
            quantidade: 1,
            totalCentavos: 3200,
            coluna: 0,
          },
          { cervejaId: "b", nome: "Jaraguá Extra", quantidade: 1, totalCentavos: 3200, coluna: 1 },
          { cervejaId: "c", nome: "Carnaval", quantidade: 1, totalCentavos: 3200, coluna: 2 },
        ]}
      />,
    );

    expect(screen.getByText("Premium")).toBeInTheDocument();
    expect(screen.getByText("Extra")).toBeInTheDocument();
    expect(screen.getByText("Carnaval")).toBeInTheDocument();
    // O leitor de tela segue lendo o nome completo.
    expect(screen.getByText(/^Jaraguá Premium, 1 unidade/)).toBeInTheDocument();
  });

  it("nome só de sigla (Ale, Lager) cai no nome inteiro, nunca numa placa vazia", () => {
    render(
      <FaixaDaPrateleira
        categoriaNome="Lager"
        rotulos={[
          { cervejaId: "a", nome: "Lager", quantidade: 1, totalCentavos: 3200, coluna: 0 },
          { cervejaId: "b", nome: "Carnaval", quantidade: 1, totalCentavos: 3200, coluna: 1 },
        ]}
      />,
    );

    expect(screen.getByText("Lager")).toBeInTheDocument();
  });

  it("nomes que só diferem pela sigla (IPA, Lager) mostram o nome inteiro, para não ficarem iguais", () => {
    render(
      <FaixaDaPrateleira
        categoriaNome="IPA"
        rotulos={[
          { cervejaId: "a", nome: "Maré IPA", quantidade: 1, totalCentavos: 3200, coluna: 0 },
          { cervejaId: "b", nome: "Maré Lager", quantidade: 1, totalCentavos: 3200, coluna: 1 },
        ]}
      />,
    );

    expect(screen.getByText("Maré IPA")).toBeInTheDocument();
    expect(screen.getByText("Maré Lager")).toBeInTheDocument();
  });

  it("com várias cervejas, cada placa fica centralizada na coluna da própria garrafa", () => {
    const { container } = render(
      <FaixaDaPrateleira
        categoriaNome="IPA"
        rotulos={[
          { cervejaId: "a", nome: "Maré", quantidade: 1, totalCentavos: 3200, coluna: 0 },
          { cervejaId: "b", nome: "Jaraguá", quantidade: 1, totalCentavos: 3200, coluna: 1 },
        ]}
      />,
    );

    container
      .querySelectorAll("[data-placa]")
      .forEach((placa) => expect(placa.className).toMatch(/justify-self-center/));
  });
});
