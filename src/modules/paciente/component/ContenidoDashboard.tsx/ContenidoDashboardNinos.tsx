"use client";

import { DatosPaciente } from '../../types/pacienteLocalStorage';
import { Trophy, Gamepad2, Star, BarChart3, Play } from 'lucide-react';
import { EstadisticasJuegos } from '../DashboardPaciente';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Props {
    userInfo: DatosPaciente | null;
    edad: number;
    estadisticas: EstadisticasJuegos | null;
}

export default function ContenidoDashboardNinos({ userInfo, edad, estadisticas }: Props) {
    const router = useRouter();

    if (!estadisticas) return null;

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header with welcome message and play button */}
            <div className="bg-primary rounded-lg p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">¡Hola {estadisticas.paciente.nombre}!</h1>
                        <p className="text-lg mt-2">¡Vamos a jugar y aprender juntos!</p>
                    </div>
                    <Button
                        onClick={() => router.push('/paciente/juegos')}
                        size="lg"
                        className="text-lg px-8 py-6 flex items-center gap-2"
                    >
                        <Play className="h-6 w-6" />
                        ¡JUGAR!
                    </Button>
                </div>
            </div>

            {/* Game Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        <h2 className="text-xl font-bold text-gray-800">Mi Nivel</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Nivel Actual</span>
                            <span className="text-2xl font-bold text-purple-600">
                                {estadisticas.nivel?.nivelActual || 1}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-purple-600 h-2.5 rounded-full"
                                style={{ width: `${estadisticas.nivel?.progreso || 0}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-500">
                            Experiencia: {estadisticas.paciente.experiencia} puntos
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Star className="h-8 w-8 text-yellow-500" />
                        <h2 className="text-xl font-bold text-gray-800">Mis Logros</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">
                                {estadisticas.estadisticasGenerales.juegosGanados}
                            </p>
                            <p className="text-sm text-gray-600">Juegos Ganados</p>
                        </div>
                        <div className="text-center p-3 bg-pink-50 rounded-lg">
                            <p className="text-2xl font-bold text-pink-600">
                                {estadisticas.estadisticasGenerales.promedioPuntuacion}%
                            </p>
                            <p className="text-sm text-gray-600">Tasa de Éxito</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress by Area Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="h-8 w-8 text-green-500" />
                    <h2 className="text-xl font-bold text-gray-800">Mi Progreso por Área</h2>
                </div>
                <div className="space-y-4">
                    {Object.entries(estadisticas.estadisticasPorArea).map(([area, stats]) => (
                        <div key={area} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">{area}</span>
                                <span className="text-sm text-gray-500">
                                    {stats.ganados} de {stats.total} juegos
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-green-500 h-2.5 rounded-full"
                                    style={{ width: `${(stats.ganados / stats.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Gamepad2 className="h-8 w-8 text-blue-500" />
                    <h2 className="text-xl font-bold text-gray-800">Actividad Reciente</h2>
                </div>
                <div className="space-y-4">
                    {estadisticas.actividadReciente.map((actividad, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">{actividad.juego}</p>
                                <p className="text-sm text-gray-600">
                                    {new Date(actividad.fecha).toLocaleDateString()}
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm ${actividad.estado === 'GANADO'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {actividad.estado === 'GANADO' ? '¡Ganado!' : 'Perdido'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}