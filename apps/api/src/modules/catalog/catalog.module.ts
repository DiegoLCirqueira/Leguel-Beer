import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { ListBeers } from "./application/list-beers.js";
import { BEER_REPOSITORY } from "./catalog.tokens.js";
import type { BeerRepository } from "./domain/beer-repository.js";
import { PrismaBeerRepository } from "./infrastructure/prisma-beer-repository.js";
import { CatalogController } from "./presentation/catalog.controller.js";

@Module({
  controllers: [CatalogController],
  providers: [
    {
      provide: BEER_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaBeerRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: ListBeers,
      useFactory: (beers: BeerRepository) => new ListBeers(beers),
      inject: [BEER_REPOSITORY],
    },
  ],
})
export class CatalogModule {}
