// Seed de desenvolvimento. O catálogo entra com o schema do catálogo (LB-4).
import { seedAdmin } from "../src/modules/account/infrastructure/seed-admin.js";

const result = await seedAdmin(process.env);
console.log(
  `Admin garantido (${result.created ? "conta criada" : "conta já existia"}), id ${result.userId}.`,
);
