import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import { useGameSound } from '@/contexts/SoundContext';

interface Respuesta {
    esCorrecta: boolean;
    urlImg?: string;
    texto: string;
}

interface GameQuestionProps {
    tipo_juego: string;
    url_imagen?: string;
    consigna: string;
    respuestas: Respuesta[];
    onRespuestaSeleccionada: (esCorrecta: boolean) => void;
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

const GameQuestion = ({
    tipo_juego,
    url_imagen,
    consigna,
    respuestas,
    onRespuestaSeleccionada
}: GameQuestionProps) => {
    const { isMuted } = useGameSound();
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showBigFeedback, setShowBigFeedback] = useState(false);
    const isMultipleChoice = tipo_juego === 'select';

    // Update the sound hooks to respect mute state
    const [playCorrect] = useSound('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', {
        onplayerror: () => {
            console.log('Error al reproducir sonido correcto');
        },
        soundEnabled: !isMuted
    });
    const [playWrong] = useSound('https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3', {
        onplayerror: () => {
            console.log('Error al reproducir sonido incorrecto');
        },
        soundEnabled: !isMuted
    });
    const [playClick] = useSound('https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3', {
        onplayerror: () => {
            console.log('Error al reproducir sonido de click');
        },
        soundEnabled: !isMuted
    });

    const handleAnswerClick = (index: number) => {
        if (isMultipleChoice) {
            // For multiple choice, toggle the selection
            setSelectedAnswers(prev => {
                if (prev.includes(index)) {
                    return prev.filter(i => i !== index);
                } else {
                    return [...prev, index];
                }
            });
        } else {
            // For single choice, only allow one selection
            if (selectedAnswers.length > 0) return;
            setSelectedAnswers([index]);
        }

        playClick();

        // Only show feedback for single choice questions
        if (!isMultipleChoice) {
            setTimeout(() => {
                setShowFeedback(true);
                if (respuestas[index].esCorrecta) {
                    playCorrect();
                } else {
                    playWrong();
                }
                onRespuestaSeleccionada(respuestas[index].esCorrecta);

                setTimeout(() => {
                    setShowBigFeedback(true);
                }, 1000);
            }, 500);
        }
    };

    const handleSubmit = () => {
        if (isMultipleChoice && selectedAnswers.length > 0) {
            // For multiple choice, check if all selected answers are correct
            const allCorrect = selectedAnswers.every(index => respuestas[index].esCorrecta);
            const allRequiredCorrect = respuestas
                .filter(r => r.esCorrecta)
                .every((_, index) => selectedAnswers.includes(index));

            setShowFeedback(true);
            if (allCorrect && allRequiredCorrect) {
                playCorrect();
            } else {
                playWrong();
            }
            onRespuestaSeleccionada(allCorrect && allRequiredCorrect);

            setTimeout(() => {
                setShowBigFeedback(true);
            }, 1000);
        }
    };

    console.log(url_imagen);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg"
            >
                {/* Imagen principal con animación */}
                {url_imagen && url_imagen !== '' && url_imagen !== '/placeholder.jpg' && (
                    <motion.div
                        className="relative w-full h-64 mb-6 rounded-lg overflow-hidden"
                        whileHover={{
                            scale: 1.1,
                            rotate: 2
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Image
                            src={url_imagen}
                            alt=""
                            fill
                            className="object-contain"
                        />
                    </motion.div>
                )}

                {/* Consigna con animación */}
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
                    {consigna}
                </motion.h2>

                {/* Respuestas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {respuestas.map((respuesta, index) => (
                        <motion.button
                            key={index}
                            whileHover={{
                                scale: 1.15,
                                rotate: 3,
                                boxShadow: "0 0 25px rgba(254, 192, 187, 0.6)"
                            }}
                            whileTap={{
                                scale: 0.85
                            }}
                            onClick={() => handleAnswerClick(index)}
                            disabled={!isMultipleChoice && selectedAnswers.length > 0}
                            className={`
                                relative p-4 rounded-xl border-2 transition-all
                                ${selectedAnswers.includes(index)
                                    ? respuesta.esCorrecta
                                        ? 'border-[#99d4f2] bg-[#99d4f2]/20'
                                        : 'border-[#fec0bb] bg-[#fec0bb]/20'
                                    : 'border-[#fec0bb] hover:border-[#99d4f2] bg-white'
                                }
                                ${!isMultipleChoice && selectedAnswers.length > 0 && !selectedAnswers.includes(index)
                                    ? 'opacity-50'
                                    : ''
                                }
                            `}
                        >
                            <motion.div
                                className="flex items-center space-x-4"
                                whileHover={{ x: 10 }}
                            >
                                {respuesta.urlImg && (
                                    <motion.div
                                        className="relative w-16 h-16"
                                        whileHover={{
                                            rotate: 360,
                                            scale: 1.3
                                        }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Image
                                            src={respuesta.urlImg}
                                            alt={`Respuesta ${index + 1}`}
                                            fill
                                            className="object-contain"
                                        />
                                    </motion.div>
                                )}
                                <motion.span
                                    className="text-lg font-medium text-gray-700"
                                    whileHover={{ scale: 1.2 }}
                                >
                                    {respuesta.texto}
                                </motion.span>
                            </motion.div>
                        </motion.button>
                    ))}
                </div>

                {isMultipleChoice && (
                    <motion.button
                        className="mt-6 bg-[#99d4f2] text-white px-6 py-3 rounded-full text-lg font-bold hover:bg-[#fec0bb] transition-colors mx-auto block"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSubmit}
                        disabled={selectedAnswers.length === 0}
                    >
                        Verificar Respuestas
                    </motion.button>
                )}
            </motion.div>

            <AnimatePresence>
                {showBigFeedback && (
                    <FeedbackMessage
                        esCorrecta={isMultipleChoice
                            ? selectedAnswers.every(index => respuestas[index].esCorrecta) &&
                            respuestas.filter(r => r.esCorrecta).every((_, index) => selectedAnswers.includes(index))
                            : respuestas[selectedAnswers[0]].esCorrecta
                        }
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default GameQuestion;