'use client';

import { SoundProvider } from '@/contexts/SoundContext';
import { Volume2, VolumeX } from 'lucide-react';
import { useGameSound } from '@/contexts/SoundContext';

function SoundHeader() {
    const { isMuted, toggleMute } = useGameSound();

    return (
        <header className="w-full bg-white shadow-sm py-4 px-6">
            <div className="max-w-6xl mx-auto flex justify-end">
                <button
                    onClick={toggleMute}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                >
                    {isMuted ? (
                        <>
                            <VolumeX className="w-5 h-5" />
                            <span>Activar sonido</span>
                        </>
                    ) : (
                        <>
                            <Volume2 className="w-5 h-5" />
                            <span>Silenciar</span>
                        </>
                    )}
                </button>
            </div>
        </header>
    );
}

export default function JuegosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SoundProvider>
            <div className="min-h-screen bg-gray-50">
                <SoundHeader />
                <main className="w-full max-w-6xl p-6 mx-auto">
                    {children}
                </main>
            </div>
        </SoundProvider>
    );
}
