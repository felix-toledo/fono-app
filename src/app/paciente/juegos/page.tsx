'use client';

import { useEffect, useState } from 'react';
import { usePaciente } from '@/contexts/PacienteContext';
import { useRouter } from 'next/navigation';
import { TipoRama } from '@prisma/client';

interface GameStats {
    juegosJugados: number;
    nivelActual: number;
    areasComprometidas: TipoRama | null;
}

export default function Juegos() {
    const { getPacienteId } = usePaciente();
    const router = useRouter();
    const [stats, setStats] = useState<GameStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const pacienteId = getPacienteId();
            if (!pacienteId) return;

            try {
                const response = await fetch(`/api/paciente/juegos/datos?pacienteId=${pacienteId}`);
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Error fetching game stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [getPacienteId]);

    const handlePlayClick = () => {
        router.push('/paciente/juegos/jugar');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Mis Juegos</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Juegos Jugados</h3>
                        <p className="text-3xl font-bold text-primary">{stats?.juegosJugados || 0}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Nivel Actual</h3>
                        <p className="text-3xl font-bold text-primary">{stats?.nivelActual || 1}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Área de Enfoque</h3>
                        <p className="text-xl font-bold text-primary">
                            {stats?.areasComprometidas ?
                                stats.areasComprometidas.replace(/_/g, ' ') :
                                'No especificada'}
                        </p>
                    </div>
                </div>

                {/* Play Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handlePlayClick}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-6 px-12 rounded-full text-2xl shadow-lg transform transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    >
                        ¡JUGAR AHORA!
                    </button>
                </div>
            </div>
        </div>
    );
} 