import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, format, parse } from 'date-fns';

const prisma = new PrismaClient();

// GET: Obtener turnos para una fecha específica
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');
    const fonoId = searchParams.get('fonoId');

    if (!fonoId || isNaN(Number(fonoId))) {
        return NextResponse.json({ error: 'Valid fonoId is required' }, { status: 400 });
    }

    try {
        const fechaObj = fecha ? parse(fecha, 'dd/MM/yyyy', new Date()) : new Date();
        const fonoIdBigInt = BigInt(fonoId);

        const turnos = await prisma.turno.findMany({
            where: {
                fonoId: fonoIdBigInt,
                fecha: {
                    gte: startOfDay(fechaObj),
                    lte: endOfDay(fechaObj)
                },
                estado: {
                    in: ['PENDIENTE', 'CONFIRMADO']
                }
            },
            include: {
                paciente: {
                    include: {
                        persona: true
                    }
                }
            },
            orderBy: {
                fecha: 'asc'
            }
        });

        return NextResponse.json(turnos.map(turno => ({
            id: Number(turno.id),
            pacienteId: Number(turno.pacienteId),
            pacienteNombre: `${turno.paciente.persona.nombre} ${turno.paciente.persona.apellido}`,
            fecha: format(turno.fecha, 'dd/MM/yyyy'),
            horario: format(turno.fecha, 'HH:mm'),
            tipo: turno.tipoSesion,
            notas: turno.observaciones,
            estado: turno.estado
        })));
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Crear un nuevo turno
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { pacienteId, fecha, horario, tipo, notas, fonoId } = body;

        if (!pacienteId || !fecha || !horario || !fonoId) {
            console.error('Campos faltantes:', { pacienteId, fecha, horario, fonoId });
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verificar que el paciente pertenece al fonoaudiólogo
        const fonoPaciente = await prisma.fonoPaciente.findFirst({
            where: {
                pacienteId: BigInt(pacienteId),
                fonoId: BigInt(fonoId)
            }
        });

        if (!fonoPaciente) {
            console.error('Paciente no asignado al fonoaudiólogo:', { pacienteId, fonoId });
            return NextResponse.json(
                { error: 'El paciente no está asignado a este fonoaudiólogo' },
                { status: 403 }
            );
        }

        // Combinar fecha y horario
        const fechaCompleta = parse(`${fecha} ${horario}`, 'dd/MM/yyyy HH:mm', new Date());

        // Verificar si ya existe un turno en ese horario
        const turnoExistente = await prisma.turno.findFirst({
            where: {
                fonoId: BigInt(fonoId),
                fecha: fechaCompleta,
                estado: {
                    in: ['PENDIENTE', 'CONFIRMADO']
                }
            }
        });

        if (turnoExistente) {
            console.error('Turno existente en ese horario:', turnoExistente);
            return NextResponse.json(
                { error: 'Ya existe un turno en ese horario' },
                { status: 400 }
            );
        }

        // Crear el turno
        const turno = await prisma.turno.create({
            data: {
                pacienteId: BigInt(pacienteId),
                fonoId: BigInt(fonoId),
                fecha: fechaCompleta,
                tipoSesion: tipo || 'Sesión regular',
                observaciones: notas || '',
                estado: 'CONFIRMADO'
            }
        });


        return NextResponse.json({
            id: Number(turno.id),
            message: 'Turno creado exitosamente'
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            { error: 'Error al crear el turno' },
            { status: 500 }
        );
    }
}

// PUT: Actualizar un turno existente
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, pacienteId, fecha, horario, tipo, notas, fonoId } = body;

        if (!id || !pacienteId || !fecha || !horario || !fonoId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verificar que el paciente pertenece al fonoaudiólogo
        const fonoPaciente = await prisma.fonoPaciente.findFirst({
            where: {
                pacienteId: BigInt(pacienteId),
                fonoId: BigInt(fonoId)
            }
        });

        if (!fonoPaciente) {
            return NextResponse.json(
                { error: 'El paciente no está asignado a este fonoaudiólogo' },
                { status: 403 }
            );
        }

        // Combinar fecha y horario
        const fechaCompleta = parse(`${fecha} ${horario}`, 'dd/MM/yyyy HH:mm', new Date());

        // Verificar si ya existe un turno en ese horario (excluyendo el turno actual)
        const turnoExistente = await prisma.turno.findFirst({
            where: {
                fonoId: BigInt(fonoId),
                fecha: fechaCompleta,
                estado: {
                    in: ['PENDIENTE', 'CONFIRMADO']
                },
                NOT: {
                    id: BigInt(id)
                }
            }
        });

        if (turnoExistente) {
            return NextResponse.json(
                { error: 'Ya existe un turno en ese horario' },
                { status: 400 }
            );
        }

        // Actualizar el turno
        const turno = await prisma.turno.update({
            where: {
                id: BigInt(id)
            },
            data: {
                pacienteId: BigInt(pacienteId),
                fecha: fechaCompleta,
                tipoSesion: tipo || 'Sesión regular',
                observaciones: notas || '',
                estado: 'CONFIRMADO'
            }
        });

        return NextResponse.json({
            id: Number(turno.id),
            message: 'Turno actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el turno' },
            { status: 500 }
        );
    }
}

// DELETE: Eliminar un turno
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const fonoId = searchParams.get('fonoId');

        if (!id || !fonoId) {
            return NextResponse.json(
                { error: 'ID de turno y fonoId son requeridos' },
                { status: 400 }
            );
        }

        // Verificar que el turno pertenece al fonoaudiólogo
        const turno = await prisma.turno.findFirst({
            where: {
                id: BigInt(id),
                fonoId: BigInt(fonoId)
            }
        });

        if (!turno) {
            return NextResponse.json(
                { error: 'Turno no encontrado o no pertenece a este fonoaudiólogo' },
                { status: 404 }
            );
        }

        // Verificar que el turno no es de un día anterior
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaTurno = new Date(turno.fecha);
        fechaTurno.setHours(0, 0, 0, 0);

        if (fechaTurno <= hoy) {
            return NextResponse.json(
                { error: 'No se pueden eliminar turnos de días anteriores' },
                { status: 400 }
            );
        }

        // Eliminar el turno
        await prisma.turno.delete({
            where: {
                id: BigInt(id)
            }
        });

        return NextResponse.json({
            message: 'Turno eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return NextResponse.json(
            { error: 'Error al eliminar el turno' },
            { status: 500 }
        );
    }
} 