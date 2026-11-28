import { listaDePedidosSchema, pedidoDoClienteSchema } from "@leguele/shared";
import type { INestApplication } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CommonModule } from "../../../common/common.module.js";
import { AccountRateLimiter } from "../../../common/http/account-rate-limiter.js";
import { AllExceptionsFilter } from "../../../common/http/all-exceptions.filter.js";
import { PrismaModule } from "../../../common/prisma/prisma.module.js";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { createTestTokens } from "../../../common/testing/tokens.js";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe.js";
import { AccountModule } from "../../account/account.module.js";
import { TOKEN_VERIFIER } from "../../account/account.tokens.js";
import { JwksTokenVerifier } from "../../account/infrastructure/jwks-token-verifier.js";
import { DeliveryModule } from "../../delivery/delivery.module.js";
import { FridgeModule } from "../../fridge/fridge.module.js";
import { OrderModule } from "../order.module.js";

const T0 = new Date("2026-11-27T14:00:00.000Z");

describe("GET /me/pedidos e /me/pedidos/:id (HTTP, banco real)", () => {
  const tokens = createTestTokens();
  const outroId = crypto.randomUUID();
  const outroToken = tokens.custom({ sub: outroId, email: "outro@leguele.test" });
  let app: INestApplication;
  let prisma: PrismaService;
  let beerId: string;
  let seq = 0;

  beforeAll(async () => {
    const verifier = new JwksTokenVerifier("http://jwks.test", tokens.issuer, (() =>
      Promise.resolve(new Response(JSON.stringify(tokens.jwks)))) as typeof fetch);
    const moduleRef = await Test.createTestingModule({
      imports: [
        CommonModule,
        PrismaModule,
        AccountModule,
        FridgeModule,
        DeliveryModule,
        OrderModule,
      ],
      providers: [
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_PIPE, useClass: ZodValidationPipe },
      ],
    })
      .overrideProvider(TOKEN_VERIFIER)
      .useValue(verifier)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    app.get(AccountRateLimiter, { strict: false }).reset();
    seq = 0;
    for (const [id, email] of [
      [tokens.customerId, "cliente@leguele.test"],
      [outroId, "outro@leguele.test"],
    ] as const) {
      await prisma.profile.create({
        data: {
          id,
          email,
          nome: "Cliente",
          telefone: "82912345678",
          birthDate: new Date("1990-01-01T00:00:00.000Z"),
          termsVersion: "2026-10-30",
          privacyVersion: "2026-10-30",
          termsAcceptedAt: new Date("2026-10-30T12:00:00.000Z"),
        },
      });
    }
    const category = await prisma.category.create({
      data: { slug: "ipa", name: "IPAs", order: 1 },
    });
    beerId = (
      await prisma.beer.create({
        data: {
          slug: "mare-alta",
          name: "Maré Alta",
          style: "American IPA",
          categoryId: category.id,
          abv: 5,
          ibu: 30,
          volumeMl: 500,
          priceCents: 2000,
          stock: 50,
        },
      })
    ).id;
  });

  afterAll(() => app.close());

  /** Cria o pedido direto no banco, sem depender do checkout. */
  async function createOrder(
    profileId: string,
    createdAt: Date,
    status: "AWAITING_PAYMENT" | "PAID" | "CANCELLED" = "PAID",
  ) {
    seq += 1;
    return prisma.order.create({
      data: {
        number: `#LB${String(seq).padStart(6, "0")}`,
        profileId,
        status,
        paymentMethod: "PIX",
        subtotalCents: 4000,
        shippingCents: 1290,
        totalCents: 5290,
        expiresAt: new Date(createdAt.getTime() + 30 * 60_000),
        cancelReason: "segredo-interno-do-admin",
        customerName: "Nome Do Cliente",
        customerPhone: "82988887777",
        shipZip: "57035000",
        shipStreet: "Rua do Sol",
        shipNumber: "100",
        shipDistrict: "Farol",
        shipCity: "Maceió",
        shipState: "AL",
        createdAt,
        items: { create: [{ beerId, name: "Maré Alta", unitPriceCents: 2000, quantity: 2 }] },
        statusHistory: {
          create: [
            { toStatus: "AWAITING_PAYMENT", createdAt },
            ...(status === "AWAITING_PAYMENT"
              ? []
              : [
                  {
                    toStatus: status,
                    createdAt: new Date(createdAt.getTime() + 60_000),
                    reason: "segredo-interno-do-admin",
                  },
                ]),
          ],
        },
      },
    });
  }

  const get = (path: string, token: string | null = tokens.customer()) => {
    const req = request(app.getHttpServer()).get(path);
    return token ? req.set("Authorization", `Bearer ${token}`) : req;
  };

  it("sem token, a lista e a leitura de um pedido respondem 401", async () => {
    const order = await createOrder(tokens.customerId, T0);

    expect((await get("/me/pedidos", null)).status).toBe(401);
    expect((await get(`/me/pedidos/${order.id}`, null)).status).toBe(401);
  });

  it("a lista traz só os pedidos da conta, do mais recente ao mais antigo, no contrato", async () => {
    const old = await createOrder(tokens.customerId, T0);
    await createOrder(outroId, new Date(T0.getTime() + 30_000));
    const recent = await createOrder(tokens.customerId, new Date(T0.getTime() + 60_000));

    const response = await get("/me/pedidos");

    expect(response.status).toBe(200);
    const list = listaDePedidosSchema.parse(response.body);
    expect(list.pedidos.map((p) => p.id)).toEqual([recent.id, old.id]);
    expect(list.pedidos[0]).toMatchObject({ quantidadeDeItens: 2, cervejas: ["Maré Alta"] });
    expect(list.proximoCursor).toBeNull();
  });

  it("pagina com 21 pedidos: 20 na primeira página e 1 na segunda, sem repetir", async () => {
    for (let i = 0; i < 21; i += 1) {
      await createOrder(tokens.customerId, new Date(T0.getTime() + i * 1000));
    }

    const first = listaDePedidosSchema.parse((await get("/me/pedidos")).body);
    expect(first.pedidos).toHaveLength(20);
    expect(first.proximoCursor).not.toBeNull();

    const second = listaDePedidosSchema.parse(
      (await get(`/me/pedidos?cursor=${first.proximoCursor}`)).body,
    );
    expect(second.pedidos).toHaveLength(1);
    expect(second.proximoCursor).toBeNull();
    expect(new Set([...first.pedidos, ...second.pedidos].map((p) => p.id)).size).toBe(21);
  });

  it("cursor inventado ou limite acima de 20 respondem 400 VALIDATION_ERROR", async () => {
    expect((await get("/me/pedidos?cursor=lixo")).body).toMatchObject({ code: "VALIDATION_ERROR" });
    expect((await get("/me/pedidos?limite=21")).status).toBe(400);
  });

  it("um pedido aguardando pagamento com o Pix vencido volta como cancelado na lista e na leitura, sem rodar o cron", async () => {
    const stale = await createOrder(
      tokens.customerId,
      new Date(Date.now() - 2 * 3_600_000),
      "AWAITING_PAYMENT",
    );

    const list = listaDePedidosSchema.parse((await get("/me/pedidos")).body);
    expect(list.pedidos[0]?.status).toBe("cancelado");
    const detail = pedidoDoClienteSchema.parse((await get(`/me/pedidos/${stale.id}`)).body);
    expect(detail.status).toBe("cancelado");
    expect(detail.historico.map((h) => h.status)).toEqual(["aguardando-pagamento", "cancelado"]);
  });

  it("lê um pedido da conta no contrato, com endereço e histórico, sem o motivo do cancelamento", async () => {
    const order = await createOrder(tokens.customerId, T0, "CANCELLED");

    const response = await get(`/me/pedidos/${order.id}`);

    expect(response.status).toBe(200);
    const detail = pedidoDoClienteSchema.parse(response.body);
    expect(detail).toMatchObject({
      id: order.id,
      numero: order.number,
      enderecoDeEntrega: { rua: "Rua do Sol", uf: "AL" },
      historico: [
        { status: "aguardando-pagamento", em: "2026-11-27T14:00:00.000Z" },
        { status: "cancelado", em: "2026-11-27T14:01:00.000Z" },
      ],
    });
    expect(JSON.stringify(response.body)).not.toContain("segredo-interno-do-admin");
  });

  it.each(["PAID", "AWAITING_PAYMENT", "CANCELLED"] as const)(
    "o pedido %s de outro cliente e um id inexistente dão o mesmo 404, sem dado do pedido",
    async (status) => {
      const others = await createOrder(outroId, new Date(Date.now() - 60_000), status);

      const foreign = await get(`/me/pedidos/${others.id}`);
      const missing = await get(`/me/pedidos/${crypto.randomUUID()}`);

      expect(foreign.status).toBe(404);
      expect(missing.status).toBe(404);
      const clean = (body: object) => JSON.stringify(body).replace(/[0-9a-f-]{36}/g, "ID");
      expect(clean(foreign.body)).toBe(clean(missing.body));
      expect(JSON.stringify(foreign.body)).not.toContain(others.number);
      expect(JSON.stringify(foreign.body)).not.toContain("Rua do Sol");
    },
  );

  it("o pedido de outro cliente nunca expira pela leitura de quem não é o dono", async () => {
    const others = await createOrder(
      outroId,
      new Date(Date.now() - 2 * 3_600_000),
      "AWAITING_PAYMENT",
    );

    await get(`/me/pedidos/${others.id}`);
    await get("/me/pedidos");

    expect((await prisma.order.findUniqueOrThrow({ where: { id: others.id } })).status).toBe(
      "AWAITING_PAYMENT",
    );
  });

  it("id fora do formato responde 400 e não existe leitura pelo número do pedido", async () => {
    const order = await createOrder(tokens.customerId, T0);

    expect((await get("/me/pedidos/abc")).status).toBe(400);
    expect((await get(`/me/pedidos/${encodeURIComponent(order.number)}`)).status).toBe(400);
    expect((await get(`/me/pedidos/numero/${encodeURIComponent(order.number)}`)).status).toBe(404);
  });
});
