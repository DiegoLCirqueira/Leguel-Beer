import { Module } from "@nestjs/common";
import { CatalogModule } from "../catalog/catalog.module.js";
import { BEER_REPOSITORY } from "../catalog/catalog.tokens.js";
import type { BeerRepository } from "../catalog/domain/beer-repository.js";
import { RevalidateFridge } from "./application/revalidate-fridge.js";
import type { FridgeBeerLookup } from "./domain/fridge-beer-lookup.js";
import { FRIDGE_BEER_LOOKUP } from "./fridge.tokens.js";
import { CatalogFridgeBeerLookup } from "./infrastructure/catalog-fridge-beer-lookup.js";
import { FridgeController } from "./presentation/fridge.controller.js";

@Module({
  imports: [CatalogModule],
  controllers: [FridgeController],
  providers: [
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
