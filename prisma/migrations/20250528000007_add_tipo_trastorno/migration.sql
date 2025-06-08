-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "TipoTrastorno" AS ENUM ('Expresivos', 'Mixtos', 'Procesamiento_y_Formulacion');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
DO $$ BEGIN
    ALTER TABLE "DiagnosticoFono" ADD COLUMN "tipoTrastorno" "TipoTrastorno" NOT NULL DEFAULT 'Expresivos';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$; 