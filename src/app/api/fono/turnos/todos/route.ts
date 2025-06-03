import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Turno, Paciente, Persona } from '@prisma/client';

type TurnoWithPaciente = Turno & {
    paciente: Paciente & {
        persona: Pick<Persona, 'nombre' | 'apellido'>;
    };
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fonoId = searchParams.get('fonoId');

        if (!fonoId) {
            return NextResponse.json(
                { error: 'fonoId es requerido' },
                { status: 400 }
            );
        }

        const turnos = await prisma.turno.findMany({
            where: {
                fonoId: parseInt(fonoId)
            },
            include: {
                paciente: {
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

        // Transformar los datos para incluir el nombre completo del paciente
        const turnosFormateados = turnos.map((turno: TurnoWithPaciente) => ({
            ...turno,
            pacienteNombre: `${turno.paciente.persona.nombre} ${turno.paciente.persona.apellido}`
        }));

        return NextResponse.json(turnosFormateados);
    } catch (error) {
        console.error('Error al obtener los turnos:', error);
        return NextResponse.json(
            { error: 'Error al obtener los turnos' },
            { status: 500 }
        );
    }
} 