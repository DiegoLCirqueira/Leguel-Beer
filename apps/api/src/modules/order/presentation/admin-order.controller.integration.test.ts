import type { INestApplication } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CommonModule } from "../../../common/common.module.js";
import { AllExceptionsFilter } from "../../../common/http/all-exceptions.filter.js";
import { PrismaModule } from "../../../common/prisma/prisma.module.js";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { createTestTokens } from "../../../common/testing/tokens.js";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe.js";
import { AccountModule } from "../../account/account.module.js";
import { TOKEN_VERIFIER } from "../../account/account.tokens.js";
import { JwksTokenVerifier } from "../../account/infrastructure/jwks-token-verifier.js";
import { PrismaProfileRepository } from "../../account/infrastructure/prisma-profile-repository.js";
import { DeliveryModule } from "../../delivery/delivery.module.js";
import { FridgeModule } from "../../fridge/fridge.module.js";
import { OrderModule } from "../order.module.js";

describe("POST /admin/pedidos/:id/confirmar-pagamento (HTTP, banco real)", () => {
  const tokens = createTestTokens();
  let app: INestApplication;
  let prisma: PrismaService;
  let beerId: string;
  let orderId: string;

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

  async function createOrder(expiresAt: Date) {
    return (
      await prisma.order.create({
        data: {
          number: "#LB482731",
          profileId: tokens.customerId,
          paymentMethod: "PIX",
          subtotalCents: 6400,
          shippingCents: 0,
          totalCents: 6400,
          expiresAt,
          customerName: "Ana Souza",
          customerPhone: "82999990000",
          shipZip: "57035000",
          shipStreet: "Rua do Sol",
          shipNumber: "100",
          shipDistrict: "Farol",
          shipCity: "Maceió",
          shipState: "AL",
          reservations: { create: { beerId, quantity: 2, expiresAt } },
          pendingDeductions: { create: { beerId, quantity: 2 } },
        },
      })
    ).id;
  }

  beforeEach(async () => {
    await resetDatabase(prisma);
    await new PrismaProfileRepository(prisma).ensureRole(
      { id: tokens.adminId, email: "admin@leguele.test" },
      "admin",
    );
    await prisma.profile.create({
      data: { id: tokens.customerId, email: "cliente@leguele.test", nome: "Ana Souza" },
    });
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
          priceCents: 3200,
          stock: 10,
        },
      })
    ).id;
    orderId = await createOrder(new Date(Date.now() + 20 * 60_000));
  });

  afterAll(() => app.close());

  const confirm = (id: string, token: string | null = tokens.admin()) => {
    const req = request(app.getHttpServer()).post(`/admin/pedidos/${id}/confirmar-pagamento`);
    if (token) req.set("Authorization", `Bearer ${token}`);
    return req;
  };

  it("o admin confirma o pagamento: o pedido fica pago e o estoque físico baixa", async () => {
    const response = await confirm(orderId);

    expect(response.status).toBe(204);
    expect((await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe("PAID");
    expect((await prisma.beer.findUniqueOrThrow({ where: { id: beerId } })).stock).toBe(8);
    expect(await prisma.orderStatusHistory.findMany({ where: { orderId } })).toMatchObject([
      { toStatus: "PAID", actorId: tokens.adminId },
    ]);
  });
});
