import { EstadosTurno } from '@prisma/client';

export interface Turno {
    id: number;
    pacienteId: number;
    fecha: string;
    horario: string;
    estado: EstadosTurno;
}

export interface Paciente {
    id: number;
    nombre: string;
    apellido: string;
    estado: 'activo' | 'inactivo';
    ultimaConsulta?: string;
}