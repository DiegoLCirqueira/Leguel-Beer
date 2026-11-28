-- Caminhos de envio da foto da cerveja: um arquivo, um admin, 10 minutos, uso único.
CREATE TABLE "beer_photo_uploads" (
    "id" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "admin_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beer_photo_uploads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "beer_photo_uploads_path_key" ON "beer_photo_uploads"("path");
CREATE INDEX "beer_photo_uploads_admin_id_idx" ON "beer_photo_uploads"("admin_id");

ALTER TABLE "beer_photo_uploads" ADD CONSTRAINT "beer_photo_uploads_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
