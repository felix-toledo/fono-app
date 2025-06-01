'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface SoundContextType {
    isMuted: boolean;
    toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
    const [isMuted, setIsMuted] = useState(false);

    // Load mute state from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedMuteState = localStorage.getItem('soundMuted');
            if (savedMuteState) {
                setIsMuted(JSON.parse(savedMuteState));
            }
        }
    }, []);

    const toggleMute = () => {
        setIsMuted(prev => {
            const newState = !prev;
            // Save to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('soundMuted', JSON.stringify(newState));
            }
            return newState;
        });
    };

    return (
        <SoundContext.Provider value={{ isMuted, toggleMute }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useGameSound() {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
}
