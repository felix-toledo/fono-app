import { useState, useRef } from 'react';
import Image from 'next/image';
import AudioRecorder from '@/components/audio/Component';

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
}

export default function FotosHabla({ imagenes, consigna, textoCompleto, textoSinCompletar, palabraACompletar }: FotosHablaProps) {
    const [transcripcion, setTranscripcion] = useState('');
    const [resultado, setResultado] = useState<'pendiente' | 'correcto' | 'incorrecto'>('pendiente');
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef<any>(null);
    const audioCacheRef = useRef<{ [key: string]: string }>({}); // cache por texto

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
        const esperado = normalizarTexto(palabraACompletar);
        const recibido = normalizarTexto(texto);
        if (recibido === esperado) {
            setResultado('correcto');
        } else {
            setResultado('incorrecto');
        }
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

    return (
        <div className="max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-lg flex flex-col gap-6">
            <div className="text-lg text-center font-semibold">{consignaMostrar}</div>
            <div className="flex gap-4 justify-center">
                {imagenes.map((img, i) => (
                    <div key={i} className="relative w-24 h-24">
                        <Image src={img} alt={`Imagen ${i + 1}`} fill className="object-contain rounded-lg" />
                    </div>
                ))}
            </div>
            <div className="text-lg text-center font-semibold">{textoCompleto}</div>
            <div className="flex flex-col items-center gap-2">
                <div className="text-xl font-bold">Escucha y completa:</div>
                <button
                    onClick={reproducirTexto}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {isLoading ? 'Cargando...' : 'Escuchar texto'}
                </button>
                <div className="text-lg mt-2">{textoALeer} <span className="font-bold text-gray-400">...?</span></div>
            </div>
            <AudioRecorder
                onTranscripcion={handleTranscripcion}
                modoPalabraUnica={true}
            />
            {resultado !== 'pendiente' && (
                <div className={`text-2xl font-bold text-center ${resultado === 'correcto' ? 'text-green-600' : 'text-red-500'}`}>
                    {resultado === 'correcto' ? '¡Correcto!' : 'Intenta de nuevo'}
                </div>
            )}
            {transcripcion && (
                <div className="text-center text-gray-600">Tu respuesta: <span className="font-bold">{transcripcion}</span></div>
            )}
        </div>
    );
}
