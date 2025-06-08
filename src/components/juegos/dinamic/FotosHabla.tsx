import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import AudioRecorder from '@/components/audio/Component';
import { FeedbackMessage } from './FeedbackMessage';

function normalizarTexto(texto: string) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9áéíóúüñ\s]/gi, '')
        .trim();
}

interface FotosHablaProps {
    imagenes: string[];
    consigna: string;
    textoCompleto: string;
    textoSinCompletar: string;
    palabraACompletar: string;
    onGameComplete: (estado: 'GANADO' | 'PERDIDO') => void;
    allowRetry?: boolean;
}

export default function FotosHabla({ imagenes, consigna, textoCompleto, textoSinCompletar, palabraACompletar, onGameComplete, allowRetry = true }: FotosHablaProps) {
    const [transcripcion, setTranscripcion] = useState('');
    const [showBigFeedback, setShowBigFeedback] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioCacheRef = useRef<{ [key: string]: string }>({});

    // Reset state when game changes
    useEffect(() => {
        const resetState = () => {
            setTranscripcion('');
            setShowBigFeedback(false);
            setIsLoading(false);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
        resetState();
        return () => resetState();
    }, [imagenes, consigna, textoCompleto, textoSinCompletar, palabraACompletar]);

    // Lógica para modo palabra única
    const esPalabraUnica =
        imagenes.length === 1 &&
        textoCompleto.trim() === palabraACompletar.trim() &&
        (!textoSinCompletar || textoSinCompletar.trim() === '');

    // Consigna y texto a leer dinámicos
    const consignaMostrar = esPalabraUnica
        ? '¡Repetí la palabra que escuchás!'
        : consigna;
    const textoALeer = esPalabraUnica
        ? palabraACompletar
        : textoSinCompletar;

    const handleTranscripcion = (texto: string) => {
        setTranscripcion(texto);
        const textoNormalizado = normalizarTexto(texto);
        const palabraNormalizada = normalizarTexto(palabraACompletar);
        const esCorrecto = textoNormalizado === palabraNormalizada;

        console.log('Texto normalizado:', textoNormalizado);
        console.log('Palabra normalizada:', palabraNormalizada);
        console.log('¿Es correcto?:', esCorrecto);

        // Llamamos a onGameComplete con el estado correcto
        const estadoFinal = esCorrecto ? 'GANADO' : 'PERDIDO';
        console.log('Estado que se enviará a onGameComplete:', estadoFinal);
        onGameComplete(estadoFinal);

        // Mostramos el feedback
        setShowBigFeedback(true);
    };

    const reproducirTexto = async () => {
        setIsLoading(true);
        try {
            // Si ya está en cache, reproducir directamente
            if (audioCacheRef.current[textoALeer]) {
                const audio = new Audio(`data:audio/mp3;base64,${audioCacheRef.current[textoALeer]}`);
                audioRef.current = audio;
                await audio.play();
                return;
            }
            // Si no, pedir al backend y guardar en cache
            const response = await fetch('/api/speak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textoALeer }),
            });
            const data = await response.json();
            audioCacheRef.current[textoALeer] = data.audio;
            const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
            audioRef.current = audio;
            await audio.play();
        } catch (e) {
            // Manejar error
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeedbackClose = () => {
        setShowBigFeedback(false);
        setTranscripcion('');
    };

    return (
        <motion.div
            key={`${textoCompleto}-${textoSinCompletar}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg"
        >
            <motion.h2
                className="text-2xl font-bold text-center mb-8 text-gray-800"
                animate={{
                    y: [0, -5, 0]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {consignaMostrar}
            </motion.h2>

            <div className="flex gap-6 justify-center mb-8">
                {imagenes.map((img, i) => (
                    <motion.div
                        key={i}
                        className="relative w-32 h-32"
                        whileHover={{ scale: 1.1, rotate: 2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Image
                            src={img}
                            alt={`Imagen ${i + 1}`}
                            fill
                            className="object-contain rounded-lg shadow-md"
                        />
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="text-xl text-center font-semibold mb-8 bg-[#99d4f2]/10 p-4 rounded-lg"
                animate={{
                    scale: [1, 1.02, 1]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {textoCompleto}
            </motion.div>

            <div className="flex flex-col items-center gap-4">
                <motion.div
                    className="text-xl font-bold text-gray-700"
                    animate={{
                        y: [0, -5, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    Escucha y cumplí la consigna:
                </motion.div>

                <motion.button
                    onClick={reproducirTexto}
                    disabled={isLoading}
                    className="px-6 py-3 bg-[#99d4f2] text-white rounded-full font-bold hover:bg-[#fec0bb] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isLoading ? 'Cargando...' : '🎵 Escuchar texto'}
                </motion.button>

                <motion.div
                    className="text-lg mt-2 bg-[#fec0bb]/10 p-4 rounded-lg"
                    animate={{
                        scale: [1, 1.02, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {textoALeer} <span className="font-bold text-[#99d4f2]">...?</span>
                </motion.div>
            </div>

            <div className="mt-8">
                <AudioRecorder
                    onTranscripcion={handleTranscripcion}
                    modoPalabraUnica={true}
                />
            </div>

            <AnimatePresence>
                {showBigFeedback && (
                    <FeedbackMessage
                        esCorrecta={normalizarTexto(transcripcion) === normalizarTexto(palabraACompletar)}
                        onClose={handleFeedbackClose}
                    />
                )}
            </AnimatePresence>

            {transcripcion && !showBigFeedback && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-gray-600 mt-4 bg-gray-50 p-4 rounded-lg"
                >
                    Tu respuesta: <span className="font-bold text-[#99d4f2]">{transcripcion}</span>
                </motion.div>
            )}

            <div className="mt-8">
                <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-[#99d4f2] text-white rounded-full font-bold hover:bg-[#fec0bb] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {resultado === 'correcto' ? '¡Correcto! Continuar' : '¡Incorrecto! Intentar de nuevo'}
                </button>
            </div>
        </motion.div>
    );
}
