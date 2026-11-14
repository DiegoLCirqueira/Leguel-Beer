// Seed de desenvolvimento: catálogo (LB-4), configurações de entrega e conta admin.
import { PrismaService } from "../src/common/prisma/prisma.service.js";
import { seedCatalog } from "../src/modules/catalog/infrastructure/seed-catalog.js";
import { seedDeliverySettings } from "../src/modules/delivery/infrastructure/seed-delivery-settings.js";
import { seedAdmin } from "../src/modules/account/infrastructure/seed-admin.js";

const prisma = new PrismaService();
try {
  await seedCatalog(prisma);
  console.log("Catálogo garantido (4 categorias e 16 cervejas).");
  await seedDeliverySettings(prisma);
  console.log("Configurações de entrega garantidas (origem fictícia em Jaraguá).");
} finally {
  await prisma.onModuleDestroy();
}

const result = await seedAdmin(process.env);
console.log(
  `Admin garantido (${result.created ? "conta criada" : "conta já existia"}), id ${result.userId}.`,
);
