import { Module } from "@nestjs/common";
import { AppLogger } from "../../common/logging/app-logger.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { GetBeer } from "./application/get-beer.js";
import { ListBeers } from "./application/list-beers.js";
import { ListFeaturedBeers } from "./application/list-featured-beers.js";
import { BEER_REPOSITORY } from "./catalog.tokens.js";
import type { BeerRepository } from "./domain/beer-repository.js";
import { PrismaBeerRepository } from "./infrastructure/prisma-beer-repository.js";
import { CatalogController } from "./presentation/catalog.controller.js";

@Module({
  controllers: [CatalogController],
  providers: [
    {
      provide: BEER_REPOSITORY,
      useFactory: (prisma: PrismaService, logger: AppLogger) =>
        new PrismaBeerRepository(prisma, logger),
      inject: [PrismaService, AppLogger],
    },
    {
      provide: GetBeer,
      useFactory: (beers: BeerRepository) => new GetBeer(beers),
      inject: [BEER_REPOSITORY],
    },
    {
      provide: ListFeaturedBeers,
      useFactory: (beers: BeerRepository) => new ListFeaturedBeers(beers),
      inject: [BEER_REPOSITORY],
    },
    {
      provide: ListBeers,
      useFactory: (beers: BeerRepository) => new ListBeers(beers),
      inject: [BEER_REPOSITORY],
    },
  ],
})
export class CatalogModule {}
