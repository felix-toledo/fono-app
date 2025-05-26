import prisma from '@/lib/prisma';
import { DatosFono } from '../types/fono';

export async function getDatosFonoPorUserId(userId: number) {
    // Ajusta los campos según la vista real
    const result = await prisma.$queryRaw<DatosFono[]>`
    SELECT * FROM vista_datos_fono WHERE "UserId" = ${userId}
  `;
    return result[0]; // Asumiendo que es único por usuario
}
