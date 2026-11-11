import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { CatalogModule } from "../catalog/catalog.module.js";
import { BEER_REPOSITORY } from "../catalog/catalog.tokens.js";
import type { BeerRepository } from "../catalog/domain/beer-repository.js";
import { GetAccountFridge } from "./application/get-account-fridge.js";
import { RevalidateFridge } from "./application/revalidate-fridge.js";
import { SaveAccountFridge } from "./application/save-account-fridge.js";
import type { AccountFridgeRepository } from "./domain/account-fridge-repository.js";
import type { FridgeBeerLookup } from "./domain/fridge-beer-lookup.js";
import { ACCOUNT_FRIDGE_REPOSITORY, FRIDGE_BEER_LOOKUP } from "./fridge.tokens.js";
import { CatalogFridgeBeerLookup } from "./infrastructure/catalog-fridge-beer-lookup.js";
import { PrismaAccountFridgeRepository } from "./infrastructure/prisma-account-fridge-repository.js";
import { AccountFridgeController } from "./presentation/account-fridge.controller.js";
import { FridgeController } from "./presentation/fridge.controller.js";

@Module({
  imports: [CatalogModule],
  controllers: [FridgeController, AccountFridgeController],
  providers: [
    {
      provide: ACCOUNT_FRIDGE_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaAccountFridgeRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: SaveAccountFridge,
      useFactory: (revalidate: RevalidateFridge, fridges: AccountFridgeRepository) =>
        new SaveAccountFridge(revalidate, fridges),
      inject: [RevalidateFridge, ACCOUNT_FRIDGE_REPOSITORY],
    },
    {
      provide: GetAccountFridge,
      useFactory: (revalidate: RevalidateFridge, fridges: AccountFridgeRepository) =>
        new GetAccountFridge(revalidate, fridges),
      inject: [RevalidateFridge, ACCOUNT_FRIDGE_REPOSITORY],
    },
    {
      provide: FRIDGE_BEER_LOOKUP,
      useFactory: (beers: BeerRepository) => new CatalogFridgeBeerLookup(beers),
      inject: [BEER_REPOSITORY],
    },
    {
      provide: RevalidateFridge,
      useFactory: (lookup: FridgeBeerLookup) => new RevalidateFridge(lookup),
      inject: [FRIDGE_BEER_LOOKUP],
    },
  ],
})
export class FridgeModule {}
