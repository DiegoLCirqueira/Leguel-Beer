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
import { DeliveryModule } from "../delivery.module.js";
import { seedDeliverySettings } from "../infrastructure/seed-delivery-settings.js";

describe("endereços sem serviço de mapas configurado (banco real)", () => {
  const tokens = createTestTokens();
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const verifier = new JwksTokenVerifier("http://jwks.test", tokens.issuer, (() =>
      Promise.resolve(new Response(JSON.stringify(tokens.jwks)))) as typeof fetch);
    const moduleRef = await Test.createTestingModule({
      imports: [CommonModule, PrismaModule, AccountModule, DeliveryModule],
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
    await prisma.profile.create({ data: { id: tokens.customerId, email: "cliente@leguele.test" } });
    await seedDeliverySettings(prisma);
  });

  afterAll(() => app.close());

  it("o padrão da API é 503 MAPS_UNAVAILABLE e nada é gravado: nunca inventa coordenadas", async () => {
    const response = await request(app.getHttpServer())
      .post("/me/enderecos")
      .set({ Authorization: `Bearer ${tokens.customer()}` })
      .send({
        cep: "57035-000",
        rua: "Rua do Sol",
        numero: "100",
        bairro: "Farol",
        cidade: "Maceió",
        uf: "AL",
      });

    expect(response.status).toBe(503);
    expect(response.body.code).toBe("MAPS_UNAVAILABLE");
    expect(await prisma.address.count()).toBe(0);
  });
});
