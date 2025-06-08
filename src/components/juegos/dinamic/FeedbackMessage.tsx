import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface FeedbackMessageProps {
    esCorrecta: boolean;
    onClose?: () => void;
}

const getMotivationalMessage = (isCorrect: boolean) => {
    const correctMessages = [
        "¡Excelente trabajo!",
        "¡Lo hiciste muy bien!",
        "¡Sigue así!",
        "¡Eres un campeón!",
        "¡Increíble desempeño!",
        "¡Perfecto!",
        "¡Maravilloso!",
        "¡Genial!",
        "¡Fantástico!",
        "¡Brillante!"
    ];
    const incorrectMessages = [
        "¡No te rindas!",
        "¡Sigue intentando!",
        "¡La práctica hace al maestro!",
        "¡Cada intento te hace más fuerte!",
        "¡Sigue adelante!",
        "¡Casi lo logras!",
        "¡Un poco más!",
        "¡No te desanimes!",
        "¡Sigue practicando!",
        "¡Lo lograrás!"
    ];
    const messages = isCorrect ? correctMessages : incorrectMessages;
    return messages[Math.floor(Math.random() * messages.length)];
};

export const FeedbackMessage = ({ esCorrecta, onClose }: FeedbackMessageProps) => {
    useEffect(() => {
        if (onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [onClose]);

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
            onClick={onClose}
        >
            <motion.div
                className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={(e) => e.stopPropagation()}
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
                    {getMotivationalMessage(esCorrecta)}
                </motion.p>
            </motion.div>
        </motion.div>
    );
}; 