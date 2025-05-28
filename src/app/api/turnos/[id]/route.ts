import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const turnoId = parseInt(params.id);
        if (isNaN(turnoId)) {
            return NextResponse.json(
                { error: 'ID de turno inválido' },
                { status: 400 }
            );
        }

        const data = await request.json();
        const { estado } = data;

        if (!estado || !['PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'REALIZADO'].includes(estado)) {
            return NextResponse.json(
                { error: 'Estado inválido' },
                { status: 400 }
            );
        }

        // Verificar que el turno existe
        const turno = await prisma.turno.findUnique({
            where: { id: BigInt(turnoId) }
        });

        if (!turno) {
            return NextResponse.json(
                { error: 'Turno no encontrado' },
                { status: 404 }
            );
        }

        // Actualizar el estado del turno
        const updatedTurno = await prisma.turno.update({
            where: { id: BigInt(turnoId) },
            data: { estado }
        });

        return NextResponse.json({
            id: Number(updatedTurno.id),
            estado: updatedTurno.estado,
            message: 'Estado del turno actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el estado del turno' },
            { status: 500 }
        );
    }
} 