import { randomUUID } from "node:crypto";
import { Module } from "@nestjs/common";
import { AppLogger } from "../../common/logging/app-logger.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { GetBeer } from "./application/get-beer.js";
import { IssuePhotoPath } from "./application/issue-photo-path.js";
import { ListBeers } from "./application/list-beers.js";
import { ListFeaturedBeers } from "./application/list-featured-beers.js";
import { PublishBeerPhoto } from "./application/publish-beer-photo.js";
import {
  ADMIN_BEER_REPOSITORY,
  BEER_REPOSITORY,
  PHOTO_STORAGE,
  PHOTO_UPLOAD_REPOSITORY,
} from "./catalog.tokens.js";
import type { AdminBeerRepository } from "./domain/admin-beer.js";
import type { BeerRepository } from "./domain/beer-repository.js";
import type { PhotoStorage, PhotoUploadRepository } from "./domain/beer-photo.js";
import { PrismaAdminBeerRepository } from "./infrastructure/prisma-admin-beer-repository.js";
import { PrismaBeerRepository } from "./infrastructure/prisma-beer-repository.js";
import { PrismaPhotoUploadRepository } from "./infrastructure/prisma-photo-upload-repository.js";
import { SupabasePhotoStorage } from "./infrastructure/supabase-photo-storage.js";
import { UnconfiguredPhotoStorage } from "./infrastructure/unconfigured-photo-storage.js";
import { AdminBeerController } from "./presentation/admin-beer.controller.js";
import { CatalogController } from "./presentation/catalog.controller.js";

@Module({
  exports: [BEER_REPOSITORY],
  controllers: [CatalogController, AdminBeerController],
  providers: [
    {
      provide: BEER_REPOSITORY,
      useFactory: (prisma: PrismaService, logger: AppLogger) =>
        new PrismaBeerRepository(prisma, logger),
      inject: [PrismaService, AppLogger],
    },
    {
      provide: ADMIN_BEER_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaAdminBeerRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: PHOTO_UPLOAD_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaPhotoUploadRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: PHOTO_STORAGE,
      // A URL e a chave pública (anon) do Supabase; sem elas, enviar foto responde 503.
      useFactory: () =>
        process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
          ? new SupabasePhotoStorage(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
          : new UnconfiguredPhotoStorage(),
    },
    {
      provide: IssuePhotoPath,
      useFactory: (uploads: PhotoUploadRepository) => new IssuePhotoPath(uploads, () => new Date()),
      inject: [PHOTO_UPLOAD_REPOSITORY],
    },
    {
      provide: PublishBeerPhoto,
      useFactory: (
        beers: AdminBeerRepository,
        uploads: PhotoUploadRepository,
        storage: PhotoStorage,
      ) => new PublishBeerPhoto(beers, uploads, storage, () => new Date(), randomUUID),
      inject: [ADMIN_BEER_REPOSITORY, PHOTO_UPLOAD_REPOSITORY, PHOTO_STORAGE],
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
