import { useState, useEffect } from 'react';
import { DatosPaciente } from '@/modules/paciente/types/pacienteLocalStorage';
import { useRouter } from 'next/navigation';

export function usePacienteSession() {
    const [userInfo, setUserInfo] = useState<DatosPaciente | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUserData = () => {
            if (typeof window !== 'undefined') {
                const sessionData = localStorage.getItem('userSession');
                if (sessionData) {
                    const parsedData = JSON.parse(sessionData);
                    if (parsedData.perfil === 'PACIENTE') {
                        setUserInfo(parsedData);
                    } else {
                        router.push('/login');
                    }
                } else {
                    router.push('/login');
                }
            }
            setIsLoading(false);
        };

        loadUserData();
    }, [router]);

    const getPacienteId = () => {
        if (isLoading) {
            return null;
        }
        if (!userInfo?.PacienteId) {
            router.push('/login');
            return null;
        }
        return Number(userInfo.PacienteId);
    };

    return {
        userInfo,
        isLoading,
        getPacienteId
    };
}
