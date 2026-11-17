import { pedidoCriadoSchema, type CriarPedidoRequest } from "@leguele/shared";
import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import {
  BirthDateRequiredError,
  EmptyFridgeError,
  IdempotencyKeyReusedError,
  OutOfDeliveryAreaError,
  OutOfStockError,
  PendingOrderError,
  TotalChangedError,
  UnderageError,
} from "../domain/order-errors.js";
import {
  ANA,
  FakeCustomers,
  FakeFridge,
  FakeOrderCreation,
  FakeShipping,
  SHIP_TO,
} from "../testing/create-order-fakes.js";
import { CreateOrder } from "./create-order.js";

const AGORA = new Date("2026-11-16T15:00:00.000Z");
const CHAVE = "chave-de-idempotencia-0001";
const OUTRA_CHAVE = "outra-chave-de-idempotencia";

const PEDIDO: CriarPedidoRequest = {
  enderecoId: "casa",
  pagamento: { tipo: "pix" },
  // 2 x R$ 45,00 + R$ 13,00 de frete
  totalVistoCentavos: 10_300,
};

const CARTAO = { tipo: "cartao", parcelas: 2, bandeira: "visa" } as const;

function setup(now: () => Date = () => AGORA) {
  const customers = new FakeCustomers();
  const shipping = new FakeShipping(customers.customers);
  const fridge = new FakeFridge();
  const creation = new FakeOrderCreation();
  let sequence = 0;
  const useCase = new CreateOrder({
    customers,
    shipping,
    fridge,
    creation,
    now,
    newId: () => `pedido-${++sequence}`,
    newNumber: () => "#LB123456",
  });
  const run = (request: CriarPedidoRequest = PEDIDO, key = CHAVE, ownerId = ANA) =>
    useCase.execute({ ownerId, key, request });
  return { customers, shipping, fridge, creation, run };
}

const perfil = (dataNascimento: string | null) => ({
  nome: "Ana Souza",
  telefone: "82912345678",
  dataNascimento,
});

