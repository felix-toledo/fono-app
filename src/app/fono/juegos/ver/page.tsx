'use client';

import { useEffect, useState } from 'react';
import GamePreview from '@/components/juegos/GamePreview';

interface CampoJuego {
    id: string;
    tipoCampo: string;
    titulo: string;
    consigna: string;
    rptaValida: string;
    opciones: string | null;
    imagenConsigna: string | null;
    audio: string | null;
    ayuda: string | null;
    rama: string;
}

interface Juego {
    id: string;
    titulo: string;
    rama: string;
    rangoEdad: string;
    descripcion: string;
    nivelDificultad: string;
    experienciaDada: string;
    estado: boolean;
    fechaCreado: string;
    tipoJuego: string;
    juegoCampoJs: {
        campoJuego: CampoJuego;
    }[];
}

export default function VerJuegosPage() {
    const [juegos, setJuegos] = useState<Juego[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtros, setFiltros] = useState({
        rama: '',
        rangoEdad: '',
        tipoJuego: '',
        nivelDificultad: '',
        estado: ''
    });
    const [juegoSeleccionado, setJuegoSeleccionado] = useState<Juego | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        const fetchJuegos = async () => {
            try {
                const response = await fetch('/api/juegos');
                const data = await response.json();
                if (data.success) {
                    setJuegos(data.juegos);
                } else {
                    setError('Error al cargar los juegos');
                }
            } catch (err) {
                setError('Error al cargar los juegos');
            } finally {
                setLoading(false);
            }
        };

        fetchJuegos();
    }, []);

    const juegosFiltrados = juegos.filter(juego => {
        return (
            (!filtros.rama || juego.rama === filtros.rama) &&
            (!filtros.rangoEdad || juego.rangoEdad === filtros.rangoEdad) &&
            (!filtros.tipoJuego || juego.tipoJuego === filtros.tipoJuego) &&
            (!filtros.nivelDificultad || juego.nivelDificultad === filtros.nivelDificultad) &&
            (!filtros.estado || (juego.estado ? 'ACTIVO' : 'INACTIVO') === filtros.estado)
        );
    });

    const prepareGameData = (juego: Juego) => {
        const campoJuego = juego.juegoCampoJs[0]?.campoJuego;
        if (!campoJuego) return null;


        // Mapear según el tipo de juego
        switch (juego.tipoJuego) {
            case 'REPETIR':
                return {
                    textoRepetir: campoJuego.rptaValida,
                    consignaEmociones: campoJuego.consigna,
                    imagenRepetir: campoJuego.imagenConsigna ? JSON.parse(campoJuego.imagenConsigna).url : null
                };

            case 'HABLAR':
                return {
                    textoCompleto: campoJuego.rptaValida,
                    textoIncompleto: campoJuego.consigna,
                    palabraCompletar: campoJuego.rptaValida,
                    consignaEmociones: campoJuego.consigna,
                    imagenesHablar: campoJuego.imagenConsigna ? [JSON.parse(campoJuego.imagenConsigna).url] : []
                };

            case 'ORDEN':
                return {
                    palabrasOrdenadas: campoJuego.opciones ? JSON.parse(campoJuego.opciones) : [],
                    consignaOrden: campoJuego.consigna,
                    imagenesOrden: campoJuego.imagenConsigna ? [JSON.parse(campoJuego.imagenConsigna).url] : []
                };

            case 'COMPLETAR':
                return {
                    textoCompletoCompletar: campoJuego.rptaValida,
                    textoIncompletoCompletar: campoJuego.consigna,
                    opcionesCompletar: campoJuego.opciones ? JSON.parse(campoJuego.opciones) : [],
                    imagenesCompletar: campoJuego.imagenConsigna ? [JSON.parse(campoJuego.imagenConsigna).url] : []
                };

            case 'ROLES':
                const opciones = campoJuego.opciones ? JSON.parse(campoJuego.opciones) : [];
                const respuestaValida = campoJuego.rptaValida ? JSON.parse(campoJuego.rptaValida) : [];

                return {
                    preguntaPrincipal: campoJuego.consigna,
                    opcionesRoles: opciones.map((opt: string) => ({
                        text: opt,
                        isCorrect: respuestaValida.includes(opt)
                    })),
                    imagenRoles: campoJuego.imagenConsigna ? JSON.parse(campoJuego.imagenConsigna).url : null
                };

            case 'EMOCIONES':
                return {
                    consignaEmociones: campoJuego.consigna,
                    opcionesEmociones: campoJuego.opciones ? JSON.parse(campoJuego.opciones) : [],
                    imagenEmociones: campoJuego.imagenConsigna ? JSON.parse(campoJuego.imagenConsigna).url : null
                };

            default:
                return null;
        }
    };

    const handlePreview = (juego: Juego) => {
        const gameData = prepareGameData(juego);
        if (gameData) {
            setJuegoSeleccionado(juego);
            setShowPreview(true);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    // Obtener valores únicos para los filtros
    const ramas = Array.from(new Set(juegos.map(j => j.rama)));
    const rangosEdad = Array.from(new Set(juegos.map(j => j.rangoEdad)));
    const tiposJuego = Array.from(new Set(juegos.map(j => j.tipoJuego)));
    const nivelesDificultad = Array.from(new Set(juegos.map(j => j.nivelDificultad)));
    const estados = ['ACTIVO', 'INACTIVO'];


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Juegos Disponibles</h1>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h2 className="text-lg font-semibold mb-4">Filtros</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        className="border rounded p-2"
                        value={filtros.rama}
                        onChange={(e) => setFiltros(prev => ({ ...prev, rama: e.target.value }))}
                    >
                        <option value="">Todas las ramas</option>
                        {ramas.map(rama => (
                            <option key={rama} value={rama}>{rama}</option>
                        ))}
                    </select>

                    <select
                        className="border rounded p-2"
                        value={filtros.rangoEdad}
                        onChange={(e) => setFiltros(prev => ({ ...prev, rangoEdad: e.target.value }))}
                    >
                        <option value="">Todos los rangos</option>
                        {rangosEdad.map(rango => (
                            <option key={rango} value={rango}>{rango}</option>
                        ))}
                    </select>

                    <select
                        className="border rounded p-2"
                        value={filtros.tipoJuego}
                        onChange={(e) => setFiltros(prev => ({ ...prev, tipoJuego: e.target.value }))}
                    >
                        <option value="">Todos los tipos</option>
                        {tiposJuego.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                    </select>

                    <select
                        className="border rounded p-2"
                        value={filtros.nivelDificultad}
                        onChange={(e) => setFiltros(prev => ({ ...prev, nivelDificultad: e.target.value }))}
                    >
                        <option value="">Todos los niveles</option>
                        {nivelesDificultad.map(nivel => (
                            <option key={nivel} value={nivel}>{nivel}</option>
                        ))}
                    </select>

                    <select
                        className="border rounded p-2"
                        value={filtros.estado}
                        onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                    >
                        <option value="">Todos los estados</option>
                        {estados.map(estado => (
                            <option key={estado} value={estado}>{estado}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Lista de juegos */}
            <div className="grid gap-4">
                {juegosFiltrados.map((juego) => (
                    <div key={juego.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">{juego.titulo}</h2>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                                    {juego.rama}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                                    {juego.rangoEdad}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                                    {juego.nivelDificultad}
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-4">{juego.descripcion}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                                Tipo: {juego.tipoJuego}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                                XP: {juego.experienciaDada}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-sm ${juego.estado
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {juego.estado ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Campos del Juego:</h3>
                            <div className="grid gap-2">
                                {juego.juegoCampoJs.map(({ campoJuego }) => (
                                    <div key={campoJuego.id} className="p-3 bg-gray-50 rounded">
                                        <p className="font-medium">{campoJuego.titulo}</p>
                                        <p className="text-sm text-gray-600">{campoJuego.consigna}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => handlePreview(juego)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Ver Vista Previa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Vista Previa */}
            {juegoSeleccionado && (() => {
                const gameData = prepareGameData(juegoSeleccionado);
                return (
                    <GamePreview
                        isOpen={showPreview}
                        onClose={() => setShowPreview(false)}
                        gameType={juegoSeleccionado.tipoJuego}
                        gameData={gameData}
                    />
                );
            })()}
        </div>
    );
}
