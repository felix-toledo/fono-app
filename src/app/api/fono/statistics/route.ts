import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

interface RegularPatientsCount {
    count: bigint;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fonoId = Number(searchParams.get('fonoId'));

    if (!fonoId || isNaN(Number(fonoId))) {
        return NextResponse.json({ error: 'Valid fonoId is required' }, { status: 400 });
    }

    const hoy = new Date();
    const inicioDia = startOfDay(hoy);
    const finDia = endOfDay(hoy);

    try {
        const turnosHoy = await prisma.turno.count({
            where: {
                fonoId: fonoId,
                fecha: {
                    gte: inicioDia,
                    lte: finDia
                },
                estado: 'CONFIRMADO'
            }
        });

        // Total de pacientes
        const pacientesTotal = await prisma.fonoPaciente.count({
            where: {
                fonoId: fonoId
            }
        });

        // Pacientes regulares (más de un turno REALIZADO)
        const pacientesRegulares = await prisma.$queryRaw<RegularPatientsCount[]>`
            SELECT COUNT(*) as count
            FROM (
                SELECT p.id
                FROM "Paciente" p
                JOIN "Turno" t ON t."pacienteId" = p.id
                JOIN "FonoPaciente" fp ON fp."pacienteId" = p.id
                WHERE fp."fonoId" = ${fonoId}
                AND t.estado = 'REALIZADO'
                GROUP BY p.id
                HAVING COUNT(t.id) > 1
            ) as regular_patients
        `;

        // Total de turnos REALIZADOS
        const turnosTotal = await prisma.turno.count({
            where: {
                fonoId: fonoId,
                estado: 'REALIZADO'
            }
        });


        return NextResponse.json({
            turnosHoy,
            pacientesTotal,
            pacientesRegulares: Number(pacientesRegulares[0]?.count || 0),
            turnosTotal
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
