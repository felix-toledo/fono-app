import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fonoId = Number(searchParams.get('fonoId'));

    if (!fonoId || isNaN(Number(fonoId))) {
        return NextResponse.json({ error: 'Valid fonoId is required' }, { status: 400 });
    }

    const hoy = new Date();

    try {
        // Turnos de hoy
        const turnosHoy = await prisma.turno.count({
            where: {
                fonoId: fonoId,
                fecha: {
                    gte: startOfDay(hoy),
                    lte: endOfDay(hoy)
                }
            }
        });

        // Total de pacientes
        const pacientesTotal = await prisma.fonoPaciente.count({
            where: {
                fonoId: fonoId
            }
        });

        // Pacientes activos
        const pacientesActivos = await prisma.fonoPaciente.count({
            where: {
                fonoId: fonoId,
                paciente: {
                    turnos: {
                        some: {
                            fecha: {
                                gte: new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)
                            }
                        }
                    }
                }
            }
        });

        // Total de turnos
        const turnosTotal = await prisma.turno.count({
            where: {
                fonoId: fonoId
            }
        });
        console.log(turnosHoy, pacientesTotal, pacientesActivos, turnosTotal);
        return NextResponse.json({
            turnosHoy,
            pacientesTotal,
            pacientesActivos,
            turnosTotal
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
