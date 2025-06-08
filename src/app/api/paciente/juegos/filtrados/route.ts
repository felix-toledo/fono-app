import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { RangoEdad, TipoRama } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pacienteId = searchParams.get('pacienteId');

        if (!pacienteId) {
            return NextResponse.json({ error: 'PacienteId is required' }, { status: 400 });
        }

        // 1. Get patient's age and compromised areas
        const paciente = await prisma.paciente.findUnique({
            where: {
                id: BigInt(pacienteId)
            },
            include: {
                persona: true,
                historiaClinica: {
                    where: {
                        estado: 'Activa'
                    },
                    include: {
                        diagnostico: true
                    },
                    orderBy: {
                        id: 'desc'
                    },
                    take: 1
                }
            }
        });

        if (!paciente) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        // Calculate patient's age
        const fechaNac = paciente.persona.fechaNac;
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNac.getFullYear();

        // Determine age range based on patient's age
        let rangoEdad: RangoEdad;
        if (edad >= 4 && edad <= 6) {
            rangoEdad = RangoEdad.DE_4_A_6;
        } else if (edad >= 7 && edad <= 10) {
            rangoEdad = RangoEdad.DE_7_A_10;
        } else {
            rangoEdad = RangoEdad.TODOS;
        }

        // Get compromised area from active clinical history
        const areaComprometida = paciente.historiaClinica[0]?.diagnostico.areasComprometidas;

        // 2. Get games that the patient has already won
        const juegosGanados = await prisma.instanciaJuego.findMany({
            where: {
                pacienteId: BigInt(pacienteId),
                estado: 'GANADO'
            },
            select: {
                juegoId: true
            }
        });

        const juegosGanadosIds = juegosGanados.map(j => j.juegoId);

        // 3. Fetch games with filters
        const juegos = await prisma.juego.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { rangoEdad: rangoEdad },
                            { rangoEdad: RangoEdad.TODOS }
                        ]
                    },
                    {
                        OR: areaComprometida ? [
                            { rama: areaComprometida },
                            { rama: undefined }
                        ] : [
                            { rama: undefined }
                        ]
                    },
                    { estado: true }, // Only active games
                    { id: { notIn: juegosGanadosIds } } // Exclude games already won
                ]
            },
            include: {
                juegoCampoJs: {
                    include: {
                        campoJuego: true
                    }
                }
            },
            orderBy: {
                fechaCreado: 'desc'
            }
        });

        // Custom replacer function to handle BigInt
        const replacer = (key: string, value: any) => {
            if (typeof value === 'bigint') {
                return value.toString();
            }
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        };

        const juegosSerializados = JSON.parse(JSON.stringify(juegos, replacer));

        return NextResponse.json({
            success: true,
            juegos: juegosSerializados,
            filtros: {
                edad,
                rangoEdad,
                areaComprometida
            }
        });

    } catch (error) {
        console.error('Error fetching filtered games:', error);
        return NextResponse.json(
            { error: 'Error al obtener los juegos filtrados' },
            { status: 500 }
        );
    }
} 