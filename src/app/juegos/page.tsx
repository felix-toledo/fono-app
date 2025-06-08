'use client'

import { useEffect, useRef, useState } from 'react';
import GameQuestion from "@/components/juegos/dinamic/GameQuestion";
import AudioRecorder from "@/components/audio/Component";
import FotosHabla from "@/components/juegos/dinamic/FotosHabla";
import OrdenGame from "@/components/juegos/dinamic/OrdenGame";

export default function Juegos() {
    const consigna = "Ordená las palabras!";
    const hasPlayedRef = useRef(false);
    const audioCacheRef = useRef<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const speakText = async (text: string) => {
        try {
            setIsLoading(true);

            // Si ya tenemos el audio en caché, lo reproducimos directamente
            if (audioCacheRef.current) {
                const audio = new Audio(`data:audio/mp3;base64,${audioCacheRef.current}`);
                await audio.play();
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate speech');
            }

            const data = await response.json();
            // Guardamos el audio en caché
            audioCacheRef.current = data.audio;

            const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
            await audio.play();
        } catch (error) {
            console.error('Error playing audio:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!hasPlayedRef.current) {
            speakText(consigna);
            hasPlayedRef.current = true;
        }
    }, []);

    return (
        <div>
            {/* <button
                onClick={() => speakText(consigna)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
                {isLoading ? 'Cargando...' : 'Repetir consigna'}
            </button>
            <div className="flex items-center gap-2 mb-4">

            </div>
            <GameQuestion
                tipo_juego="vocales"
                url_imagen="https://images.pexels.com/photos/145939/pexels-photo-145939.jpeg"
                consigna={consigna}
                respuestas={[
                    {
                        esCorrecta: true,
                        urlImg: "https://images.pexels.com/photos/145939/pexels-photo-145939.jpeg",
                        texto: "A"
                    },
                    {
                        esCorrecta: false,
                        texto: "E"
                    },
                    {
                        esCorrecta: false,
                        urlImg: "https://images.pexels.com/photos/247377/pexels-photo-247377.jpeg",
                        texto: "I"
                    },
                    {
                        esCorrecta: false,
                        urlImg: "https://images.pexels.com/photos/247378/pexels-photo-247378.jpeg",
                        texto: "O"
                    }
                ]}
                onRespuestaSeleccionada={(esCorrecta: boolean) => {
                    console.log(esCorrecta ? "¡Correcto!" : "¡Incorrecto!");
                }}
            />
            <AudioRecorder />
            <FotosHabla
                imagenes={[
                    "https://images.pexels.com/photos/145939/pexels-photo-145939.jpeg",
                ]}
                consigna={'palabra'}
                textoCompleto="Fué como una ráfaga tu amor, me enamoró"
                textoSinCompletar="Fué como una ráfaga tu amorrrrrr"
                palabraACompletar="Me enamoró"
            /> */}
            {/* <OrdenGame
                imagenes={[
                    "https://images.pexels.com/photos/145939/pexels-photo-145939.jpeg",
                ]}
                palabras={[
                    {
                        palabra: "Fué como una ráfaga tu amor, me enamoró",
                        orden: 1
                    },
                    {
                        palabra: "Me enamoró",
                        orden: 2
                    },
                    {
                        palabra: "Fué como una ráfaga tu amorrrrrr",
                        orden: 3
                    },
                    {
                        palabra: "Fué como una ráfaga tu amrrrr",
                        orden: 4
                    },

                ]}
                consigna={consigna}
                onOrdenCompletado={(esCorrecto: boolean) => {
                    console.log(esCorrecto ? "¡Correcto!" : "¡Incorrecto!");
                }}
            /> */}
            <GameQuestion
                tipo_juego="select"
                url_imagen="https://images.unsplash.com/photo-1610832958506-aa56368176cf"
                consigna="Selecciona todas las frutas que veas en la imagen"
                respuestas={[
                    {
                        texto: "Manzana",
                        esCorrecta: true,
                        urlImg: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb"
                    },
                    {
                        texto: "Naranja",
                        esCorrecta: true,
                        urlImg: "https://images.unsplash.com/photo-1547514701-42782101795e"
                    },
                    {
                        texto: "Zanahoria",
                        esCorrecta: false,
                        urlImg: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37"
                    },
                    {
                        texto: "Pera",
                        esCorrecta: true,
                        urlImg: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5"
                    }
                ]}
                onRespuestaSeleccionada={(esCorrecta: boolean) => {
                    console.log(esCorrecta ? "¡Correcto!" : "¡Incorrecto!");
                }}
            />
        </div>
    );
}