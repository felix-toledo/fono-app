import { useState, useEffect } from 'react';
import { DatosFono } from '@/modules/fono/types/fono';
import { useRouter } from 'next/navigation';

export function useFonoSession() {
    const [userInfo, setUserInfo] = useState<DatosFono | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUserData = () => {
            if (typeof window !== 'undefined') {
                const sessionData = localStorage.getItem('userSession');
                if (sessionData) {
                    const parsedData = JSON.parse(sessionData);
                    if (parsedData.perfil === 'FONO') {
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

    const getFonoId = () => {
        if (isLoading) {
            return null;
        }
        if (!userInfo?.FonoId) {
            router.push('/login');
            return null;
        }
        return Number(userInfo.FonoId);
    };

    return {
        userInfo,
        isLoading,
        getFonoId
    };
}