describe("CreateOrder", () => {
  it("cria o pedido aguardando pagamento com itens, totais e validade de 30 minutos", async () => {
    const { run, creation } = setup();

    const { body, replayed } = await run();

    expect(replayed).toBe(false);
    expect(pedidoCriadoSchema.parse(body)).toMatchObject({
      id: "pedido-1",
      numero: "#LB123456",
      status: "aguardando-pagamento",
      criadoEm: "2026-11-16T15:00:00.000Z",
      validoAte: "2026-11-16T15:30:00.000Z",
      pagamento: { tipo: "pix" },
      itens: [{ cervejaId: "mare-alta", nome: "Maré Alta", precoCentavos: 4_500, quantidade: 2 }],
      subtotalCentavos: 9_000,
      freteCentavos: 1_300,
      totalCentavos: 10_300,
    });
    expect(creation.orders).toHaveLength(1);
  });

  it("guarda a cópia do nome, do telefone e do endereço do momento da compra", async () => {
    const { run, creation } = setup();

    await run();

    expect(creation.orders[0]).toMatchObject({
      ownerId: ANA,
      customer: { nome: "Ana Souza", telefone: "82912345678" },
      shipTo: SHIP_TO,
    });
  });

  it("no cartão guarda parcelas e bandeira, nunca o token", async () => {
    const { run, creation } = setup();

    const { body } = await run({ ...PEDIDO, pagamento: { ...CARTAO, token: "tok_secreto" } });

    expect(body.pagamento).toEqual(CARTAO);
    expect(JSON.stringify([body, creation.orders, creation.keys])).not.toContain("tok_secreto");
  });

  describe("maioridade", () => {
    it("recusa menor de 18 anos e não cria nada", async () => {
      const { run, customers, creation } = setup();
      customers.customers.set(ANA, perfil("2010-05-01"));

      await expect(run()).rejects.toBeInstanceOf(UnderageError);
      expect(creation.orders).toHaveLength(0);
    });

    it("quem faz 18 anos hoje (dia de Maceió) pode comprar", async () => {
      const { run, customers } = setup();
      customers.customers.set(ANA, perfil("2008-11-16"));

      await expect(run()).resolves.toMatchObject({ replayed: false });
    });

    it("sem data de nascimento pede a data", async () => {
      const { run, customers } = setup();
      customers.customers.set(ANA, perfil(null));

      await expect(run()).rejects.toBeInstanceOf(BirthDateRequiredError);
    });

    it("conta sem perfil completo não é encontrada", async () => {
      const { run, customers } = setup();
      customers.customers.delete(ANA);

      await expect(run()).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("idempotência", () => {
    it("a mesma chave com o mesmo corpo repete a resposta sem criar outro pedido", async () => {
      const { run, creation, fridge } = setup();
      const first = await run();
      const callsBefore = fridge.calls;

      const second = await run();

      expect(second).toEqual({ replayed: true, status: 201, body: first.body });
      expect(creation.orders).toHaveLength(1);
      expect(fridge.calls).toBe(callsBefore);
    });

    it("a mesma chave com outro corpo recusa com IDEMPOTENCY_KEY_REUSED", async () => {
      const { run } = setup();
      await run();

      await expect(run({ ...PEDIDO, pagamento: { ...CARTAO, token: "t" } })).rejects.toBeInstanceOf(
        IdempotencyKeyReusedError,
      );
    });

    it("o token do cartão não entra no hash: outro token com a mesma chave repete a resposta", async () => {
      const { run } = setup();
      await run({ ...PEDIDO, pagamento: { ...CARTAO, token: "tok_a" } });

      await expect(
        run({ ...PEDIDO, pagamento: { ...CARTAO, token: "tok_b" } }),
      ).resolves.toMatchObject({ replayed: true });
    });

    it("a chave de uma conta não vale para outra: a outra conta cria o próprio pedido", async () => {
      const { run, customers, creation } = setup();
      customers.customers.set("outra-conta", perfil("1990-01-01"));
      await run();

      await expect(run(PEDIDO, CHAVE, "outra-conta")).resolves.toMatchObject({ replayed: false });
      expect(creation.orders.map((order) => order.ownerId)).toEqual([ANA, "outra-conta"]);
    });

    it("chave com 24 horas ou mais já não vale", async () => {
      let agora = AGORA;
      const { run, creation } = setup(() => agora);
      await run();
      creation.orders = [];
      agora = new Date(AGORA.getTime() + 24 * 60 * 60_000);

      await expect(run()).resolves.toMatchObject({ replayed: false });
    });

    it("erro não guarda a chave: a nova tentativa com a mesma chave cria o pedido", async () => {
      const { run, creation } = setup();
      await expect(run({ ...PEDIDO, totalVistoCentavos: 1 })).rejects.toBeInstanceOf(
        TotalChangedError,
      );
      expect(creation.keys).toHaveLength(0);

      await expect(run()).resolves.toMatchObject({ replayed: false });
    });
  });

  describe("pedido pendente", () => {
    it("recusa com PENDING_ORDER e o id do pedido dentro da validade", async () => {
      const { run } = setup();
      await run();

      const error = await run(PEDIDO, OUTRA_CHAVE).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(PendingOrderError);
      expect((error as PendingOrderError).orderId).toBe("pedido-1");
    });

    it("pedido vencido (30:00 em ponto) não bloqueia um novo", async () => {
      let agora = AGORA;
      const { run } = setup(() => agora);
      await run();
      agora = new Date("2026-11-16T15:30:00.000Z");

      await expect(run(PEDIDO, OUTRA_CHAVE)).resolves.toMatchObject({ replayed: false });
    });

    it("um segundo antes de vencer ainda bloqueia", async () => {
      let agora = AGORA;
      const { run } = setup(() => agora);
      await run();
      agora = new Date("2026-11-16T15:29:59.000Z");

      await expect(run(PEDIDO, OUTRA_CHAVE)).rejects.toBeInstanceOf(PendingOrderError);
    });
  });

  describe("endereço e área", () => {
    it("endereço de outro cliente ou inexistente não é encontrado", async () => {
      const { run, creation } = setup();

      await expect(run({ ...PEDIDO, enderecoId: "de-outro" })).rejects.toBeInstanceOf(
        NotFoundError,
      );
      expect(creation.orders).toHaveLength(0);
    });

    it("endereço fora da área recusa com OUT_OF_DELIVERY_AREA", async () => {
      const { run, creation } = setup();

      await expect(run({ ...PEDIDO, enderecoId: "longe" })).rejects.toBeInstanceOf(
        OutOfDeliveryAreaError,
      );
      expect(creation.orders).toHaveLength(0);
    });
  });

  describe("Geladeira e total", () => {
    it("Geladeira vazia recusa com EMPTY_FRIDGE", async () => {
      const { run, fridge } = setup();
      fridge.lines = [];

      await expect(run()).rejects.toBeInstanceOf(EmptyFridgeError);
    });

    it("total diferente do visto recusa com o total atual e os ajustes, sem criar nada", async () => {
      const { run, fridge, creation } = setup();
      fridge.lines = [{ beerId: "mare-alta", name: "Maré Alta", priceCents: 5_000, quantity: 2 }];
      fridge.adjustments = [
        {
          tipo: "preco-mudou",
          cervejaId: "mare-alta",
          nome: "Maré Alta",
          precoVistoCentavos: 4_500,
          precoAtualCentavos: 5_000,
        },
      ];

      const error = await run().catch((e: unknown) => e);

      expect(error).toBeInstanceOf(TotalChangedError);
      expect(error).toMatchObject({ currentTotalCents: 11_300, adjustments: fridge.adjustments });
      expect(creation.orders).toHaveLength(0);
      expect(creation.keys).toHaveLength(0);
    });

    it("subtotal de R$ 150,00 zera o frete e o total visto é conferido com ele", async () => {
      const { run, fridge } = setup();
      fridge.lines = [{ beerId: "mare-alta", name: "Maré Alta", priceCents: 7_500, quantity: 2 }];

      const { body } = await run({ ...PEDIDO, totalVistoCentavos: 15_000 });

      expect(body).toMatchObject({
        subtotalCentavos: 15_000,
        freteCentavos: 0,
        totalCentavos: 15_000,
      });
    });
  });

  describe("estoque", () => {
    it("falta de estoque recusa com as cervejas que faltam, sem criar nada", async () => {
      const { run, creation } = setup();
      creation.available.set("mare-alta", 1);

      const error = await run().catch((e: unknown) => e);

      expect(error).toBeInstanceOf(OutOfStockError);
      expect((error as OutOfStockError).beers).toEqual([
        { beerId: "mare-alta", name: "Maré Alta" },
      ]);
      expect(creation.orders).toHaveLength(0);
    });

    it("cerveja que não existe mais no estoque também falta", async () => {
      const { run, creation } = setup();
      creation.available.delete("mare-alta");

      await expect(run()).rejects.toBeInstanceOf(OutOfStockError);
    });

    it("trava as cervejas em ordem fixa pelo id, qualquer que seja a ordem da Geladeira", async () => {
      const { run, fridge, creation } = setup();
      fridge.lines = [
        { beerId: "zeta", name: "Zeta", priceCents: 1_000, quantity: 1 },
        { beerId: "alfa", name: "Alfa", priceCents: 1_000, quantity: 1 },
      ];
      creation.available = new Map([
        ["zeta", 5],
        ["alfa", 5],
      ]);

      await run({ ...PEDIDO, totalVistoCentavos: 3_300 });

      expect(creation.lockedWith).toEqual([["alfa", "zeta"]]);
    });
  });
});
