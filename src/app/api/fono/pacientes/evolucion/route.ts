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
        console.log('Received data:', JSON.stringify(data, null, 2));

        const { historiaClinicaId, fonoId, fechaSesion, motivo, avances, observaciones, cambiosPlan } = data;

        // Validar que todos los campos requeridos estén presentes
        const missingFields = [];
        if (!historiaClinicaId) missingFields.push('historiaClinicaId');
        if (!fonoId) missingFields.push('fonoId');
        if (!fechaSesion) missingFields.push('fechaSesion');
        if (!motivo) missingFields.push('motivo');
        if (!avances) missingFields.push('avances');
        if (!observaciones) missingFields.push('observaciones');
        if (!cambiosPlan) missingFields.push('cambiosPlan');

        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            console.log('Received values:', {
                historiaClinicaId,
                fonoId,
                fechaSesion,
                motivo,
                avances,
                observaciones,
                cambiosPlan
            });
            return NextResponse.json({
                error: 'Missing required fields',
                missingFields,
                receivedValues: {
                    historiaClinicaId,
                    fonoId,
                    fechaSesion,
                    motivo,
                    avances,
                    observaciones,
                    cambiosPlan
                }
            }, { status: 400 });
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
                motivo,
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
        const { id, fonoId, fechaSesion, motivo, avances, observaciones, cambiosPlan } = data;

        if (!id || !fonoId || !fechaSesion || !motivo) {
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
                motivo: motivo || '',
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