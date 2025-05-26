import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, format } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fonoId = searchParams.get('fonoId');

    if (!fonoId || isNaN(Number(fonoId))) {
        return NextResponse.json({ error: 'Valid fonoId is required' }, { status: 400 });
    }

    const hoy = new Date();
    const fonoIdBigInt = BigInt(fonoId);

    try {
        const turnos = await prisma.turno.findMany({
            where: {
                fonoId: fonoIdBigInt,
                fecha: {
                    gte: startOfDay(hoy),
                    lte: endOfDay(hoy)
                },
                estado: {
                    in: ['PENDIENTE', 'CONFIRMADO']
                }
            },
            include: {
                paciente: {
                    include: {
                        persona: true
                    }
                }
            },
            orderBy: {
                fecha: 'asc'
            }
        });

        return NextResponse.json(turnos.map(turno => ({
            id: Number(turno.id),
            pacienteId: Number(turno.pacienteId),
            fecha: format(turno.fecha, 'dd/MM/yyyy'),
            horario: format(turno.fecha, 'HH:mm'),
            estado: turno.estado
        })));
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 