"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DatosPaciente } from '../types/pacienteLocalStorage';
import ContenidoDashboardNinos from './ContenidoDashboard.tsx/ContenidoDashboardNinos';
import ContenidoDashboardAdultos from './ContenidoDashboard.tsx/ContenidoDashboardAdultos';
import { usePaciente } from '@/contexts/PacienteContext';

export interface EstadisticasJuegos {
    paciente: {
        nombre: string;
        apellido: string;
        experiencia: number;
    };
    nivel: {
        nivelActual: number;
        expActual: number;
        expMinima: number;
        expMaxima: number;
        progreso: number;
    } | null;
    estadisticasGenerales: {
        totalJuegos: number;
        juegosGanados: number;
        juegosPerdidos: number;
        promedioPuntuacion: number;
    };
    estadisticasPorTipo: Record<string, {
        total: number;
        ganados: number;
        perdidos: number;
        expTotal: number;
    }>;
    estadisticasPorArea: Record<string, {
        total: number;
        ganados: number;
        perdidos: number;
        expTotal: number;
    }>;
    actividadReciente: Array<{
        fecha: Date;
        juego: string;
        estado: string;
        expGanada: number | null;
    }>;
}

export default function DashboardPaciente() {
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<DatosPaciente | null>(null);
    const [edad, setEdad] = useState<number | null>(null);
    const [estadisticas, setEstadisticas] = useState<EstadisticasJuegos | null>(null);
    const router = useRouter();
    const { getPacienteId } = usePaciente();

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                // 1. Cargar datos del usuario
                const sessionData = localStorage.getItem('userSession');
                if (!sessionData) {
                    router.push('/login');
                    return;
                }

                const parsedData = JSON.parse(sessionData);
                if (parsedData.perfil !== 'PACIENTE') {
                    router.push('/login');
                    return;
                }

                // 2. Calcular edad
                const fechaNac = new Date(parsedData.persona.fechaNac);
                const hoy = new Date();
                const edadCalculada = hoy.getFullYear() - fechaNac.getFullYear();

                // 3. Cargar estadísticas
                const pacienteId = getPacienteId();
                if (!pacienteId) return;

                const response = await fetch(`/api/pacientes/detalles/estadisticas?pacienteId=${pacienteId}`);
                if (!response.ok) throw new Error('Error fetching statistics');
                const estadisticasData = await response.json();

                // 4. Actualizar estado solo si el componente sigue montado
                if (isMounted) {
                    setUserInfo(parsedData);
                    setEdad(edadCalculada);
                    setEstadisticas(estadisticasData);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [router, getPacienteId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!userInfo || !edad) {
        return null;
    }

    return (
        <div className="flex flex-col gap-6">
            {edad < 10 ? (
                <ContenidoDashboardNinos
                    userInfo={userInfo}
                    edad={edad}
                    estadisticas={estadisticas}
                />
            ) : (
                <ContenidoDashboardAdultos
                    userInfo={userInfo}
                    edad={edad}
                />
            )}
        </div>
    );
}