import React, { useState } from 'react';
import GameQuestion from './dinamic/GameQuestion';
import FotosHabla from './dinamic/FotosHabla';
import OrdenGame from './dinamic/OrdenGame';
import { SoundProvider } from '@/contexts/SoundContext';
import AnimalFinderGame from './AnimalFinderGame';

interface GamePreviewProps {
    isOpen: boolean;
    onClose: () => void;
    gameType: string;
    gameData: any;
}

export default function GamePreview({ isOpen, onClose, gameType, gameData }: GamePreviewProps) {
    if (!isOpen) return null;

    const renderGamePreview = () => {
        switch (gameType) {
            case 'CONSIGNA':
                return (
                    <GameQuestion
                        tipo_juego="select"
                        url_imagen={gameData.url_imagen}
                        consigna={gameData.consigna}
                        respuestas={gameData.respuestas}
                        onRespuestaSeleccionada={() => { }}
                    />
                );

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
                        onRespuestaSeleccionada={() => { }}
                    />
                );

            case 'EMOCIONES':
                if (gameData.isSafari) {
                    return <AnimalFinderGame onGameComplete={() => { }} />;
                }
                return (
                    <GameQuestion
                        tipo_juego="select"
                        url_imagen={gameData.imagenEmociones || '/placeholder.jpg'}
                        consigna={gameData.consignaEmociones || ''}
                        respuestas={gameData.opcionesEmociones?.map((opt: any) => ({
                            texto: opt.text,
                            esCorrecta: opt.isCorrect
                        })) || []}
                        onRespuestaSeleccionada={() => { }}
                    />
                );

            case 'REPETIR':
                return (
                    <FotosHabla
                        imagenes={gameData.imagenRepetir ? [gameData.imagenRepetir] : []}
                        consigna="Repite la palabra o frase"
                        textoCompleto={gameData.textoRepetir || ''}
                        textoSinCompletar={gameData.textoRepetir || ''}
                        palabraACompletar={gameData.textoRepetir || ''}
                        onGameComplete={() => { }}
                    />
                );

            case 'HABLAR':
                return (
                    <FotosHabla
                        imagenes={gameData.imagenesHablar?.map((img: File) => img) || []}
                        consigna={gameData.consignaEmociones || ''}
                        textoCompleto={gameData.textoCompleto || ''}
                        textoSinCompletar={gameData.textoIncompleto || ''}
                        palabraACompletar={gameData.palabraCompletar || ''}
                        onGameComplete={() => { }} // Add this line
                    />
                );

            case 'ORDEN':
                return (
                    <OrdenGame
                        imagenes={gameData.imagenesOrden?.map((img: File) => img) || []}
                        palabras={gameData.palabrasOrdenadas?.map((palabra: string, index: number) => ({
                            palabra,
                            orden: index + 1
                        })) || []}
                        consigna={gameData.consignaOrden || ''}
                        onOrdenCompletado={() => { }}
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
                        onRespuestaSeleccionada={() => { }}
                    />
                );

            default:
                return <div>No hay vista previa disponible para este tipo de juego</div>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Vista Previa del Juego</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="mt-4">
                    <SoundProvider>
                        {renderGamePreview()}
                    </SoundProvider>
                </div>
            </div>
        </div>
    );
} 