'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { LogIn, User, Lock } from 'lucide-react';
import { authService } from '@/services/authService';
import { TipoUsuario } from '@prisma/client';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login(username, password);

            // Guardar la sesión del usuario
            const userData = {
                ...response.user
            };
            localStorage.setItem('userSession', JSON.stringify(userData));
            localStorage.setItem('token', response.token);

            // Obtener datos completos del fono
            const userId = userData.id;
            const res = await fetch(`/api/auth/fono/datos?userId=${userId}`);
            const datosFono = { ...userData, ...(await res.json()) };

            // Guardar en localStorage



            localStorage.setItem('userSession', JSON.stringify(datosFono));

            // Redirigir según el perfil
            switch (userData.perfil) {
                case TipoUsuario.FONO:
                    router.push('/fono');
                    break;
                case TipoUsuario.PACIENTE:
                    router.push('/paciente/dashboard');
                    break;
                case TipoUsuario.ADMIN:
                    router.push('/admin');
                    break;
                case TipoUsuario.TUTOR:
                    router.push('/tutor');
                    break;
                default:
                    router.push('/');
            }
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                'Error al iniciar sesión. Por favor, inténtalo de nuevo.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary">Sistema para Fonoaudiólogos</h1>
                    <p className="text-gray-600 mt-2">Inicia sesión para acceder a la plataforma</p>
                </div>

                <Card className="p-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Usuario"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    type="password"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Recordarme
                                </label>
                            </div>

                            <div className="text-sm">
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => toast.info('Función no disponible en esta versión')}
                                    className="text-primary hover:text-primary-hover"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full flex justify-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Iniciando sesión...
                                    </span>
                                ) : (
                                    <span className="flex items-center text-white">
                                        <LogIn className="mr-2 h-5 w-5" />
                                        Iniciar sesión
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-600">
                            ¿No tienes una cuenta?{' '}
                            <Link href="/registro" className="text-primary hover:text-primary-hover font-medium">
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
} 