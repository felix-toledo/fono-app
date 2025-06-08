-- CreateEnum
CREATE TYPE "TipoRama" AS ENUM ('Pragmatica', 'Semantica', 'Fonologia_y_Fonetica', 'Morfosintaxis');

-- CreateEnum
CREATE TYPE "TipoCampo" AS ENUM ('elegir_respuesta', 'asociar_imagen', 'escribir_respuesta', 'clasificar_categoria', 'sinonimos', 'antonimos', 'asociar_funcion', 'frase_audio', 'identificar_sonido', 'ordenar_palabras', 'ordenar_dialogos');

-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('ADMIN', 'FONO', 'PACIENTE', 'TUTOR');

-- CreateEnum
CREATE TYPE "EstadosTurno" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'REALIZADO');

-- CreateTable
CREATE TABLE "Persona" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" DECIMAL(65,30) NOT NULL,
    "fechaNac" TIMESTAMP(3) NOT NULL,
    "direccion" TEXT,
    "telefono" DECIMAL(65,30),
    "mail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" BIGSERIAL NOT NULL,
    "personaId" BIGINT NOT NULL,
    "escolaridad" TEXT,
    "ocupacion" TEXT,
    "obraSocial" TEXT,
    "fechaAlta" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fonoaudiologo" (
    "id" BIGSERIAL NOT NULL,
    "personaId" BIGINT NOT NULL,
    "matricula" TEXT,
    "direccionConsultorio" TEXT,
    "fechaAlta" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fonoaudiologo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FonoPaciente" (
    "id" BIGSERIAL NOT NULL,
    "pacienteId" BIGINT NOT NULL,
    "fonoId" BIGINT NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FonoPaciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MotivoConsulta" (
    "id" BIGSERIAL NOT NULL,
    "razonConsulta" TEXT,
    "derivacion" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MotivoConsulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Antecedentes" (
    "id" BIGSERIAL NOT NULL,
    "embarazoParto" TEXT,
    "desarrolloPsicomotor" TEXT,
    "enfermedadesPrevias" TEXT,
    "medicacionActual" TEXT,
    "historiaFamiliar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Antecedentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluacionFono" (
    "id" BIGSERIAL NOT NULL,
    "lenguaje" TEXT,
    "habla" TEXT,
    "voz" TEXT,
    "audicion" TEXT,
    "deglucion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluacionFono_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticoFono" (
    "id" BIGSERIAL NOT NULL,
    "tipoTrastorno" TEXT,
    "severidad" TEXT,
    "areasComprometidas" "TipoRama",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosticoFono_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanFono" (
    "id" BIGSERIAL NOT NULL,
    "objetivos" TEXT,
    "frecuenciaSesiones" DECIMAL(65,30),
    "duracionTratamiento" DECIMAL(65,30),
    "tecnicas" TEXT,
    "participacionFamiliar" TEXT,
    "estado" TEXT DEFAULT 'Activa',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanFono_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoriaClinica" (
    "id" BIGSERIAL NOT NULL,
    "pacienteId" BIGINT NOT NULL,
    "motivoId" BIGINT NOT NULL,
    "antecedenteId" BIGINT NOT NULL,
    "evaluacionId" BIGINT NOT NULL,
    "diagnosticoId" BIGINT NOT NULL,
    "planId" BIGINT NOT NULL,
    "estado" TEXT DEFAULT 'Activa',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoriaClinica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FonoHistoria" (
    "id" BIGSERIAL NOT NULL,
    "historiaId" BIGINT NOT NULL,
    "fonoId" BIGINT NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FonoHistoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvolucionFono" (
    "id" BIGSERIAL NOT NULL,
    "historiaClinicaId" BIGINT NOT NULL,
    "fonoId" BIGINT,
    "fechaSesion" TIMESTAMP(3),
    "avances" TEXT,
    "observaciones" TEXT,
    "cambiosPlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvolucionFono_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Juego" (
    "id" BIGSERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "rama" "TipoRama" NOT NULL,
    "descripcion" TEXT,
    "nivelDificultad" DECIMAL(65,30) NOT NULL,
    "experienciaDada" DECIMAL(65,30) NOT NULL,
    "estado" BOOLEAN NOT NULL,
    "fonoIdCreado" BIGINT NOT NULL,
    "fechaCreado" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Juego_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampoJuego" (
    "id" BIGSERIAL NOT NULL,
    "tipoCampo" "TipoCampo" NOT NULL,
    "titulo" TEXT NOT NULL,
    "ayuda" TEXT,
    "consigna" TEXT NOT NULL,
    "rptaValida" TEXT NOT NULL,
    "opciones" JSONB,
    "imagenConsigna" TEXT,
    "rama" "TipoRama",
    "audio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampoJuego_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JuegoCampoJ" (
    "id" BIGSERIAL NOT NULL,
    "juegoId" BIGINT NOT NULL,
    "campoJuegoId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JuegoCampoJ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstanciaJuego" (
    "id" BIGSERIAL NOT NULL,
    "pacienteId" BIGINT NOT NULL,
    "juegoId" BIGINT NOT NULL,
    "expGanada" DECIMAL(65,30),
    "puntuacion" DECIMAL(65,30),
    "jugado" BOOLEAN NOT NULL,
    "fechaJuego" TIMESTAMP(3),
    "fechaAsignacion" TIMESTAMP(3) NOT NULL,
    "fonoAsignadorId" BIGINT NOT NULL,
    "tiempoTotal" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstanciaJuego_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RptaCampo" (
    "id" BIGSERIAL NOT NULL,
    "instanciaId" BIGINT NOT NULL,
    "relacionCampoJuegoId" BIGINT NOT NULL,
    "valorRpta" TEXT,
    "audioRpta" TEXT,
    "acierto" BOOLEAN NOT NULL,
    "tiempo" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RptaCampo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" BIGSERIAL NOT NULL,
    "personaId" BIGINT NOT NULL,
    "perfil" "TipoUsuario" NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turno" (
    "id" BIGSERIAL NOT NULL,
    "pacienteId" BIGINT NOT NULL,
    "fonoId" BIGINT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "EstadosTurno" NOT NULL,
    "observaciones" TEXT NOT NULL,
    "tipoSesion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Persona_dni_key" ON "Persona"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_personaId_key" ON "Paciente"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "Fonoaudiologo_personaId_key" ON "Fonoaudiologo"("personaId");

-- CreateIndex
CREATE INDEX "idx_fono_paciente" ON "FonoPaciente"("pacienteId", "fonoId");

-- CreateIndex
CREATE INDEX "idx_historia_paciente" ON "HistoriaClinica"("pacienteId");

-- CreateIndex
CREATE INDEX "idx_evolucion_historia" ON "EvolucionFono"("historiaClinicaId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_personaId_key" ON "Usuario"("personaId");

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fonoaudiologo" ADD CONSTRAINT "Fonoaudiologo_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FonoPaciente" ADD CONSTRAINT "FonoPaciente_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FonoPaciente" ADD CONSTRAINT "FonoPaciente_fonoId_fkey" FOREIGN KEY ("fonoId") REFERENCES "Fonoaudiologo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_motivoId_fkey" FOREIGN KEY ("motivoId") REFERENCES "MotivoConsulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_antecedenteId_fkey" FOREIGN KEY ("antecedenteId") REFERENCES "Antecedentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "EvaluacionFono"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_diagnosticoId_fkey" FOREIGN KEY ("diagnosticoId") REFERENCES "DiagnosticoFono"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PlanFono"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FonoHistoria" ADD CONSTRAINT "FonoHistoria_historiaId_fkey" FOREIGN KEY ("historiaId") REFERENCES "HistoriaClinica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FonoHistoria" ADD CONSTRAINT "FonoHistoria_fonoId_fkey" FOREIGN KEY ("fonoId") REFERENCES "Fonoaudiologo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolucionFono" ADD CONSTRAINT "EvolucionFono_historiaClinicaId_fkey" FOREIGN KEY ("historiaClinicaId") REFERENCES "HistoriaClinica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolucionFono" ADD CONSTRAINT "EvolucionFono_fonoId_fkey" FOREIGN KEY ("fonoId") REFERENCES "Fonoaudiologo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Juego" ADD CONSTRAINT "Juego_fonoIdCreado_fkey" FOREIGN KEY ("fonoIdCreado") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuegoCampoJ" ADD CONSTRAINT "JuegoCampoJ_juegoId_fkey" FOREIGN KEY ("juegoId") REFERENCES "Juego"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuegoCampoJ" ADD CONSTRAINT "JuegoCampoJ_campoJuegoId_fkey" FOREIGN KEY ("campoJuegoId") REFERENCES "CampoJuego"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstanciaJuego" ADD CONSTRAINT "InstanciaJuego_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstanciaJuego" ADD CONSTRAINT "InstanciaJuego_juegoId_fkey" FOREIGN KEY ("juegoId") REFERENCES "Juego"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstanciaJuego" ADD CONSTRAINT "InstanciaJuego_fonoAsignadorId_fkey" FOREIGN KEY ("fonoAsignadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RptaCampo" ADD CONSTRAINT "RptaCampo_instanciaId_fkey" FOREIGN KEY ("instanciaId") REFERENCES "InstanciaJuego"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RptaCampo" ADD CONSTRAINT "RptaCampo_relacionCampoJuegoId_fkey" FOREIGN KEY ("relacionCampoJuegoId") REFERENCES "JuegoCampoJ"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_fonoId_fkey" FOREIGN KEY ("fonoId") REFERENCES "Fonoaudiologo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
