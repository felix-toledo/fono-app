'use client';

import { useState, useRef } from 'react';

interface AudioRecorderProps {
    onTranscripcion?: (texto: string) => void;
    modoPalabraUnica?: boolean;
}

export default function AudioRecorder({ onTranscripcion, modoPalabraUnica = false }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [inputText, setInputText] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('alloy');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const voices = [
        { id: 'alloy', name: 'Alloy' },
        { id: 'echo', name: 'Echo' },
        { id: 'fable', name: 'Fable' },
        { id: 'onyx', name: 'Onyx' },
        { id: 'nova', name: 'Nova' },
        { id: 'shimmer', name: 'Shimmer' }
    ];

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await sendAudio(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Stop all audio tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const speakText = async (text: string) => {
        if (!text) return;

        try {
            setIsSpeaking(true);

            const response = await fetch('/api/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, voice: selectedVoice }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate speech');
            }

            const data = await response.json();

            // Crear un elemento de audio temporal
            const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
            audioRef.current = audio;

            audio.onended = () => {
                setIsSpeaking(false);
            };

            audio.onerror = () => {
                setIsSpeaking(false);
            };

            await audio.play();
        } catch (error) {
            console.error('Error speaking text:', error);
            setIsSpeaking(false);
        }
    };

    const stopSpeaking = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsSpeaking(false);
        }
    };

    async function sendAudio(blob: Blob) {
        try {
            const formData = new FormData();
            formData.append('audio', new File([blob], 'audio.webm'));

            const res = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            setTranscribedText(data.text);
            if (onTranscripcion) onTranscripcion(data.text);
        } catch (error) {
            console.error('Error sending audio:', error);
            setTranscribedText('Error: Failed to transcribe audio. Please try again.');
            if (onTranscripcion) onTranscripcion('');
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div className="flex flex-col gap-4 w-full max-w-2xl">
                <div className="flex gap-4">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`px-4 py-2 rounded-full ${isRecording
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-blue-500 hover:bg-blue-600'
                            } text-white transition-colors`}
                    >
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </button>
                </div>

                {!modoPalabraUnica && (
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Escribe el texto que quieres que se lea..."
                            className="w-full p-2 border rounded-lg min-h-[100px]"
                        />
                        <div className="flex flex-col gap-2">
                            <select
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="p-2 border rounded-lg"
                            >
                                {voices.map((voice) => (
                                    <option key={voice.id} value={voice.id}>
                                        {voice.name}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => speakText(inputText)}
                                    disabled={!inputText || isSpeaking}
                                    className={`px-4 py-2 rounded-full ${!inputText || isSpeaking
                                        ? 'bg-gray-400'
                                        : 'bg-green-500 hover:bg-green-600'
                                        } text-white transition-colors`}
                                >
                                    Leer Texto
                                </button>
                                {isSpeaking && (
                                    <button
                                        onClick={stopSpeaking}
                                        className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                                    >
                                        Detener
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {transcribedText && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                        <h3 className="font-semibold mb-2">Transcripción:</h3>
                        <p className="text-gray-700">{transcribedText}</p>
                        {!modoPalabraUnica && (
                            <button
                                onClick={() => speakText(transcribedText)}
                                className="mt-2 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                            >
                                Leer Transcripción
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
