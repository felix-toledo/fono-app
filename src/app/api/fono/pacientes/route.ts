import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fonoId = searchParams.get('fonoId');

    if (!fonoId || isNaN(Number(fonoId))) {
        return NextResponse.json({ error: 'Valid fonoId is required' }, { status: 400 });
    }

    try {
        const pacientes = await prisma.fonoPaciente.findMany({
            where: {
                fonoId: BigInt(fonoId)
            },
            include: {
                paciente: {
                    include: {
                        persona: true,
                        turnos: {
                            orderBy: {
                                fecha: 'desc'
                            },
                            take: 1
                        },
                        historiaClinica: {
                            orderBy: {
                                createdAt: 'desc'
                            },
                            take: 1
                        }
                    }
                }
            }
        });

        return NextResponse.json(pacientes.map(fp => ({
            id: Number(fp.paciente.id),
            nombre: fp.paciente.persona.nombre,
            apellido: fp.paciente.persona.apellido,
            dni: fp.paciente.persona.dni.toString(),
            telefono: fp.paciente.persona.telefono?.toString(),
            mail: fp.paciente.persona.mail,
            direccion: fp.paciente.persona.direccion,
            obraSocial: fp.paciente.obraSocial,
            escolaridad: fp.paciente.escolaridad,
            ocupacion: fp.paciente.ocupacion,
            fechaAlta: format(fp.paciente.fechaAlta, 'dd/MM/yyyy'),
            ultimaConsulta: fp.paciente.turnos[0]
                ? format(fp.paciente.turnos[0].fecha, 'dd/MM/yyyy')
                : undefined,
            tieneHistoriaClinica: fp.paciente.historiaClinica.length > 0,
            estado: 'activo' // This could be calculated based on some business logic
        })));
    } catch (error) {
        console.error('Error fetching patients:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 