"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, FileText, Settings, LogOut, Menu, Gamepad2, User } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { format } from 'date-fns';
// import { es } from 'date-fns/locale';
import { DatosFono } from '@/modules/fono/types/fonoLocalStorage';
import { DatosPaciente } from '@/modules/paciente/types/pacienteLocalStorage';
import { Logo } from '@/components/Logo';

// Function to determine navigation link classes
const getNavLinkClass = (isActive: boolean) => {
    return `flex items-center p-3 rounded-lg mb-2 transition-colors ${isActive
        ? 'bg-primary text-white'
        : 'text-gray-700 hover:bg-sidebar-hover'
        }`;
};

export const Sidebar = () => {
    const [userInfo, setUserInfo] = useState<DatosFono | DatosPaciente | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    // const currentDate = format(new Date(), "d 'de' MMMM 'del' yyyy", { locale: es });

    const currentDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    // Function to load user data from localStorage
    const loadUserData = async () => {
        if (typeof window !== 'undefined') {
            const sessionData = localStorage.getItem('userSession');
            if (sessionData) {
                const parsedData = JSON.parse(sessionData);
                setUserInfo(parsedData);
            }
        }
    };

    // Load initial data when component mounts
    useEffect(() => {
        loadUserData();
    }, []);

    // Listener for localStorage changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleStorageChange = () => {
                loadUserData();
            };

            window.addEventListener('storage', handleStorageChange);

            return () => {
                window.removeEventListener('storage', handleStorageChange);
            };
        }
    }, []);

    // Agregar después de los otros useEffect
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userSession');
            window.location.href = '/login';
        }
    };

    const isFono = userInfo?.perfil === 'FONO';
    const isPaciente = userInfo?.perfil === 'PACIENTE';

    const handleNavClick = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Header for mobile */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="flex items-center justify-between h-14 px-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-60 bg-sidebar border-r border-border p-4 flex flex-col
                transform transition-transform duration-200 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="pb-4 mb-4 border-b border-border">
                    <div className="flex flex-col items-center">
                        <div className="mb-4">
                            <Logo size="md" />
                        </div>
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2 overflow-hidden">
                            {userInfo?.FotoPerfil ? (
                                <img
                                    src={userInfo.FotoPerfil}
                                    alt="Foto de perfil"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Users className="h-8 w-8 text-primary" />
                            )}
                        </div>
                        <h2 className="font-medium text-gray-800">{userInfo?.Nombre} {userInfo?.Apellido}</h2>
                        <span className="text-xs text-gray-500">{userInfo?.Email}</span>
                    </div>
                </div>

                <div className="flex flex-col flex-1">
                    {isFono ? (
                        // Fonoaudiologo Navigation
                        <>
                            <Link
                                href="/fono"
                                className={getNavLinkClass(pathname === '/fono')}
                                onClick={handleNavClick}
                            >
                                <Home size={20} className="mr-2" />
                                <span>Inicio</span>
                            </Link>

                            <Link href="/fono/pacientes" className={getNavLinkClass(pathname === '/fono/pacientes')} onClick={handleNavClick}>
                                <Users size={20} className="mr-2" />
                                <span>Pacientes</span>
                            </Link>

                            <Link href="/fono/turnos" className={getNavLinkClass(pathname === '/fono/turnos')} onClick={handleNavClick}>
                                <Calendar size={20} className="mr-2" />
                                <span>Turnos</span>
                            </Link>

                            <Link href="/fono/historia-clinica" className={getNavLinkClass(pathname === '/fono/historia-clinica')} onClick={handleNavClick}>
                                <FileText size={20} className="mr-2" />
                                <span>Historia Clínica</span>
                            </Link>

                            <Link href="/fono/juegos" className={getNavLinkClass(pathname === '/fono/juegos')} onClick={handleNavClick}>
                                <Gamepad2 size={20} className="mr-2" />
                                <span>Juegos</span>
                            </Link>

                            <div className="mt-4 mb-2 border-t border-gray-200 pt-4">
                                <h3 className="text-xs font-medium text-gray-500 uppercase px-3 mb-2">
                                    Administración
                                </h3>
                            </div>

                            <Link href="/fono/configuracion" className={getNavLinkClass(pathname === '/fono/configuracion')} onClick={handleNavClick}>
                                <Settings size={20} className="mr-2" />
                                <span>Configuración</span>
                            </Link>
                        </>
                    ) : isPaciente ? (
                        // Paciente Navigation
                        <>
                            <Link
                                href="/paciente"
                                className={getNavLinkClass(pathname === '/paciente')}
                                onClick={handleNavClick}
                            >
                                <Home size={20} className="mr-2" />
                                <span>Inicio</span>
                            </Link>

                            <Link href="/paciente/turnos" className={getNavLinkClass(pathname === '/paciente/turnos')} onClick={handleNavClick}>
                                <Calendar size={20} className="mr-2" />
                                <span>Mis Turnos</span>
                            </Link>

                            <Link href="/paciente/juegos" className={getNavLinkClass(pathname === '/paciente/juegos')} onClick={handleNavClick}>
                                <Gamepad2 size={20} className="mr-2" />
                                <span>Juegos</span>
                            </Link>

                            <button
                                onClick={() => {
                                    toast.info('Esta opción estará disponible próximamente', {
                                        position: "top-right",
                                        autoClose: 3000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                    });
                                    handleNavClick();
                                }}
                                className={getNavLinkClass(pathname === '/paciente/sobre-mi')}
                            >
                                <User size={20} className="mr-2" />
                                <span>Sobre Mí</span>
                            </button>
                        </>
                    ) : null}

                    <button
                        onClick={() => {
                            handleLogout();
                            handleNavClick();
                        }}
                        className="mt-4 text-gray-700 flex items-center p-3 rounded-lg hover:bg-red-50 hover:text-danger transition-colors"
                    >
                        <LogOut size={20} className="mr-2" />
                        <span>Cerrar sesión</span>
                    </button>
                </div>

                <div className="mt-auto pt-4 border-t border-border text-sm">
                    <p className="text-gray-600">{currentDate}</p>
                    <p className="text-gray-400 text-xs mt-4">v 2.0Beta<br />09052025</p>
                </div>
            </aside>
        </>
    );
}; 