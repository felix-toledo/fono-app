import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const historiaId = searchParams.get('historiaId');

    if (!historiaId || isNaN(Number(historiaId))) {
        return NextResponse.json({ error: 'Valid historiaId is required' }, { status: 400 });
    }

    try {
        const evoluciones = await prisma.evolucionFono.findMany({
            where: {
                historiaClinicaId: BigInt(historiaId)
            },
            orderBy: {
                fechaSesion: 'desc'
            }
        });

        return NextResponse.json(evoluciones);
    } catch (error) {
        console.error('Error fetching evolutions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { historiaClinicaId, fonoId, fechaSesion, avances, observaciones, cambiosPlan } = data;

        if (!historiaClinicaId || !fonoId || !fechaSesion) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify that the clinical history exists and belongs to the fonoaudiologo
        const historia = await prisma.historiaClinica.findFirst({
            where: {
                id: BigInt(historiaClinicaId),
                fonoHistorias: {
                    some: {
                        fonoId: BigInt(fonoId)
                    }
                }
            }
        });

        if (!historia) {
            return NextResponse.json(
                { error: 'Historia clínica no encontrada o no pertenece a este fonoaudiólogo' },
                { status: 404 }
            );
        }

        // Create the evolution
        const evolucion = await prisma.evolucionFono.create({
            data: {
                historiaClinicaId: BigInt(historiaClinicaId),
                fonoId: BigInt(fonoId),
                fechaSesion: new Date(fechaSesion),
                avances: avances || '',
                observaciones: observaciones || '',
                cambiosPlan: cambiosPlan || ''
            }
        });

        return NextResponse.json(evolucion);
    } catch (error) {
        console.error('Error creating evolution:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, fonoId, fechaSesion, avances, observaciones, cambiosPlan } = data;

        if (!id || !fonoId || !fechaSesion) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify that the evolution exists and belongs to the fonoaudiologo
        const evolucion = await prisma.evolucionFono.findFirst({
            where: {
                id: BigInt(id),
                fonoId: BigInt(fonoId)
            }
        });

        if (!evolucion) {
            return NextResponse.json(
                { error: 'Evolución no encontrada o no pertenece a este fonoaudiólogo' },
                { status: 404 }
            );
        }

        // Update the evolution
        const updatedEvolucion = await prisma.evolucionFono.update({
            where: {
                id: BigInt(id)
            },
            data: {
                fechaSesion: new Date(fechaSesion),
                avances: avances || '',
                observaciones: observaciones || '',
                cambiosPlan: cambiosPlan || ''
            }
        });

        return NextResponse.json(updatedEvolucion);
    } catch (error) {
        console.error('Error updating evolution:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 