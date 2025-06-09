'use client';

import { useEffect, useState } from 'react';
import { usePaciente } from '@/contexts/PacienteContext';
import GameQuestion from '@/components/juegos/dinamic/GameQuestion';
import FotosHabla from '@/components/juegos/dinamic/FotosHabla';
import OrdenGame from '@/components/juegos/dinamic/OrdenGame';
import AnimalFinderGame from '@/components/juegos/AnimalFinderGame';
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
                const response = await fetch(`/api/paciente/juegos/filtrados?pacienteId=${pacienteId}`);
                const data = await response.json();

                if (data.success) {
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


        // Mapear según el tipo de juego
        switch (juego.tipoJuego) {
            case 'ROLES':
                const opciones = campoJuego.opciones ? JSON.parse(campoJuego.opciones) : [];
                const respuestaValida = campoJuego.rptaValida ? JSON.parse(campoJuego.rptaValida) : [];


                return {
                    preguntaPrincipal: campoJuego.consigna,
                    opcionesRoles: opciones.map((opt: any) => ({
                        text: opt.text,
                        isCorrect: respuestaValida.includes(opt.text),
                        urlImg: opt.urlImg
                    })),
                    imagenRoles: campoJuego.imagenConsigna ? JSON.parse(campoJuego.imagenConsigna).url : null
                };

            case 'REPETIR':
                const textoRepetir = campoJuego.rptaValida ?
                    (typeof campoJuego.rptaValida === 'string' && campoJuego.rptaValida.startsWith('{') ?
                        JSON.parse(campoJuego.rptaValida).texto :
                        campoJuego.rptaValida) : '';
                return {
                    textoRepetir,
                    consignaEmociones: campoJuego.consigna,
                    imagenRepetir: campoJuego.imagenConsigna ? JSON.parse(campoJuego.imagenConsigna).url : null
                };

            case 'HABLAR':
                return {
                    textoCompleto: campoJuego.rptaValida,
                    textoIncompleto: campoJuego.consigna,
                    palabraCompletar: campoJuego.rptaValida,
                    consignaEmociones: campoJuego.consigna,
                    imagenesHablar: campoJuego.opciones ? JSON.parse(campoJuego.opciones) : []
                };

            case 'ORDEN':
                return {
                    palabrasOrdenadas: campoJuego.rptaValida ? JSON.parse(campoJuego.rptaValida) : [],
                    consignaOrden: campoJuego.consigna,
                    imagenesOrden: campoJuego.opciones ? JSON.parse(campoJuego.opciones) : []
                };

            case 'COMPLETAR':
                return {
                    textoCompletoCompletar: campoJuego.rptaValida,
                    textoIncompletoCompletar: campoJuego.consigna,
                    opcionesCompletar: campoJuego.opciones ? JSON.parse(campoJuego.opciones) : [],
                    imagenesCompletar: campoJuego.imagenConsigna ? [JSON.parse(campoJuego.imagenConsigna).url] : []
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

        console.log('Estado recibido en handleGameComplete:', estado);
        console.log('Tipo de juego:', juegoActual.tipoJuego);

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
                    estado // Asegurarnos de que este es el estado correcto
                })
            });

            const data = await response.json();
            if (!data.success) {
                console.error('Error al guardar la instancia:', data.error);
                return;
            }

            console.log('Respuesta de la API:', data);

            // Esperar 5 segundos antes de pasar al siguiente juego
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Para juegos de tipo REPETIR, HABLAR, y ORDEN, siempre pasar al siguiente juego
            if (
                juegoActual.tipoJuego === 'REPETIR' ||
                juegoActual.tipoJuego === 'HABLAR' ||
                juegoActual.tipoJuego === 'ORDEN' ||
                juegoActual.tipoJuego === 'COMPLETAR' ||
                juegoActual.tipoJuego === 'EMOCIONES' ||
                juegoActual.tipoJuego === 'ROLES'
            ) {
                const nextIndex = juegoActualIndex + 1;
                if (nextIndex < juegos.length) {
                    setJuegoActualIndex(nextIndex);
                    setJuegoActual(juegos[nextIndex]);
                    setGameCompleted(false);
                } else {
                    setShowStartButton(true);
                    setJuegoActual(null);
                    setJuegoActualIndex(0);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const renderGame = () => {
        if (!juegoActual) return null;

        // Special case for safari game
        if (juegoActual.tipoJuego === 'EMOCIONES' &&
            juegoActual.rama === 'Semantica' &&
            juegoActual.titulo.toLowerCase() === 'safari') {
            return <AnimalFinderGame onGameComplete={handleGameComplete} />;
        }

        const gameData = prepareGameData(juegoActual);
        if (!gameData) return null;

        switch (juegoActual.tipoJuego) {
            case 'ROLES':
                return (
                    <GameQuestion
                        tipo_juego="select"
                        url_imagen={gameData.imagenRoles || '/placeholder.jpg'}
                        consigna={gameData.preguntaPrincipal || ''}
                        respuestas={gameData.opcionesRoles?.map((opt: any) => ({
                            texto: opt.text,
                            esCorrecta: opt.isCorrect,
                            urlImg: opt.urlImg
                        })) || []}
                        onRespuestaSeleccionada={(esCorrecta) => {
                            handleGameComplete(
                                esCorrecta ? 'GANADO' : 'PERDIDO',
                                esCorrecta ? juegoActual.experienciaDada : undefined
                            );
                        }}
                    />
                );

            case 'REPETIR':
                return (
                    <FotosHabla
                        imagenes={gameData.imagenRepetir ? [gameData.imagenRepetir] : []}
                        consigna={gameData.consignaEmociones || ''}
                        textoCompleto={gameData.textoRepetir || ''}
                        textoSinCompletar={gameData.textoRepetir || ''}
                        palabraACompletar={gameData.textoRepetir || ''}
                        onGameComplete={(estado) => {
                            handleGameComplete(
                                estado as 'GANADO' | 'PERDIDO' | 'ERROR',
                                estado === 'GANADO' ? juegoActual.experienciaDada : undefined
                            );
                        }}
                        allowRetry={false}
                    />
                );

            case 'HABLAR':
                return (
                    <FotosHabla
                        imagenes={gameData.imagenesHablar || []}
                        consigna={gameData.consignaEmociones || ''}
                        textoCompleto={gameData.textoCompleto || ''}
                        textoSinCompletar={gameData.textoIncompleto || ''}
                        palabraACompletar={gameData.palabraCompletar || ''}
                        onGameComplete={(estado) => {
                            handleGameComplete(
                                estado as 'GANADO' | 'PERDIDO' | 'ERROR',
                                estado === 'GANADO' ? juegoActual.experienciaDada : undefined
                            );
                        }}
                        allowRetry={false}
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

    if (!loading && juegos.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <h1 className="text-2xl font-bold mb-8">¡Ya no hay más juegos disponibles para ti!</h1>
                <p className="text-lg text-gray-600">Volvé más tarde para seguir</p>
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