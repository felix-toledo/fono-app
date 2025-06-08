-- CreateTable
CREATE TABLE "Nivel" (
    "id" SERIAL NOT NULL,
    "nivel" INTEGER NOT NULL,
    "exp_minima" INTEGER NOT NULL,
    "exp_maxima" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Nivel_pkey" PRIMARY KEY ("id")
);

-- Insert initial data
INSERT INTO "Nivel" ("nivel", "exp_minima", "exp_maxima", "descripcion") VALUES
(1, 0, 100, 'Este nivel va a consistir en dar juegos muy fáciles para que el niño se acostumbre a los diferentes tipos'),
(2, 100, 300, 'Dificultad un poco más difícil, pero seguimos teniendo en cuenta que todavía nuestro paciente no se acostumbró al máximo'),
(3, 300, 700, 'Nivel intermedio donde el paciente comienza a desarrollar habilidades más complejas'),
(4, 700, 1500, 'Nivel avanzado donde el paciente demuestra un buen dominio de las habilidades básicas'),
(5, 1500, 10000, 'Nivel experto donde el paciente puede manejar situaciones complejas y desafiantes'); 