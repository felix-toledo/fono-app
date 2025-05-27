import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to serialize BigInt values and dates
function serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'bigint') {
        return obj.toString();
    }

    if (obj instanceof Date) {
        return obj.toISOString();
    }

    if (Array.isArray(obj)) {
        return obj.map(serializeBigInt);
    }

    if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            result[key] = serializeBigInt(obj[key]);
        }
        return result;
    }

    return obj;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const pacienteId = parseInt(params.id);
        if (isNaN(pacienteId)) {
            return NextResponse.json(
                { message: 'ID de paciente inválido' },
                { status: 400 }
            );
        }

        const paciente = await prisma.paciente.findUnique({
            where: { id: pacienteId },
            include: {
                persona: true,
                fonoPacientes: {
                    include: {
                        fono: true
                    }
                }
            }
        });

        if (!paciente) {
            return NextResponse.json(
                { message: 'Paciente no encontrado' },
                { status: 404 }
            );
        }

        const serializedResult = serializeBigInt(paciente);
        return NextResponse.json(serializedResult);

    } catch (error: any) {
        console.error('Error fetching patient:', error);
        return NextResponse.json(
            { message: error.message || 'Error al obtener el paciente' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const pacienteId = parseInt(params.id);
        if (isNaN(pacienteId)) {
            return NextResponse.json(
                { message: 'ID de paciente inválido' },
                { status: 400 }
            );
        }

        const data = await request.json();
        const { persona, escolaridad, ocupacion, obraSocial } = data;

        // First, get the patient to find the associated person
        const paciente = await prisma.paciente.findUnique({
            where: { id: pacienteId },
            include: { persona: true }
        });

        if (!paciente) {
            return NextResponse.json(
                { message: 'Paciente no encontrado' },
                { status: 404 }
            );
        }

        // Update everything in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Persona
            const updatedPersona = await tx.persona.update({
                where: { id: paciente.personaId },
                data: {
                    nombre: persona.nombre,
                    apellido: persona.apellido,
                    dni: persona.dni,
                    fechaNac: new Date(persona.fechaNac),
                    direccion: persona.direccion,
                    telefono: persona.telefono,
                    mail: persona.mail
                }
            });

            // 2. Update Paciente (sin actualizar fechaAlta)
            const updatedPaciente = await tx.paciente.update({
                where: { id: pacienteId },
                data: {
                    escolaridad,
                    ocupacion,
                    obraSocial
                }
            });

            return {
                paciente: updatedPaciente,
                persona: updatedPersona
            };
        });

        const serializedResult = serializeBigInt(result);
        return NextResponse.json({
            message: 'Paciente actualizado exitosamente',
            data: serializedResult
        });

    } catch (error: any) {
        console.error('Error updating patient:', error);
        return NextResponse.json(
            { message: error.message || 'Error al actualizar el paciente' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const pacienteId = parseInt(params.id);
        if (isNaN(pacienteId)) {
            return NextResponse.json(
                { message: 'ID de paciente inválido' },
                { status: 400 }
            );
        }

        // First, get the patient to find the associated person and user
        const paciente = await prisma.paciente.findUnique({
            where: { id: pacienteId },
            include: {
                persona: {
                    include: {
                        usuario: true
                    }
                },
                fonoPacientes: true,
                turnos: true,
                historiaClinica: true
            }
        });

        if (!paciente) {
            return NextResponse.json(
                { message: 'Paciente no encontrado' },
                { status: 404 }
            );
        }

        // Delete everything in a transaction
        await prisma.$transaction(async (tx) => {
            // 1. Delete Turnos
            if (paciente.turnos.length > 0) {
                await tx.turno.deleteMany({
                    where: { pacienteId }
                });
            }

            // 2. Delete Historias Clínicas
            if (paciente.historiaClinica.length > 0) {
                await tx.historiaClinica.deleteMany({
                    where: { pacienteId }
                });
            }

            // 3. Delete FonoPaciente relationships
            if (paciente.fonoPacientes.length > 0) {
                await tx.fonoPaciente.deleteMany({
                    where: { pacienteId }
                });
            }

            // 4. Delete Paciente
            await tx.paciente.delete({
                where: { id: pacienteId }
            });

            // 5. Delete Usuario if exists
            if (paciente.persona.usuario) {
                await tx.usuario.delete({
                    where: { id: paciente.persona.usuario.id }
                });
            }

            // 6. Delete Persona
            await tx.persona.delete({
                where: { id: paciente.personaId }
            });
        });

        return NextResponse.json({
            message: 'Paciente y todos sus datos relacionados eliminados exitosamente'
        });

    } catch (error: any) {
        console.error('Error deleting patient:', error);
        return NextResponse.json(
            { message: error.message || 'Error al eliminar el paciente' },
            { status: 500 }
        );
    }
} 