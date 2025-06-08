import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import { useGameSound } from '@/contexts/SoundContext';


interface PalabraOrden {
    palabra: string;
    orden: number;
}

interface OrdenGameProps {
    imagenes: string[];
    palabras: { palabra: string; orden: number }[];
    consigna: string;
    onOrdenCompletado: (esCorrecta: boolean) => void;
}

const FeedbackMessage = ({ esCorrecta }: { esCorrecta: boolean }) => {
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
        >
            <motion.div
                className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <motion.div
                    className="text-6xl mb-4"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                >
                    {esCorrecta ? "🎉" : "💫"}
                </motion.div>
                <motion.h2
                    className="text-3xl font-bold mb-4"
                    animate={{
                        color: esCorrecta ? ["#99d4f2", "#fec0bb", "#99d4f2"] : ["#fec0bb", "#99d4f2", "#fec0bb"]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity
                    }}
                >
                    {esCorrecta ? "¡Excelente!" : "¡Casi lo logras!"}
                </motion.h2>
                <motion.p
                    className="text-xl mb-6"
                    animate={{
                        y: [0, -5, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {esCorrecta
                        ? "¡Sigue así, lo estás haciendo genial!"
                        : "No te rindas, ¡inténtalo de nuevo!"}
                </motion.p>
                <motion.button
                    className="bg-[#99d4f2] text-white px-6 py-3 rounded-full text-lg font-bold hover:bg-[#fec0bb] transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => window.location.reload()}
                >
                    ¡Jugar de nuevo!
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

const OrdenGame: React.FC<OrdenGameProps> = ({
    imagenes,
    palabras,
    consigna,
    onOrdenCompletado
}) => {
    const { isMuted } = useGameSound();
    const [ordenadoPalabras, setOrdenadoPalabras] = useState<PalabraOrden[]>(palabras);
    const [seleccionActual, setSeleccionActual] = useState<number>(1);
    const [ordenSeleccionado, setOrdenSeleccionado] = useState<PalabraOrden[]>([]);
    const [showBigFeedback, setShowBigFeedback] = useState(false);

    useEffect(() => {
        const shuffleArray = (array: PalabraOrden[]) => {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        };

        setOrdenadoPalabras(shuffleArray(palabras));
    }, []);

    const [playCorrect] = useSound('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', {
        soundEnabled: !isMuted
    });
    const [playWrong] = useSound('https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3', {
        soundEnabled: !isMuted
    });

    const handlePalabraClick = (palabra: PalabraOrden) => {
        if (ordenSeleccionado.some(p => p.palabra === palabra.palabra)) return;

        const nuevoOrden = [...ordenSeleccionado, palabra];
        setOrdenSeleccionado(nuevoOrden);
        setSeleccionActual(prev => prev + 1);

        if (nuevoOrden.length === palabras.length) {
            const esCorrecto = nuevoOrden.every((p, index) => p.orden === index + 1);
            if (esCorrecto) {
                playCorrect();
            } else {
                playWrong();
            }
            onOrdenCompletado(esCorrecto);
            setShowBigFeedback(true);
        }
    };

    const handleSubmit = () => {
        const esCorrecta = ordenSeleccionado.every((palabra, index) =>
            palabra.orden === index + 1
        );
        onOrdenCompletado(esCorrecta);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg"
            >
                <motion.h2
                    className="text-2xl font-bold text-center mb-8 text-gray-800 bg-[#fec0bb]/10 p-4 rounded-lg"
                    animate={{
                        y: [0, -5, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {consigna}
                </motion.h2>

                <div className={`grid ${imagenes.length > 0 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-8`}>
                    {/* Imágenes */}
                    {imagenes.length > 0 && (
                        <div className="space-y-6">
                            {imagenes.map((img, index) => (
                                <motion.div
                                    key={index}
                                    className="relative w-full h-48 rounded-lg overflow-hidden bg-[#99d4f2]/10"
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Image
                                        src={img}
                                        alt={`Imagen ${index + 1}`}
                                        fill
                                        className="object-contain p-4"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Palabras seleccionables */}
                    <div className={`space-y-6 ${imagenes.length === 0 ? 'max-w-2xl mx-auto w-full' : ''}`}>
                        <motion.div
                            className="text-center mb-6 bg-[#fec0bb]/10 p-4 rounded-lg"
                            animate={{
                                scale: [1, 1.02, 1]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <span className="text-xl font-medium text-gray-700">
                                Selecciona la palabra {seleccionActual} de {palabras.length}
                            </span>
                        </motion.div>
                        <div className="grid gap-4">
                            {ordenadoPalabras.map((palabra) => {
                                const yaSeleccionada = ordenSeleccionado.some(p => p.palabra === palabra.palabra);
                                return (
                                    <motion.button
                                        key={palabra.palabra}
                                        onClick={() => handlePalabraClick(palabra)}
                                        disabled={yaSeleccionada}
                                        className={`
                                            p-4 rounded-xl border-2 transition-all
                                            ${yaSeleccionada
                                                ? 'bg-[#99d4f2]/20 border-[#99d4f2] text-[#99d4f2]'
                                                : 'bg-white border-[#fec0bb] hover:border-[#99d4f2] hover:shadow-lg'
                                            }
                                        `}
                                        whileHover={{ scale: yaSeleccionada ? 1 : 1.05, rotate: yaSeleccionada ? 0 : 2 }}
                                        whileTap={{ scale: yaSeleccionada ? 1 : 0.95 }}
                                    >
                                        <span className="text-lg font-medium block text-center">
                                            {palabra.palabra}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {showBigFeedback && (
                    <FeedbackMessage
                        esCorrecta={ordenSeleccionado.every((palabra, index) => palabra.orden === index + 1)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default OrdenGame;
