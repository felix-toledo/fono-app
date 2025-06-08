-- CreateEnum
CREATE TYPE "TipoJuego" AS ENUM ('ROLES', 'EMOCIONES', 'REPETIR', 'HABLAR', 'COMPLETAR', 'ORDEN');

-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN "experiencia" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Juego" ADD COLUMN "tipoJuego" "TipoJuego";

-- AlterTable
ALTER TABLE "CampoJuego" ALTER COLUMN "imagenConsigna" TYPE JSONB USING "imagenConsigna"::JSONB; 