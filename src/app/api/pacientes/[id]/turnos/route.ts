import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const turnos = await prisma.turno.findMany({
            where: {
                pacienteId: parseInt(params.id)
            },
            orderBy: {
                fecha: 'desc'
            },
            include: {
                fono: {
                    select: {
                        persona: {
                            select: {
                                nombre: true,
                                apellido: true
                            }
                        }
                    }
                }
            }
        });

        // Transformar los datos para serialización
        const turnosSerializados = turnos.map(turno => ({
            id: Number(turno.id),
            pacienteId: Number(turno.pacienteId),
            fonoId: Number(turno.fonoId),
            fecha: turno.fecha.toISOString(),
            estado: turno.estado,
            observaciones: turno.observaciones || '',
            tipoSesion: turno.tipoSesion || '',
            fonoNombre: `${turno.fono.persona.nombre} ${turno.fono.persona.apellido}`
        }));

        return NextResponse.json(turnosSerializados);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json(
            { error: 'Error al obtener los turnos' },
            { status: 500 }
        );
    }
} 