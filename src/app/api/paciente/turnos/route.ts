import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadosTurno } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pacienteId = searchParams.get('pacienteId');
        const filter = searchParams.get('filter'); // 'past' or 'future'

        if (!pacienteId) {
            return NextResponse.json({ error: 'Paciente ID is required' }, { status: 400 });
        }

        const currentDate = new Date();
        let whereClause: any = {
            pacienteId: BigInt(pacienteId),
        };

        if (filter === 'past') {
            whereClause.fecha = {
                lt: currentDate
            };
        } else if (filter === 'future') {
            whereClause.fecha = {
                gte: currentDate
            };
        }

        const turnos = await prisma.turno.findMany({
            where: whereClause,
            include: {
                fono: {
                    include: {
                        persona: {
                            select: {
                                nombre: true,
                                apellido: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                fecha: 'asc'
            }
        });

        return NextResponse.json(turnos);
    } catch (error) {
        console.error('Error fetching turnos:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 