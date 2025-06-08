'use client';

import { useEffect, useState } from 'react';
import { usePaciente } from '@/contexts/PacienteContext';
import { EstadosTurno } from '@prisma/client';

interface Turno {
    id: number;
    fecha: string;
    estado: EstadosTurno;
    observaciones: string;
    tipoSesion: string | null;
    fono: {
        persona: {
            nombre: string;
            apellido: string;
        };
    };
}

export default function Turnos() {
    const { getPacienteId } = usePaciente();
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [filter, setFilter] = useState<'all' | 'past' | 'future'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTurnos = async () => {
            try {
                const pacienteId = getPacienteId();
                if (!pacienteId) return;

                const response = await fetch(`/api/paciente/turnos?pacienteId=${pacienteId}${filter !== 'all' ? `&filter=${filter}` : ''}`);
                if (!response.ok) throw new Error('Failed to fetch turnos');

                const data = await response.json();
                setTurnos(data);
            } catch (error) {
                console.error('Error fetching turnos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTurnos();
    }, [getPacienteId, filter]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEstadoColor = (estado: EstadosTurno) => {
        switch (estado) {
            case 'CONFIRMADO':
                return 'bg-green-100 text-green-800';
            case 'PENDIENTE':
                return 'bg-yellow-100 text-yellow-800';
            case 'CANCELADO':
                return 'bg-red-100 text-red-800';
            case 'REALIZADO':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Mis Turnos</h1>

                <div className="mb-6 flex gap-4">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-4 py-2 rounded ${filter === 'past' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                    >
                        Pasados
                    </button>
                    <button
                        onClick={() => setFilter('future')}
                        className={`px-4 py-2 rounded ${filter === 'future' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                    >
                        Próximos
                    </button>
                </div>

                {loading ? (
                    <div className="text-center">Cargando turnos...</div>
                ) : turnos.length === 0 ? (
                    <div className="text-center text-gray-500">No hay turnos disponibles</div>
                ) : (
                    <div className="space-y-4">
                        {turnos.map((turno) => (
                            <div key={turno.id} className="bg-white p-4 rounded-lg shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">
                                            {formatDate(turno.fecha)}
                                        </h3>
                                        <p className="text-gray-600">
                                            Fonoaudiólogo: {turno.fono.persona.nombre} {turno.fono.persona.apellido}
                                        </p>
                                        {turno.tipoSesion && (
                                            <p className="text-gray-600">
                                                Tipo de sesión: {turno.tipoSesion}
                                            </p>
                                        )}
                                        {turno.observaciones && (
                                            <p className="text-gray-600 mt-2">
                                                {turno.observaciones}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${getEstadoColor(turno.estado)}`}>
                                        {turno.estado}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 