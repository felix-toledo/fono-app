'use client';

import { createContext, useContext, ReactNode } from 'react';
import { usePacienteSession } from '@/hooks/usePacienteSession';
import { DatosPaciente } from '@/modules/paciente/types/pacienteLocalStorage';

interface PacienteContextType {
    userInfo: DatosPaciente | null;
    isLoading: boolean;
    getPacienteId: () => number | null;
}

const PacienteContext = createContext<PacienteContextType | undefined>(undefined);

export function PacienteProvider({ children }: { children: ReactNode }) {
    const { userInfo, isLoading, getPacienteId } = usePacienteSession();

    return (
        <PacienteContext.Provider value={{ userInfo, isLoading, getPacienteId }}>
            {children}
        </PacienteContext.Provider>
    );
}

export function usePaciente() {
    const context = useContext(PacienteContext);
    if (context === undefined) {
        throw new Error('usePaciente must be used within a PacienteProvider');
    }
    return context;
} 