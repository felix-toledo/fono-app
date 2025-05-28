import prisma from '@/lib/prisma';
import { DatosFono } from '../types/fono';

export async function getDatosFonoPorUserId(userId: number) {
  const result = await prisma.$queryRaw<DatosFono[]>`
        SELECT 
            u.id AS "UserId",
            f.id AS "FonoId",
            p.id AS "PersonaId",
            p.nombre AS "Nombre",
            p.apellido AS "Apellido",
            p.dni AS "DNI",
            p.telefono AS "Telefono",
            p.mail AS "Email",
            f."direccionConsultorio" AS "DireccionConsultorio",
            f."fechaAlta" AS "FechaAltaFono"
        FROM "Fonoaudiologo" f
        JOIN "Persona" p ON f."personaId" = p.id
        JOIN "Usuario" u ON u."personaId" = p.id
        WHERE u.id = ${userId}
    `;
  return result[0];
}
