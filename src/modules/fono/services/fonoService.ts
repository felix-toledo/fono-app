import prisma from '@/lib/prisma';
import { DatosFono } from '../types/fonoLocalStorage';

export async function getDatosFonoPorUserId(userId: number) {
  try {
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
            f."fechaAlta"::text AS "FechaAltaFono"
        FROM "Fonoaudiologo" f
        JOIN "Persona" p ON f."personaId" = p.id
        JOIN "Usuario" u ON u."personaId" = p.id
        WHERE u.id = ${userId}
    `;

    if (!result || result.length === 0) {
      return null;
    }

    // Asegurarnos de que los datos sean serializables
    const datos = result[0];
    return {
      ...datos,
      FechaAltaFono: datos.FechaAltaFono ? new Date(datos.FechaAltaFono).toISOString() : null
    };
  } catch (error) {
    console.error('Error en getDatosFonoPorUserId:', error);
    throw error;
  }
}
