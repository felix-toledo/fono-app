import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import { useGameSound } from '@/contexts/SoundContext';
import { FeedbackMessage } from './FeedbackMessage';

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

    const handleFeedbackClose = () => {
        setShowBigFeedback(false);
    };

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
                        className="relative w-full h-64 mb-8 rounded-lg overflow-hidden bg-[#99d4f2]/10"
                        whileHover={{
                            scale: 1.05,
                            rotate: 2
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Image
                            src={url_imagen}
                            alt=""
                            fill
                            className="object-contain p-4"
                        />
                    </motion.div>
                )}

                {/* Consigna con animación */}
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

                {/* Respuestas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {respuestas.map((respuesta, index) => (
                        <motion.button
                            key={index}
                            whileHover={{
                                scale: 1.05,
                                rotate: 2,
                                boxShadow: "0 0 25px rgba(153, 212, 242, 0.3)"
                            }}
                            whileTap={{
                                scale: 0.95
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
                            {respuesta.urlImg && (
                                <div className="relative w-full h-32 mb-2">
                                    <Image
                                        src={respuesta.urlImg}
                                        alt=""
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}
                            <span className="text-lg font-medium block text-center">
                                {respuesta.texto}
                            </span>
                        </motion.button>
                    ))}
                </div>

                {isMultipleChoice && (
                    <motion.div
                        className="mt-6 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.button
                            onClick={handleSubmit}
                            disabled={selectedAnswers.length === 0}
                            className="px-6 py-3 bg-[#99d4f2] text-white rounded-full font-bold hover:bg-[#fec0bb] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Comprobar respuestas
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>

            <AnimatePresence>
                {showBigFeedback && (
                    <FeedbackMessage
                        esCorrecta={selectedAnswers.every(index => respuestas[index].esCorrecta)}
                        onClose={handleFeedbackClose}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default GameQuestion;