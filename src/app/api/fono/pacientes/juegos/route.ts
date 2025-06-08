import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fonoId = searchParams.get('fonoId');
        const pacienteId = searchParams.get('pacienteId');

        console.log('Request params:', { fonoId, pacienteId });

        if (!fonoId || isNaN(Number(fonoId))) {
            return NextResponse.json({ error: 'Valid fonoId is required' }, { status: 400 });
        }

        if (!pacienteId || isNaN(Number(pacienteId))) {
            return NextResponse.json({ error: 'Valid pacienteId is required' }, { status: 400 });
        }

        // Verify that the patient belongs to the fonoaudiologo
        const fonoPaciente = await prisma.fonoPaciente.findFirst({
            where: {
                pacienteId: BigInt(pacienteId),
                fonoId: BigInt(fonoId)
            }
        });

        console.log('FonoPaciente found:', fonoPaciente);

        if (!fonoPaciente) {
            return NextResponse.json(
                { error: 'El paciente no está asignado a este fonoaudiólogo' },
                { status: 403 }
            );
        }

        // Get patient's level and experience
        const paciente = await prisma.paciente.findUnique({
            where: { id: BigInt(pacienteId) },
            select: {
                experiencia: true
            }
        });

        console.log('Paciente found:', paciente);

        if (!paciente) {
            return NextResponse.json(
                { error: 'Paciente no encontrado' },
                { status: 404 }
            );
        }

        // Get patient's level based on experience
        const nivel = await prisma.nivel.findFirst({
            where: {
                exp_minima: { lte: paciente.experiencia },
                exp_maxima: { gte: paciente.experiencia }
            },
            select: {
                nivel: true
            }
        });

        console.log('Nivel found:', nivel);

        // Get all games played by the patient
        const juegosJugados = await prisma.instanciaJuego.findMany({
            where: {
                pacienteId: BigInt(pacienteId)
            },
            include: {
                juego: true
            },
            orderBy: {
                fechaJuego: 'desc'
            }
        });

        console.log('Juegos jugados found:', juegosJugados);

        // Get last played date
        const ultimaFechaJugada = juegosJugados.length > 0 ? juegosJugados[0].fechaJuego : null;

        // Group games by type and count attempts, wins, and losses
        const estadisticasPorJuego = juegosJugados.reduce((acc: any, instancia) => {
            const juegoId = Number(instancia.juegoId);
            const juegoTitulo = instancia.juego.titulo;

            if (!acc[juegoId]) {
                acc[juegoId] = {
                    titulo: juegoTitulo,
                    intentos: 0,
                    ganados: 0,
                    perdidos: 0
                };
            }

            acc[juegoId].intentos++;
            if (instancia.estado === 'GANADO') {
                acc[juegoId].ganados++;
            } else if (instancia.estado === 'PERDIDO') {
                acc[juegoId].perdidos++;
            }

            return acc;
        }, {});

        console.log('Estadísticas por juego:', estadisticasPorJuego);

        const response = {
            nivel: nivel?.nivel || 1,
            experiencia: paciente.experiencia,
            totalJuegosJugados: juegosJugados.length,
            ultimaFechaJugada,
            estadisticasPorJuego: Object.values(estadisticasPorJuego)
        };

        console.log('Final response:', response);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching patient game statistics:', error);
        return NextResponse.json(
            { error: 'Error al obtener estadísticas de juegos' },
            { status: 500 }
        );
    }
} 