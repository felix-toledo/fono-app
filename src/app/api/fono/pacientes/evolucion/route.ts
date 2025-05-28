import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Crear una instancia de PrismaClient
const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const historiaId = searchParams.get('historiaId');

    if (!historiaId || isNaN(Number(historiaId))) {
        return NextResponse.json(
            { error: 'Se requiere un ID de historia válido' },
            { status: 400 }
        );
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

        // Convertir BigInt a Number antes de enviar la respuesta
        const convertedEvoluciones = evoluciones.map(evolucion => ({
            ...evolucion,
            id: Number(evolucion.id),
            historiaClinicaId: Number(evolucion.historiaClinicaId),
            fonoId: Number(evolucion.fonoId)
        }));

        return NextResponse.json(convertedEvoluciones);
    } catch (error) {
        console.error('Error fetching evolutions:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log('Received data:', data);

        const { historiaClinicaId, fonoId, fechaSesion, avances, observaciones, cambiosPlan } = data;

        // Validar que todos los campos requeridos estén presentes
        if (!historiaClinicaId || !fonoId || !fechaSesion || !avances || !observaciones || !cambiosPlan) {
            console.log('Missing fields:', { historiaClinicaId, fonoId, fechaSesion, avances, observaciones, cambiosPlan });
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verificar que la historia clínica exista
        const historiaClinica = await prisma.historiaClinica.findUnique({
            where: {
                id: BigInt(historiaClinicaId)
            }
        });

        if (!historiaClinica) {
            console.log('Historia clínica no encontrada:', historiaClinicaId);
            return NextResponse.json(
                { error: 'Historia clínica no encontrada' },
                { status: 404 }
            );
        }

        // Verificar que el fonoaudiólogo tenga acceso a esta historia clínica
        const fonoHistoria = await prisma.fonoHistoria.findFirst({
            where: {
                historiaId: BigInt(historiaClinicaId),
                fonoId: BigInt(fonoId)
            }
        });

        if (!fonoHistoria) {
            console.log('Fonoaudiólogo no tiene acceso a la historia:', { historiaClinicaId, fonoId });
            return NextResponse.json(
                { error: 'No tiene acceso a esta historia clínica' },
                { status: 403 }
            );
        }

        // Crear la evolución
        const evolucion = await prisma.evolucionFono.create({
            data: {
                historiaClinicaId: BigInt(historiaClinicaId),
                fonoId: BigInt(fonoId),
                fechaSesion: new Date(fechaSesion),
                avances,
                observaciones,
                cambiosPlan
            }
        });

        // Convertir BigInt a Number antes de enviar la respuesta
        const convertedEvolucion = {
            ...evolucion,
            id: Number(evolucion.id),
            historiaClinicaId: Number(evolucion.historiaClinicaId),
            fonoId: Number(evolucion.fonoId)
        };

        return NextResponse.json(convertedEvolucion);
    } catch (error) {
        console.error('Error creating evolution:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
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