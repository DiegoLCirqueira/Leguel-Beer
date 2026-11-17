import { randomUUID } from "node:crypto";
import type { CriarPedidoRequest } from "@leguele/shared";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { CreateOrder } from "../application/create-order.js";
import {
  OutOfStockError,
  PendingOrderError,
  type IdempotencyKeyReusedError,
} from "../domain/order-errors.js";
import { FakeCustomers, FakeFridge, FakeShipping } from "../testing/create-order-fakes.js";
import { PrismaOrderCreation } from "./prisma-order-creation.js";

const AGORA = new Date("2026-11-16T15:00:00.000Z");

describe("PrismaOrderCreation (banco real)", () => {
  const prisma = new PrismaService();
  let categoryId: string;

  beforeEach(async () => {
    await resetDatabase(prisma);
    categoryId = (await prisma.category.create({ data: { slug: "ipa", name: "IPAs", order: 1 } }))
      .id;
  });
  afterAll(() => prisma.onModuleDestroy());

  const addBeer = (name: string, stock: number, priceCents = 4_500) =>
    prisma.beer.create({
      data: {
        slug: name.toLowerCase().replace(/\s/g, "-"),
        name,
        style: "American IPA",
        categoryId,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents,
        stock,
      },
    });

  async function addCustomer(): Promise<string> {
    const id = randomUUID();
    await prisma.profile.create({
      data: {
        id,
        email: `${id}@leguele.test`,
        nome: "Ana Souza",
        telefone: "82912345678",
        termsVersion: "2026-10-30",
        privacyVersion: "2026-10-30",
        termsAcceptedAt: new Date("2026-10-30T12:00:00.000Z"),
      },
    });
    return id;
  }

  /** O caso de uso com a criação real e os demais colaboradores fakes. */
  function build(
    customerIds: string[],
    lines: { beerId: string; name: string; priceCents: number; quantity: number }[],
  ) {
    const customers = new FakeCustomers();
    customers.customers.clear();
    for (const id of customerIds) {
      customers.customers.set(id, {
        nome: "Ana Souza",
        telefone: "82912345678",
        dataNascimento: "1990-01-01",
      });
    }
    const fridge = new FakeFridge();
    fridge.lines = lines;
    let numbers = 100_000;
    return new CreateOrder({
      customers,
      shipping: new FakeShipping(customers.customers),
      fridge,
      creation: new PrismaOrderCreation(prisma),
      now: () => AGORA,
      newId: randomUUID,
      newNumber: () => `#LB${numbers++}`,
    });
  }

  const request = (totalVistoCentavos: number): CriarPedidoRequest => ({
    enderecoId: "casa",
    pagamento: { tipo: "pix" },
    totalVistoCentavos,
  });

  const key = (suffix: string) => `chave-de-idempotencia-${suffix}`;

  it("grava o pedido, os itens, as cópias, as reservas, as baixas pendentes, o histórico e a chave", async () => {
    const beer = await addBeer("Mare Alta", 10);
    const owner = await addCustomer();
    const useCase = build(
      [owner],
      [{ beerId: beer.id, name: "Mare Alta", priceCents: 4_500, quantity: 2 }],
    );

    const { body } = await useCase.execute({
      ownerId: owner,
      key: key("0001"),
      request: {
        ...request(10_300),
        pagamento: { tipo: "cartao", parcelas: 3 },
      },
    });

    const order = await prisma.order.findUniqueOrThrow({
      where: { id: body.id },
      include: {
        items: true,
        reservations: true,
        pendingDeductions: true,
        statusHistory: true,
        idempotencyKey: true,
      },
    });
    expect(order).toMatchObject({
      number: body.numero,
      profileId: owner,
      status: "AWAITING_PAYMENT",
      paymentMethod: "CARD",
      installments: 3,
      subtotalCents: 9_000,
      shippingCents: 1_300,
      totalCents: 10_300,
      expiresAt: new Date("2026-11-16T15:30:00.000Z"),
      customerName: "Ana Souza",
      customerPhone: "82912345678",
      shipZip: "57035000",
      shipStreet: "Rua do Sol",
      shipCity: "Maceió",
    });
    expect(order.items).toMatchObject([
      { beerId: beer.id, name: "Mare Alta", unitPriceCents: 4_500, quantity: 2 },
    ]);
    expect(order.reservations).toMatchObject([
      { beerId: beer.id, quantity: 2, expiresAt: new Date("2026-11-16T15:30:00.000Z") },
    ]);
    expect(order.pendingDeductions).toMatchObject([{ beerId: beer.id, quantity: 2 }]);
    expect(order.statusHistory).toMatchObject([{ fromStatus: null, toStatus: "AWAITING_PAYMENT" }]);
    expect(order.idempotencyKey).toMatchObject({
      profileId: owner,
      key: key("0001"),
      responseStatus: 201,
      expiresAt: new Date("2026-11-17T15:00:00.000Z"),
      responseBody: body,
    });
  });

  it("repete a resposta guardada para a mesma chave, sem segundo pedido nem segunda reserva", async () => {
    const beer = await addBeer("Mare Alta", 10);
    const owner = await addCustomer();
    const useCase = build(
      [owner],
      [{ beerId: beer.id, name: "Mare Alta", priceCents: 4_500, quantity: 2 }],
    );
    const first = await useCase.execute({
      ownerId: owner,
      key: key("0001"),
      request: request(10_300),
    });

    const second = await useCase.execute({
      ownerId: owner,
      key: key("0001"),
      request: request(10_300),
    });

    expect(second).toEqual({ ...first, replayed: true });
    expect(await prisma.order.count()).toBe(1);
    expect(await prisma.stockReservation.count()).toBe(1);
  });

  it("a mesma chave com outro corpo recusa e não cria nada", async () => {
    const beer = await addBeer("Mare Alta", 10);
    const owner = await addCustomer();
    const useCase = build(
      [owner],
      [{ beerId: beer.id, name: "Mare Alta", priceCents: 4_500, quantity: 2 }],
    );
    await useCase.execute({ ownerId: owner, key: key("0001"), request: request(10_300) });

    const error = await useCase
      .execute({
        ownerId: owner,
        key: key("0001"),
        request: {
          ...request(10_300),
          pagamento: { tipo: "cartao", parcelas: 1 },
        },
      })
      .catch((e: unknown) => e as IdempotencyKeyReusedError);

    expect(error).toMatchObject({ name: "IdempotencyKeyReusedError" });
    expect(await prisma.order.count()).toBe(1);
  });

  it("a chave de um cliente não vale para outro", async () => {
    const beer = await addBeer("Mare Alta", 10);
    const [ana, bia] = [await addCustomer(), await addCustomer()] as [string, string];
    const useCase = build(
      [ana, bia],
      [{ beerId: beer.id, name: "Mare Alta", priceCents: 4_500, quantity: 2 }],
    );

    await useCase.execute({ ownerId: ana, key: key("0001"), request: request(10_300) });
    const other = await useCase.execute({
      ownerId: bia,
      key: key("0001"),
      request: request(10_300),
    });

    expect(other.replayed).toBe(false);
    expect(await prisma.order.count()).toBe(2);
  });

  it("erro não guarda a chave nem deixa pedido parcial", async () => {
    const beer = await addBeer("Mare Alta", 1);
    const owner = await addCustomer();
    const useCase = build(
      [owner],
      [{ beerId: beer.id, name: "Mare Alta", priceCents: 4_500, quantity: 2 }],
    );

    await expect(
      useCase.execute({ ownerId: owner, key: key("0001"), request: request(10_300) }),
    ).rejects.toBeInstanceOf(OutOfStockError);

    expect(await prisma.order.count()).toBe(0);
    expect(await prisma.idempotencyKey.count()).toBe(0);
    expect(await prisma.stockReservation.count()).toBe(0);
  });

  it("reserva vencida, liberada ou consumida não conta no disponível", async () => {
    const beer = await addBeer("Mare Alta", 2);
    const owner = await addCustomer();
    const other = await addCustomer();
    const stale = await prisma.order.create({
      data: {
        number: "#LB000001",
        profileId: other,
        status: "AWAITING_PAYMENT",
        paymentMethod: "PIX",
        subtotalCents: 1,
        shippingCents: 0,
        totalCents: 1,
        expiresAt: new Date("2026-11-16T14:59:59.000Z"),
        customerName: "x",
        customerPhone: "x",
        shipZip: "x",
        shipStreet: "x",
        shipNumber: "x",
        shipDistrict: "x",
        shipCity: "x",
        shipState: "AL",
      },
    });
    await prisma.stockReservation.create({
      data: {
        orderId: stale.id,
        beerId: beer.id,
        quantity: 2,
        expiresAt: new Date("2026-11-16T14:59:59.000Z"),
      },
    });
    const useCase = build(
      [owner],
      [{ beerId: beer.id, name: "Mare Alta", priceCents: 4_500, quantity: 2 }],
    );

    await expect(
      useCase.execute({ ownerId: owner, key: key("0001"), request: request(10_300) }),
    ).resolves.toMatchObject({ replayed: false });
  });

  describe("concorrência", () => {
    it("N pedidos simultâneos de clientes diferentes para M unidades criam no máximo M pedidos", async () => {
      const beer = await addBeer("Mare Alta", 2);
      const owners = await Promise.all([1, 2, 3, 4, 5].map(() => addCustomer()));
      const useCase = build(owners, [
        { beerId: beer.id, name: "Mare Alta", priceCents: 4_500, quantity: 1 },
      ]);

      const results = await Promise.allSettled(
        owners.map((ownerId) =>
          useCase.execute({ ownerId, key: key("0001"), request: request(5_800) }),
        ),
      );

      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(2);
      for (const result of results.filter((r) => r.status === "rejected")) {
        expect((result as PromiseRejectedResult).reason).toBeInstanceOf(OutOfStockError);
      }
      expect(await prisma.order.count()).toBe(2);
      expect(await prisma.stockReservation.aggregate({ _sum: { quantity: true } })).toMatchObject({
        _sum: { quantity: 2 },
      });
    });

    it("duas requisições simultâneas com a mesma chave criam um pedido e a outra repete a resposta", async () => {
      const beer = await addBeer("Mare Alta", 10);
      const owner = await addCustomer();
      const useCase = build(
        [owner],
        [{ beerId: beer.id, name: "Mare Alta", priceCents: 4_500, quantity: 2 }],
      );

      const [a, b] = await Promise.all([
        useCase.execute({ ownerId: owner, key: key("0001"), request: request(10_300) }),
        useCase.execute({ ownerId: owner, key: key("0001"), request: request(10_300) }),
      ]);

      expect([a.replayed, b.replayed].sort()).toEqual([false, true]);
      expect(a.body).toEqual(b.body);
      expect(await prisma.order.count()).toBe(1);
      expect(await prisma.stockReservation.count()).toBe(1);
    });

    it("duas criações simultâneas do mesmo cliente com chaves diferentes criam um só pedido; a outra recebe PENDING_ORDER", async () => {
      const beer = await addBeer("Mare Alta", 10);
      const owner = await addCustomer();
      const useCase = build(
        [owner],
        [{ beerId: beer.id, name: "Mare Alta", priceCents: 4_500, quantity: 2 }],
      );

      const results = await Promise.allSettled([
        useCase.execute({ ownerId: owner, key: key("0001"), request: request(10_300) }),
        useCase.execute({ ownerId: owner, key: key("0002"), request: request(10_300) }),
      ]);

      const created = results.filter((r) => r.status === "fulfilled");
      const refused = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
      expect(created).toHaveLength(1);
      expect(refused).toHaveLength(1);
      expect(refused[0]?.reason).toBeInstanceOf(PendingOrderError);
      const order = await prisma.order.findFirstOrThrow();
      expect((refused[0]?.reason as PendingOrderError).orderId).toBe(order.id);
      expect(await prisma.stockReservation.count()).toBe(1);
    });

    it("clientes diferentes com as mesmas duas cervejas em ordens inversas concluem os dois", async () => {
      const alfa = await addBeer("Alfa", 10, 1_000);
      const zeta = await addBeer("Zeta", 10, 1_000);
      const [ana, bia] = [await addCustomer(), await addCustomer()] as [string, string];
      const line = (beer: { id: string }, name: string) => ({
        beerId: beer.id,
        name,
        priceCents: 1_000,
        quantity: 1,
      });
      const first = build([ana], [line(alfa, "Alfa"), line(zeta, "Zeta")]);
      const second = build([bia], [line(zeta, "Zeta"), line(alfa, "Alfa")]);

      const results = await Promise.all([
        first.execute({ ownerId: ana, key: key("0001"), request: request(3_300) }),
        second.execute({ ownerId: bia, key: key("0001"), request: request(3_300) }),
      ]);

      expect(results.map((result) => result.replayed)).toEqual([false, false]);
      expect(await prisma.order.count({ where: { status: "AWAITING_PAYMENT" } })).toBe(2);
      expect(await prisma.stockReservation.count()).toBe(4);
    });
  });
});
