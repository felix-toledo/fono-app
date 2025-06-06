import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // Get pacienteId from query params
        const { searchParams } = new URL(request.url);
        const pacienteId = searchParams.get('pacienteId');

        if (!pacienteId) {
            return NextResponse.json({ error: 'PacienteId is required' }, { status: 400 });
        }

        // 1. Get count of played games
        const juegosJugados = await prisma.instanciaJuego.count({
            where: {
                pacienteId: BigInt(pacienteId),
                estado: {
                    in: ['GANADO', 'PERDIDO']
                }
            }
        });

        // 2. Get patient's experience and calculate current level
        const paciente = await prisma.paciente.findUnique({
            where: {
                id: BigInt(pacienteId)
            },
            select: {
                experiencia: true
            }
        });

        if (!paciente) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        // Find the current level based on experience
        const nivelActual = await prisma.nivel.findFirst({
            where: {
                exp_minima: {
                    lte: paciente.experiencia
                },
                exp_maxima: {
                    gte: paciente.experiencia
                }
            },
            select: {
                nivel: true
            }
        });

        // 3. Get areas comprometidas from historia clinica
        const historiaClinica = await prisma.historiaClinica.findFirst({
            where: {
                pacienteId: BigInt(pacienteId),
                estado: 'Activa'
            },
            include: {
                diagnostico: true
            },
            orderBy: {
                id: 'desc'
            }
        });

        return NextResponse.json({
            juegosJugados,
            nivelActual: nivelActual?.nivel || 1,
            areasComprometidas: historiaClinica?.diagnostico.areasComprometidas || null
        });

    } catch (error) {
        console.error('Error fetching patient game data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 