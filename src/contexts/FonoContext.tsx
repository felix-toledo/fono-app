'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useFonoSession } from '@/hooks/useFonoSession';
import { DatosFono } from '@/modules/fono/types/fonoLocalStorage';

interface FonoContextType {
    userInfo: DatosFono | null;
    isLoading: boolean;
    getFonoId: () => number | null;
}

const FonoContext = createContext<FonoContextType | undefined>(undefined);

export function FonoProvider({ children }: { children: ReactNode }) {
    const { userInfo, isLoading, getFonoId } = useFonoSession();

    return (
        <FonoContext.Provider value={{ userInfo, isLoading, getFonoId }}>
            {children}
        </FonoContext.Provider>
    );
}

export function useFono() {
    const context = useContext(FonoContext);
    if (context === undefined) {
        throw new Error('useFono must be used within a FonoProvider');
    }
    return context;
} 