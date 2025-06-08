import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoJuego } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Body completo recibido:', body);
        const { pacienteId, juegoId, expGanada, estado } = body;

        console.log('Estado recibido en API:', estado);
        console.log('Tipo de estado:', typeof estado);

        // Create game instance
        const instancia = await prisma.instanciaJuego.create({
            data: {
                pacienteId: BigInt(pacienteId),
                juegoId: BigInt(juegoId),
                expGanada: expGanada ? parseFloat(expGanada) : null,
                fechaJuego: new Date(),
                estado: estado as EstadoJuego
            }
        });

        console.log('Instancia creada:', instancia);

        // If game was won, update patient's experience
        if (estado === 'GANADO' && expGanada) {
            await prisma.paciente.update({
                where: { id: BigInt(pacienteId) },
                data: {
                    experiencia: {
                        increment: parseInt(expGanada)
                    }
                }
            });
        }

        // Convert BigInt to string for JSON serialization
        const serializedInstancia = {
            ...instancia,
            id: instancia.id.toString(),
            pacienteId: instancia.pacienteId.toString(),
            juegoId: instancia.juegoId.toString()
        };

        return NextResponse.json({ success: true, instancia: serializedInstancia });
    } catch (error) {
        console.error('Error saving game instance:', error);
        return NextResponse.json(
            { success: false, error: 'Error al guardar la instancia del juego' },
            { status: 500 }
        );
    }
} 