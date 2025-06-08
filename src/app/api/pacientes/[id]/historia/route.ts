import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const pacienteId = parseInt(params.id);
        if (isNaN(pacienteId)) {
            return NextResponse.json(
                { error: 'ID de paciente inválido' },
                { status: 400 }
            );
        }

        // Buscar la historia clínica activa del paciente
        const historia = await prisma.historiaClinica.findFirst({
            where: {
                pacienteId: BigInt(pacienteId),
                estado: 'Activa'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!historia) {
            return NextResponse.json(
                { error: 'No se encontró una historia clínica activa para este paciente' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: Number(historia.id),
            pacienteId: Number(historia.pacienteId),
            estado: historia.estado,
            createdAt: historia.createdAt
        });
    } catch (error) {
        console.error('Error fetching clinical history:', error);
        return NextResponse.json(
            { error: 'Error al obtener la historia clínica' },
            { status: 500 }
        );
    }
} 