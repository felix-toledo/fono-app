-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "EstadoJuego" AS ENUM ('GANADO', 'PERDIDO', 'ERROR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "InstanciaJuego" DROP COLUMN "fonoAsignadorId",
DROP COLUMN "fechaAsignacion",
DROP COLUMN "tiempoTotal",
DROP COLUMN "puntuacion",
DROP COLUMN "jugado",
ADD COLUMN "estado" "EstadoJuego" NOT NULL DEFAULT 'ERROR'; 