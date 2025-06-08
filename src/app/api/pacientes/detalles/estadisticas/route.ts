import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pacienteId = searchParams.get('pacienteId');

        if (!pacienteId) {
            return NextResponse.json({ error: 'PacienteId is required' }, { status: 400 });
        }

        // 1. Get patient's basic info and experience
        const paciente = await prisma.paciente.findUnique({
            where: {
                id: BigInt(pacienteId)
            },
            select: {
                experiencia: true,
                persona: {
                    select: {
                        nombre: true,
                        apellido: true,
                        fechaNac: true
                    }
                }
            }
        });

        if (!paciente) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        // 2. Get current level based on experience
        const nivelActual = await prisma.nivel.findFirst({
            where: {
                exp_minima: { lte: paciente.experiencia },
                exp_maxima: { gte: paciente.experiencia }
            },
            select: {
                nivel: true,
                exp_minima: true,
                exp_maxima: true
            }
        });

        // 3. Get all game instances with their details
        const instanciasJuegos = await prisma.instanciaJuego.findMany({
            where: {
                pacienteId: BigInt(pacienteId)
            },
            include: {
                juego: {
                    select: {
                        titulo: true,
                        rama: true,
                        tipoJuego: true
                    }
                }
            },
            orderBy: {
                fechaJuego: 'desc'
            }
        });

        // 4. Calculate statistics
        const juegosGanados = instanciasJuegos.filter(ij => ij.estado === 'GANADO').length;
        const juegosPerdidos = instanciasJuegos.filter(ij => ij.estado === 'PERDIDO').length;
        const totalJuegos = juegosGanados + juegosPerdidos;
        const promedioPuntuacion = totalJuegos > 0
            ? Math.round((juegosGanados / totalJuegos) * 100)
            : 0;

        // 5. Get statistics by game type
        const estadisticasPorTipo = instanciasJuegos.reduce((acc: any, instancia) => {
            const tipo = instancia.juego.tipoJuego || 'SIN_TIPO';
            if (!acc[tipo]) {
                acc[tipo] = {
                    total: 0,
                    ganados: 0,
                    perdidos: 0,
                    expTotal: 0
                };
            }
            acc[tipo].total++;
            if (instancia.estado === 'GANADO') {
                acc[tipo].ganados++;
                acc[tipo].expTotal += instancia.expGanada || 0;
            } else if (instancia.estado === 'PERDIDO') {
                acc[tipo].perdidos++;
            }
            return acc;
        }, {});

        // 6. Get statistics by area (rama)
        const estadisticasPorArea = instanciasJuegos.reduce((acc: any, instancia) => {
            const rama = instancia.juego.rama;
            if (!acc[rama]) {
                acc[rama] = {
                    total: 0,
                    ganados: 0,
                    perdidos: 0,
                    expTotal: 0
                };
            }
            acc[rama].total++;
            if (instancia.estado === 'GANADO') {
                acc[rama].ganados++;
                acc[rama].expTotal += instancia.expGanada || 0;
            } else if (instancia.estado === 'PERDIDO') {
                acc[rama].perdidos++;
            }
            return acc;
        }, {});

        // 7. Get recent activity (last 5 games)
        const actividadReciente = instanciasJuegos.slice(0, 5).map(ij => ({
            fecha: ij.fechaJuego,
            juego: ij.juego.titulo,
            estado: ij.estado,
            expGanada: ij.expGanada
        }));

        // 8. Calculate progress to next level
        const progresoNivel = nivelActual ? {
            nivelActual: nivelActual.nivel,
            expActual: paciente.experiencia,
            expMinima: nivelActual.exp_minima,
            expMaxima: nivelActual.exp_maxima,
            progreso: Math.round(((paciente.experiencia - nivelActual.exp_minima) /
                (nivelActual.exp_maxima - nivelActual.exp_minima)) * 100)
        } : null;

        return NextResponse.json({
            paciente: {
                nombre: paciente.persona.nombre,
                apellido: paciente.persona.apellido,
                experiencia: paciente.experiencia
            },
            nivel: progresoNivel,
            estadisticasGenerales: {
                totalJuegos,
                juegosGanados,
                juegosPerdidos,
                promedioPuntuacion
            },
            estadisticasPorTipo,
            estadisticasPorArea,
            actividadReciente
        });

    } catch (error) {
        console.error('Error fetching patient statistics:', error);
        return NextResponse.json(
            { error: 'Error al obtener estadísticas del paciente' },
            { status: 500 }
        );
    }
}
