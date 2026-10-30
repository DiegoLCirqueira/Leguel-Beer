-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "nome" TEXT,
ADD COLUMN     "privacy_version" TEXT,
ADD COLUMN     "telefone" TEXT,
ADD COLUMN     "terms_accepted_at" TIMESTAMPTZ(3),
ADD COLUMN     "terms_version" TEXT;
