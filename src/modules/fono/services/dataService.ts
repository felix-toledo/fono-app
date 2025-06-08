import { EstadosTurno, PrismaClient } from '@prisma/client';
import { Turno, Paciente } from '@/modules/fono/types';
import { format, startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

export const obtenerTurnos = async (fonoId: number): Promise<Turno[]> => {
    if (isNaN(fonoId)) {
        throw new Error('Invalid fonoId');
    }

    const response = await fetch(`/api/fono/turnos?fonoId=${fonoId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch appointments');
    }
    return response.json();
};

export const obtenerPacientes = async (fonoId: number): Promise<Paciente[]> => {
    if (isNaN(fonoId)) {
        throw new Error('Invalid fonoId');
    }

    const response = await fetch(`/api/fono/pacientes?fonoId=${fonoId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch patients');
    }
    return response.json();
};

export const obtenerEstadisticas = async (fonoId: number) => {
    if (isNaN(fonoId)) {
        throw new Error('Invalid fonoId');
    }

    const response = await fetch(`/api/fono/statistics?fonoId=${fonoId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch statistics');
    }
    return response.json();
};

export const obtenerPacientePorId = async (id: number): Promise<Paciente | null> => {
    const paciente = await prisma.paciente.findUnique({
        where: {
            id: BigInt(id)
        },
        include: {
            persona: true,
            turnos: {
                orderBy: {
                    fecha: 'desc'
                },
                take: 1
            }
        }
    });

    if (!paciente) return null;

    return {
        id: Number(paciente.id),
        nombre: paciente.persona.nombre,
        apellido: paciente.persona.apellido,
        estado: 'activo',
        ultimaConsulta: paciente.turnos[0]
            ? format(paciente.turnos[0].fecha, 'dd/MM/yyyy')
            : undefined
    };
}; 