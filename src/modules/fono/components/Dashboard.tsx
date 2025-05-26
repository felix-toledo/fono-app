"use client";

import { useState, useEffect } from 'react';
import { Calendar, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { StatCard } from '@/components/StatCard';
import { PatientList } from '@/components/PatientList';
import { QuickAction } from '@/components/QuickAction';
import { RecentPatientsTable } from '@/components/RecentPatientsTable';
import { UserProfile } from '@/components/UserProfile';
import {
    obtenerTurnos,
    obtenerPacientes,
    obtenerEstadisticas,
} from '@/modules/fono/services/dataService';
import { Turno, Paciente } from '@/modules/fono/types';
import { DatosFono } from '@/modules/fono/types/fono';

// Función de utilidad para obtener el nombre completo del paciente
const obtenerNombrePaciente = (pacientes: Paciente[], pacienteId: number): string => {
    const paciente = pacientes.find(p => p.id === pacienteId);
    return paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente no encontrado';
};

export default function Dashboard() {
    const [userInfo, setUserInfo] = useState<DatosFono | null>(null);
    const router = useRouter();
    const [stats, setStats] = useState({
        pacientesHoy: 0,
        pacientesTotales: 0,
        pacientesRegulares: 0,
        consultasTotales: 0
    });

    // Función para cargar los datos del usuario desde localStorage
    const loadUserData = async () => {
        if (typeof window !== 'undefined') {
            const sessionData = localStorage.getItem('userSession');
            if (sessionData) {
                const parsedData = JSON.parse(sessionData);
                if (parsedData.perfil === 'FONO') {
                    setUserInfo(parsedData);
                    console.log(parsedData);
                } else {
                    console.log('No es fono');
                    router.push('/login');
                }
            } else {
                console.log('No hay session');
                router.push('/login');
            }
        }
    };

    useEffect(() => {
        loadUserData();
    }, [router]);

    const [pacientesDelDia, setPacientesDelDia] = useState<Array<{
        id: number;
        nombre: string;
        estado: 'actual' | 'pendiente';
        horasRestantes?: number;
    }>>([]);

    const [pacientesRecientes, setPacientesRecientes] = useState<Paciente[]>([]);

    // Cargar datos desde el servicio centralizado
    useEffect(() => {
        const fetchData = async () => {
            if (!userInfo?.FonoId) return;

            const fonoId = Number(userInfo.FonoId);
            if (isNaN(fonoId)) return;

            try {
                const estadisticas = await obtenerEstadisticas(fonoId);
                if (estadisticas) {
                    setStats({
                        pacientesHoy: estadisticas.turnosHoy,
                        pacientesTotales: estadisticas.pacientesTotal ?? 0,
                        pacientesRegulares: estadisticas.pacientesActivos,
                        consultasTotales: estadisticas.turnosTotal ?? 0
                    });
                }

                const turnos = await obtenerTurnos(fonoId);
                const hoy = format(new Date(), 'dd/MM/yyyy');
                const turnosHoy = turnos.filter((t: Turno) => t.fecha === hoy).sort((a: Turno, b: Turno) => {
                    return a.horario.localeCompare(b.horario);
                });

                const horaActual = new Date().getHours();
                const minutosActuales = new Date().getMinutes();

                const todosPacientes = await obtenerPacientes(fonoId);
                const pacientesHoy = turnosHoy.map((turno: Turno) => {
                    const [hora, minutos] = turno.horario.split(':').map(Number);
                    const esActual = hora === horaActual && Math.abs(minutos - minutosActuales) < 30;

                    let horasRestantes = hora - horaActual;
                    if (horasRestantes < 0) horasRestantes = 0;

                    return {
                        id: turno.pacienteId,
                        nombre: obtenerNombrePaciente(todosPacientes, turno.pacienteId),
                        estado: esActual ? 'actual' as const : 'pendiente' as const,
                        horasRestantes: horasRestantes
                    };
                });

                setPacientesDelDia(pacientesHoy);

                const pacientesActivos = todosPacientes
                    .filter((p: Paciente) => p.estado === 'activo')
                    .slice(0, 3);

                setPacientesRecientes(pacientesActivos);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (userInfo?.FonoId) {
            fetchData();
        }
    }, [userInfo?.FonoId]);

    const navegarADetallesPaciente = (id: number) => {
        router.push(`/fono/pacientes/detalles/${id}`);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <div className="text-gray-500">{format(new Date(), "d 'de' MMMM 'del' yyyy", { locale: es })}</div>
            </div>

            {/* Stats + Pacientes del día */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                    title="Hoy Tienes"
                    value={stats.pacientesHoy}
                    subtitle="Pacientes"
                />
                <PatientList
                    patients={pacientesDelDia}
                    onPatientClick={navegarADetallesPaciente}
                />
            </div>

            {/* Acciones rápidas */}
            <div>
                <h2 className="text-lg font-medium text-gray-800 mb-3">Acciones rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <QuickAction
                        icon={Calendar}
                        title="Agregar Turno"
                        description="Programa una nueva cita"
                        href="/fono/turnos/nuevo"
                    />
                    <QuickAction
                        icon={UserPlus}
                        title="Agregar Paciente"
                        description="Registra un nuevo paciente"
                        href="/fono/pacientes/nuevo"
                        iconColor="text-secondary"
                        iconBgColor="bg-secondary/10"
                    />
                </div>
            </div>

            {/* Actividad reciente + Perfil */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-5">
                    <h3 className="font-medium text-gray-800 mb-3">Actividad reciente</h3>
                    <div className="divide-y">
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-gray-700">Turnos de esta semana</span>
                            <span className="font-medium text-primary">8</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-gray-700">Pacientes nuevos este mes</span>
                            <span className="font-medium text-secondary">5</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-gray-700">Sesiones completadas</span>
                            <span className="font-medium text-accent">24</span>
                        </div>
                    </div>
                </div>

                <UserProfile
                    name={userInfo?.Nombre || 'Dr. Apellido'}
                    role="Nombre"
                    stats={{
                        consultas: stats.consultasTotales,
                        pacientes: stats.pacientesTotales,
                        regulares: stats.pacientesRegulares
                    }}
                />
            </div>

            {/* Pacientes Recientes - Full width */}
            <div>
                <RecentPatientsTable
                    patients={pacientesRecientes}
                    onPatientClick={navegarADetallesPaciente}
                />
            </div>
        </div>
    );
}