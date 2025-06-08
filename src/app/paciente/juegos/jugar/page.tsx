'use client';

import { useEffect, useState } from 'react';
import { usePaciente } from '@/contexts/PacienteContext';
import GameQuestion from '@/components/juegos/dinamic/GameQuestion';
import FotosHabla from '@/components/juegos/dinamic/FotosHabla';
import OrdenGame from '@/components/juegos/dinamic/OrdenGame';
import { SoundProvider } from '@/contexts/SoundContext';

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
        campoJuego: {
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
        };
    }[];
}

export default function Jugar() {
    const { getPacienteId } = usePaciente();
    const [juegos, setJuegos] = useState<Juego[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtros, setFiltros] = useState<any>(null);
    const [showStartButton, setShowStartButton] = useState(true);
    const [juegoActual, setJuegoActual] = useState<Juego | null>(null);
    const [juegoActualIndex, setJuegoActualIndex] = useState(0);
    const [gameCompleted, setGameCompleted] = useState(false);

    useEffect(() => {
        const fetchJuegos = async () => {
            try {
                const pacienteId = getPacienteId();
                if (!pacienteId) {
                    setError('No se encontró el ID del paciente');
                    return;
                }

                // Fetch filtered games
                console.log('pacienteId', pacienteId)
                const response = await fetch(`/api/paciente/juegos/filtrados?pacienteId=${pacienteId}`);
                const data = await response.json();

                if (data.success) {
                    console.log('Filtros aplicados:', data.filtros);
                    console.log('Juegos filtrados:', data.juegos);
                    setJuegos(data.juegos);
                    setFiltros(data.filtros);
                } else {
                    setError('Error al cargar los juegos');
                }
            } catch (err) {
                console.error('Error:', err);
                setError('Error al cargar los datos');
            } finally {
                setLoading(false);
            }
        };

        fetchJuegos();
    }, [getPacienteId]);

    const prepareGameData = (juego: Juego) => {
        const campoJuego = juego.juegoCampoJs[0]?.campoJuego;
        if (!campoJuego) return null;

        console.log('Preparando datos para juego:', juego.tipoJuego);
        console.log('Campo Juego:', campoJuego);

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
                console.log('Opciones parseadas:', opciones);
                console.log('Respuesta válida parseada:', respuestaValida);

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

    const handleStartGame = () => {
        if (juegos.length > 0) {
            setJuegoActual(juegos[0]);
            setShowStartButton(false);
        }
    };

    const handleGameComplete = async (estado: 'GANADO' | 'PERDIDO' | 'ERROR', expGanada?: string) => {
        if (!juegoActual) return;

        try {
            const pacienteId = getPacienteId();
            if (!pacienteId) {
                console.error('No se encontró el ID del paciente');
                return;
            }

            // Save game instance
            const response = await fetch('/api/paciente/juegos/instancia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pacienteId,
                    juegoId: juegoActual.id,
                    expGanada,
                    estado
                })
            });

            const data = await response.json();
            if (!data.success) {
                console.error('Error al guardar la instancia:', data.error);
            }

            // Move to next game if available
            const nextIndex = juegoActualIndex + 1;
            if (nextIndex < juegos.length) {
                setJuegoActualIndex(nextIndex);
                setJuegoActual(juegos[nextIndex]);
                setGameCompleted(false);
            } else {
                // All games completed
                setShowStartButton(true);
                setJuegoActual(null);
                setJuegoActualIndex(0);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const renderGame = () => {
        if (!juegoActual) return null;

        const gameData = prepareGameData(juegoActual);
        if (!gameData) return null;

        switch (juegoActual.tipoJuego) {
            case 'ROLES':
            case 'EMOCIONES':
                return (
                    <GameQuestion
                        tipo_juego="select"
                        url_imagen={gameData.imagenRoles || gameData.imagenEmociones || '/placeholder.jpg'}
                        consigna={gameData.preguntaPrincipal || gameData.consignaEmociones || ''}
                        respuestas={(gameData.opcionesRoles || gameData.opcionesEmociones || []).map((opt: any) => ({
                            texto: opt.text || opt,
                            esCorrecta: opt.isCorrect || false
                        }))}
                        onRespuestaSeleccionada={(esCorrecta) => {
                            handleGameComplete(
                                esCorrecta ? 'GANADO' : 'PERDIDO',
                                esCorrecta ? juegoActual.experienciaDada : undefined
                            );
                        }}
                    />
                );

            case 'REPETIR':
            case 'HABLAR':
                return (
                    <FotosHabla
                        imagenes={gameData.imagenRepetir ? [gameData.imagenRepetir] : gameData.imagenesHablar || []}
                        consigna={gameData.consignaEmociones || ''}
                        textoCompleto={gameData.textoCompleto || gameData.textoRepetir || ''}
                        textoSinCompletar={gameData.textoIncompleto || gameData.textoRepetir || ''}
                        palabraACompletar={gameData.palabraCompletar || gameData.textoRepetir || ''}
                        onGameComplete={(esCorrecta) => {
                            handleGameComplete(
                                esCorrecta ? 'GANADO' : 'PERDIDO',
                                esCorrecta ? juegoActual.experienciaDada : undefined
                            );
                        }}
                    />
                );

            case 'ORDEN':
                return (
                    <OrdenGame
                        imagenes={gameData.imagenesOrden || []}
                        palabras={gameData.palabrasOrdenadas?.map((palabra: string, index: number) => ({
                            palabra,
                            orden: index + 1
                        })) || []}
                        consigna={gameData.consignaOrden || ''}
                        onOrdenCompletado={(esCorrecta) => {
                            handleGameComplete(
                                esCorrecta ? 'GANADO' : 'PERDIDO',
                                esCorrecta ? juegoActual.experienciaDada : undefined
                            );
                        }}
                    />
                );

            case 'COMPLETAR':
                return (
                    <GameQuestion
                        tipo_juego="select"
                        url_imagen={gameData.imagenesCompletar?.[0] || '/placeholder.jpg'}
                        consigna={gameData.textoIncompletoCompletar || ''}
                        respuestas={gameData.opcionesCompletar?.map((opt: string) => ({
                            texto: opt,
                            esCorrecta: opt === gameData.textoCompletoCompletar
                        })) || []}
                        onRespuestaSeleccionada={(esCorrecta) => {
                            handleGameComplete(
                                esCorrecta ? 'GANADO' : 'PERDIDO',
                                esCorrecta ? juegoActual.experienciaDada : undefined
                            );
                        }}
                    />
                );

            default:
                return <div>No hay vista previa disponible para este tipo de juego</div>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                Cargando...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                {error}
            </div>
        );
    }

    if (showStartButton) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <h1 className="text-2xl font-bold mb-8">¡Bienvenido a los juegos!</h1>
                <button
                    onClick={handleStartGame}
                    className="px-8 py-4 bg-primary text-white rounded-lg text-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                    ¿Estás listo para jugar?
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <SoundProvider>
                {renderGame()}
            </SoundProvider>
        </div>
    );
} 