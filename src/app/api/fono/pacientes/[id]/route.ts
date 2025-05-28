import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to serialize BigInt values
function serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'bigint') {
        return obj.toString();
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

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
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
                        fono: {
                            include: {
                                persona: true
                            }
                        }
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

        const serializedPaciente = serializeBigInt(paciente);
        return NextResponse.json(serializedPaciente);

    } catch (error) {
        console.error('Error fetching patient:', error);
        return NextResponse.json(
            { message: 'Error al obtener el paciente' },
            { status: 500 }
        );
    }
} 