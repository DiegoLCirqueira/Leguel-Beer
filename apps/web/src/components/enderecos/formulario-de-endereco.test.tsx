import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FormularioDeEndereco } from "./formulario-de-endereco";

const buscarCep = vi.fn();
const salvar = vi.fn();
const aoSalvar = vi.fn();
const aoCancelar = vi.fn();

const abrir = (inicial?: Parameters<typeof FormularioDeEndereco>[0]["inicial"]) =>
  render(
    <FormularioDeEndereco
      buscarCep={buscarCep}
      salvar={salvar}
      aoSalvar={aoSalvar}
      aoCancelar={aoCancelar}
      inicial={inicial}
    />,
  );

const achado = {
  tipo: "ok",
  rua: "Avenida Fernandes Lima",
  bairro: "Farol",
  cidade: "Maceió",
  uf: "AL",
} as const;

describe("FormularioDeEndereco", () => {
  beforeEach(() => {
    for (const f of [buscarCep, salvar, aoSalvar, aoCancelar]) f.mockReset();
    buscarCep.mockResolvedValue(achado);
    salvar.mockResolvedValue({ tipo: "ok" });
  });

  it("tem os campos do endereço, com a UF fixa em AL", () => {
    abrir();

    for (const rotulo of ["Apelido", "CEP", "Rua", "Número", "Complemento", "Bairro", "Cidade"]) {
      expect(screen.getByLabelText(rotulo)).toBeInTheDocument();
    }
    expect(screen.getByLabelText("UF")).toHaveValue("AL");
    expect(screen.getByLabelText("UF")).toHaveAttribute("readonly");
  });

  it("aplica a máscara 00000-000 ao CEP", async () => {
    abrir();

    await userEvent.type(screen.getByLabelText("CEP"), "57035");
    expect(screen.getByLabelText("CEP")).toHaveValue("57035");
    await userEvent.type(screen.getByLabelText("CEP"), "0");
    expect(screen.getByLabelText("CEP")).toHaveValue("57035-0");
  });

  it("ao completar os 8 dígitos, busca o CEP, preenche rua, bairro e cidade e leva o cursor ao número", async () => {
    abrir();

    await userEvent.type(screen.getByLabelText("CEP"), "57035000");

    expect(buscarCep).toHaveBeenCalledWith("57035-000");
    await waitFor(() => expect(screen.getByLabelText("Rua")).toHaveValue("Avenida Fernandes Lima"));
    expect(screen.getByLabelText("Bairro")).toHaveValue("Farol");
    expect(screen.getByLabelText("Cidade")).toHaveValue("Maceió");
    expect(screen.getByLabelText("Número")).toHaveFocus();
  });

  it("CEP inexistente mostra 'CEP não encontrado.' e deixa preencher à mão", async () => {
    buscarCep.mockResolvedValue({ tipo: "nao-encontrado" });
    abrir();

    await userEvent.type(screen.getByLabelText("CEP"), "57999999");

    expect(await screen.findByText("CEP não encontrado.")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Rua"), "Rua A");
    expect(screen.getByLabelText("Rua")).toHaveValue("Rua A");
  });

  it("serviço de CEP fora do ar mostra 'Não foi possível buscar o CEP agora.'", async () => {
    buscarCep.mockResolvedValue({ tipo: "indisponivel" });
    abrir();

    await userEvent.type(screen.getByLabelText("CEP"), "57035000");

    expect(await screen.findByText("Não foi possível buscar o CEP agora.")).toBeInTheDocument();
  });

  it("CEP de fora de Alagoas avisa e não deixa salvar", async () => {
    buscarCep.mockResolvedValue({ tipo: "fora-de-alagoas" });
    abrir();

    await userEvent.type(screen.getByLabelText("CEP"), "01432000");
    expect(await screen.findByText("Por enquanto só entregamos em Alagoas.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Salvar endereço" }));
    expect(salvar).not.toHaveBeenCalled();
  });

  it("enviar vazio mostra a mensagem de cada campo obrigatório e não salva", async () => {
    abrir();

    await userEvent.click(screen.getByRole("button", { name: "Salvar endereço" }));

    for (const mensagem of [
      "Informe o CEP.",
      "Informe a rua.",
      "Informe o número.",
      "Informe o bairro.",
      "Informe a cidade.",
    ]) {
      expect(screen.getByText(mensagem)).toBeInTheDocument();
    }
    expect(salvar).not.toHaveBeenCalled();
  });

  it("salva com os dados preenchidos e avisa a tela", async () => {
    abrir();
    await userEvent.type(screen.getByLabelText("Apelido"), "Casa");
    await userEvent.type(screen.getByLabelText("CEP"), "57035000");
    await userEvent.type(screen.getByLabelText("Número"), "100");

    await userEvent.click(screen.getByRole("button", { name: "Salvar endereço" }));

    await waitFor(() => expect(aoSalvar).toHaveBeenCalled());
    expect(salvar).toHaveBeenCalledWith({
      apelido: "Casa",
      cep: "57035-000",
      rua: "Avenida Fernandes Lima",
      numero: "100",
      complemento: "",
      bairro: "Farol",
      cidade: "Maceió",
      uf: "AL",
    });
  });

  it("erro ao salvar mostra a mensagem e mantém o que foi digitado", async () => {
    salvar.mockResolvedValue({
      tipo: "erro",
      mensagem: "Não encontramos este endereço. Confira a rua, o número e o CEP.",
    });
    abrir();
    await userEvent.type(screen.getByLabelText("CEP"), "57035000");
    await userEvent.type(screen.getByLabelText("Número"), "100");

    await userEvent.click(screen.getByRole("button", { name: "Salvar endereço" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não encontramos este endereço.");
    expect(screen.getByLabelText("Número")).toHaveValue("100");
    expect(aoSalvar).not.toHaveBeenCalled();
  });

  it("na edição vem preenchido e 'Cancelar' fecha sem salvar", async () => {
    abrir({
      id: "e1",
      apelido: "Casa",
      cep: "57035000",
      rua: "Rua A",
      numero: "5",
      bairro: "Farol",
      cidade: "Maceió",
      uf: "AL",
      padrao: true,
      foraDaArea: false,
    });

    expect(screen.getByLabelText("CEP")).toHaveValue("57035-000");
    expect(screen.getByLabelText("Rua")).toHaveValue("Rua A");
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(aoCancelar).toHaveBeenCalled();
    expect(salvar).not.toHaveBeenCalled();
  });

  it("a busca do CEP não sobrescreve o que o cliente já digitou", async () => {
    abrir();
    await userEvent.type(screen.getByLabelText("Rua"), "Rua que eu digitei");

    await userEvent.type(screen.getByLabelText("CEP"), "57035000");

    await waitFor(() => expect(screen.getByLabelText("Bairro")).toHaveValue("Farol"));
    expect(screen.getByLabelText("Rua")).toHaveValue("Rua que eu digitei");
    expect(screen.getByLabelText("Cidade")).toHaveValue("Maceió");
  });

  it("o botão 'Buscar CEP' busca o CEP completo e avisa quando falta dígito", async () => {
    abrir();
    await userEvent.type(screen.getByLabelText("CEP"), "5703");

    await userEvent.click(screen.getByRole("button", { name: "Buscar CEP" }));
    expect(screen.getByText("Informe o CEP com 8 dígitos.")).toBeInTheDocument();
    expect(buscarCep).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText("CEP"), "5000");
    buscarCep.mockClear();
    await userEvent.click(screen.getByRole("button", { name: "Buscar CEP" }));

    expect(buscarCep).toHaveBeenCalledWith("57035-000");
  });
});
