import prisma from '@/lib/prisma';
import { DatosPaciente } from '../types/pacienteLocalStorage';

export async function getDatosPacientePorUserId(userId: number) {
  try {
    const result = await prisma.$queryRaw<DatosPaciente[]>`
        SELECT 
            u.id AS "UserId",
            p.id AS "PacienteId",
            per.nombre AS "Nombre",
            per.apellido AS "Apellido",
            per.dni AS "DNI",
            per.telefono AS "Telefono",
            per.mail AS "Email",
            p."fechaAlta"::text AS "FechaAltaPaciente"
        FROM "Paciente" p
        JOIN "Persona" per ON p."personaId" = per.id
        JOIN "Usuario" u ON u."personaId" = per.id
        WHERE u.id = ${userId}
    `;

    if (!result || result.length === 0) {
      return null;
    }

    // Asegurarnos de que los datos sean serializables
    const datos = result[0];
    return {
      ...datos,
      FechaAltaPaciente: datos.FechaAltaPaciente ? new Date(datos.FechaAltaPaciente).toISOString() : null
    };
  } catch (error) {
    console.error('Error en getDatosPacientePorUserId:', error);
    throw error;
  }
}
