-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "RangoEdad" AS ENUM ('TODOS', 'DE_4_A_6', 'DE_7_A_10');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
DO $$ BEGIN
    ALTER TABLE "Juego" ADD COLUMN "rangoEdad" "RangoEdad" NOT NULL DEFAULT 'TODOS';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$; 