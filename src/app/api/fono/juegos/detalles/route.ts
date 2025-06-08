import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fonoId = searchParams.get('fonoId');

        if (!fonoId) {
            return NextResponse.json({ error: 'FonoId is required' }, { status: 400 });
        }

        // Get all patients associated with this fono
        const fonoPacientes = await prisma.fonoPaciente.findMany({
            where: {
                fonoId: BigInt(fonoId)
            },
            select: {
                pacienteId: true
            }
        });

        const pacienteIds = fonoPacientes.map(fp => fp.pacienteId);

        // Get active games count from Juego table
        const juegosActivos = await prisma.juego.count({
            where: {
                estado: true,
                fonoIdCreado: BigInt(fonoId)
            }
        });

        // Get all game instances for these patients
        const instanciasJuegos = await prisma.instanciaJuego.findMany({
            where: {
                pacienteId: {
                    in: pacienteIds
                }
            },
            select: {
                estado: true,
                expGanada: true,
                fechaJuego: true
            },
            orderBy: {
                fechaJuego: 'desc'
            }
        });

        // Calculate statistics
        const juegosCompletados = instanciasJuegos.filter(ij => ij.estado === 'GANADO').length;
        const juegosPerdidos = instanciasJuegos.filter(ij => ij.estado === 'PERDIDO').length;
        const totalJuegos = juegosCompletados + juegosPerdidos;
        const promedioPuntuacion = totalJuegos > 0
            ? Math.round((juegosCompletados / totalJuegos) * 100)
            : 0;

        // Get last played date
        const ultimaFechaJugada = instanciasJuegos.length > 0 ? instanciasJuegos[0].fechaJuego : null;

        return NextResponse.json({
            juegosActivos,
            juegosCompletados,
            promedioPuntuacion,
            ultimaFechaJugada
        });

    } catch (error) {
        console.error('Error fetching game statistics:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 