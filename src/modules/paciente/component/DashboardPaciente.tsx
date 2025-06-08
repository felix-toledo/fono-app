"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DatosPaciente } from '../types/pacienteLocalStorage';
import ContenidoDashboardNinos from './ContenidoDashboard.tsx/ContenidoDashboardNinos';
import ContenidoDashboardAdultos from './ContenidoDashboard.tsx/ContenidoDashboardAdultos';

export default function DashboardPaciente() {
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<DatosPaciente | null>(null);
    const [edad, setEdad] = useState<number | null>(null);
    const router = useRouter();


    // Función para cargar los datos del usuario desde localStorage
    const loadUserData = async () => {
        if (typeof window !== 'undefined') {
            const sessionData = localStorage.getItem('userSession');
            if (sessionData) {
                const parsedData = JSON.parse(sessionData);
                const fechaNac = new Date(parsedData.persona.fechaNac);
                const hoy = new Date();
                const edad = hoy.getFullYear() - fechaNac.getFullYear();
                setEdad(edad);
                if (parsedData.perfil === 'PACIENTE') {
                    setUserInfo(parsedData);
                } else {
                    router.push('/login');
                }
            } else {
                router.push('/login');
            }
        }
    };

    useEffect(() => {
        loadUserData();
    }, [router]);


    return (
        <div className="flex flex-col gap-6">
            {edad && edad < 10 ? <ContenidoDashboardNinos userInfo={userInfo} edad={edad} /> :
                <ContenidoDashboardAdultos userInfo={userInfo} edad={edad} />}
        </div>
    );
}