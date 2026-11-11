import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { RevalidateFridge } from "./application/revalidate-fridge.js";
import type { FridgeBeerLookup } from "./domain/fridge-beer-lookup.js";
import { FRIDGE_BEER_LOOKUP } from "./fridge.tokens.js";
import { PrismaFridgeBeerLookup } from "./infrastructure/prisma-fridge-beer-lookup.js";
import { FridgeController } from "./presentation/fridge.controller.js";

@Module({
  controllers: [FridgeController],
  providers: [
    {
      provide: FRIDGE_BEER_LOOKUP,
      useFactory: (prisma: PrismaService) => new PrismaFridgeBeerLookup(prisma),
      inject: [PrismaService],
    },
    {
      provide: RevalidateFridge,
      useFactory: (lookup: FridgeBeerLookup) => new RevalidateFridge(lookup),
      inject: [FRIDGE_BEER_LOOKUP],
    },
  ],
})
export class FridgeModule {}
