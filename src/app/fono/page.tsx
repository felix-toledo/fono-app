"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { CheckCircle, Clock, Users, Calendar, UserPlus, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import {
//     obtenerTurnos,
//     obtenerPacientes,
//     obtenerEstadisticas,
//     obtenerPacientePorId
// // } from '@/services/dataService';
// import { Turno, Paciente } from '@/types';
// import { format, isToday, parse, isValid } from 'date-fns';
// import { es } from 'date-fns/locale';
// import { UserInfo } from '@/components/Sidebar';

// // Función de utilidad para obtener el nombre completo del paciente
// const obtenerNombrePaciente = (pacientes: Paciente[], pacienteId: number): string => {
//     const paciente = pacientes.find(p => p.id === pacienteId);
//     return paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente no encontrado';
// };

export default function Dashboard() {
    // const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    // const router = useRouter();
    // const [stats, setStats] = useState({
    //     pacientesHoy: 0,
    //     pacientesTotales: 0,
    //     pacientesRegulares: 0,
    //     consultasTotales: 0
    // });

    // // Función para cargar los datos del usuario desde localStorage
    // const loadUserData = () => {
    //     const sessionData = localStorage.getItem('userSession');
    //     if (sessionData) {
    //         const parsedData = JSON.parse(sessionData);
    //         if (parsedData.role === 'fono') {
    //             setUserInfo(parsedData);
    //         } else {
    //             // Si no es un fonoaudiólogo, redirigir al login
    //             router.push('/login');
    //         }
    //     } else {
    //         // Si no hay sesión, redirigir al login
    //         router.push('/login');
    //     }
    // };

    // useEffect(() => {
    //     loadUserData();
    // }, [router]);

    // const [pacientesDelDia, setPacientesDelDia] = useState<Array<{
    //     id: number;
    //     nombre: string;
    //     estado: 'actual' | 'pendiente';
    //     horasRestantes?: number;
    // }>>([]);

    // const [pacientesRecientes, setPacientesRecientes] = useState<Paciente[]>([]);

    // // Cargar datos desde el servicio centralizado
    // useEffect(() => {
    //     const fetchData = async () => {
    //         // Obtener estadísticas
    //         const estadisticas = await obtenerEstadisticas(userInfo?.id ?? 0);
    //         if (estadisticas) {
    //             setStats({
    //                 pacientesHoy: estadisticas.turnosHoy,
    //                 pacientesTotales: estadisticas.pacientesTotal ?? 0,
    //                 pacientesRegulares: estadisticas.pacientesActivos,
    //                 consultasTotales: estadisticas.turnosTotal ?? 0
    //             });
    //         }

    //         // Obtener pacientes del día (turnos para hoy)
    //         const turnos = await obtenerTurnos();
    //         const hoy = format(new Date(), 'dd/MM/yyyy');
    //         const turnosHoy = turnos.filter(t => t.fecha === hoy).sort((a, b) => {
    //             // Ordenar por hora
    //             return a.horario.localeCompare(b.horario);
    //         });

    //         // Calcular si la cita es la actual o está pendiente
    //         const horaActual = new Date().getHours();
    //         const minutosActuales = new Date().getMinutes();

    //         // Obtener todos los pacientes para poder buscar nombre
    //         const todosPacientes = await obtenerPacientes();
    //         const pacientesHoy = turnosHoy.map(turno => {
    //             const [hora, minutos] = turno.horario.split(':').map(Number);
    //             const esPasado = hora < horaActual || (hora === horaActual && minutos < minutosActuales);
    //             const esActual = hora === horaActual && Math.abs(minutos - minutosActuales) < 30;

    //             // Calcular horas restantes
    //             let horasRestantes = hora - horaActual;
    //             if (horasRestantes < 0) horasRestantes = 0;

    //             return {
    //                 id: turno.pacienteId,
    //                 nombre: obtenerNombrePaciente(todosPacientes, turno.pacienteId),
    //                 estado: esActual ? 'actual' as const : 'pendiente' as const,
    //                 horasRestantes: horasRestantes
    //             };
    //         });

    //         setPacientesDelDia(pacientesHoy);

    //         // Obtener pacientes recientes (últimos 3 activos)
    //         const pacientesActivos = todosPacientes
    //             .filter(p => p.estado === 'activo')
    //             .sort((a, b) => {
    //                 // Si tiene última consulta, ordenar por fecha (más reciente primero)
    //                 if (a.ultimaConsulta && b.ultimaConsulta) {
    //                     const fechaA = parse(a.ultimaConsulta, 'dd/MM/yyyy', new Date());
    //                     const fechaB = parse(b.ultimaConsulta, 'dd/MM/yyyy', new Date());
    //                     if (isValid(fechaA) && isValid(fechaB)) {
    //                         return fechaB.getTime() - fechaA.getTime();
    //                     }
    //                 }
    //                 // Si no tiene última consulta, ordenar por ID (más reciente primero)
    //                 return (b.id || 0) - (a.id || 0);
    //             })
    //             .slice(0, 3);

    //         setPacientesRecientes(pacientesActivos);
    //     };
    //     fetchData();
    // }, [userInfo?.id]);

    // // Función para navegar a los detalles del paciente
    // const navegarADetallesPaciente = (id: number) => {
    //     router.push(`/fono/pacientes/detalles/${id}`);
    // };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <div className="text-gray-500">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="flex flex-col justify-center items-center p-6 text-center">
                    <h2 className="text-lg font-medium text-gray-800">Hoy Tienes</h2>
                    <p className="text-3xl font-bold text-primary mt-2 mb-4">0</p>
                    <p className="text-gray-600">Pacientes</p>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                    {/* Lista de pacientes del día - CLICKEABLE */}
                    <div className="bg-white rounded-lg shadow border border-border">
                        <div className="p-3 border-b border-gray-100 flex items-center">
                            <Calendar className="h-4 w-4 text-primary mr-2" />
                            <h3 className="font-medium text-gray-700">Pacientes del día</h3>
                            <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                Clickeable
                            </span>
                        </div>
                        <ul className="divide-y divide-gray-100">
                        </ul>
                    </div>
                </div>
            </div>
            {/* {pacientesDelDia.length > 0 ? (
                                pacientesDelDia.map((paciente, idx) => (
                                    <li
                                        key={paciente.id + '-' + idx}
                                        className="p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                                        onClick={() => navegarADetallesPaciente(paciente.id)}
                                    > */}
            <div className="text-gray-800 hover:text-primary transition-colors flex items-center">
                <span className="mr-2 text-xs text-primary">→</span>
                {/* {paciente.nombre} */}
            </div>
            <div className="text-gray-500">
                {/* {paciente.estado === 'actual' ? (
                                    <span className="inline-flex items-center text-secondary">
                                        <CheckCircle size={16} className="mr-1" /> Ahora
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center text-gray-500">
                                        <Clock size={16} className="mr-1" /> {paciente.horasRestantes}h
                                    </span>
                                )}
                            </div>
                        </li>
                        ))
                        ) : (
                        <li className="p-4 text-center text-gray-500">
                            No hay pacientes programados para hoy
                        </li>
                            )}
                    </ul>
                </div>
            </div>
        </div>
        
            {/* Acciones rápidas */ }
            </div>
            <div>
                <h2 className="text-lg font-medium text-gray-800 mb-3">Acciones rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/fono/turnos">
                        <Card className="flex items-center p-5 hover:bg-gray-50 transition-colors cursor-pointer h-full">
                            <Calendar className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-lg" />
                            <div className="ml-4">
                                <h3 className="font-medium text-gray-800">Agregar Turno</h3>
                                <p className="text-sm text-gray-500">Programa una nueva cita</p>
                            </div>
                        </Card>
                    </Link>

                    <Link href="/fono/pacientes/nuevo">
                        <Card className="flex items-center p-5 hover:bg-gray-50 transition-colors cursor-pointer h-full">
                            <UserPlus className="h-10 w-10 text-secondary p-2 bg-secondary/10 rounded-lg" />
                            <div className="ml-4">
                                <h3 className="font-medium text-gray-800">Agregar Paciente</h3>
                                <p className="text-sm text-gray-500">Registra un nuevo paciente</p>
                            </div>
                        </Card>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-4">
                    {/* Resumen de actividad reciente */}
                    <Card className="p-5">
                        <h3 className="font-medium text-gray-800 mb-3">Actividad reciente</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                <span className="text-sm text-gray-700">Turnos de esta semana</span>
                                <span className="font-medium text-primary">8</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                <span className="text-sm text-gray-700">Pacientes nuevos este mes</span>
                                <span className="font-medium text-secondary">5</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                <span className="text-sm text-gray-700">Sesiones completadas</span>
                                <span className="font-medium text-accent">24</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="flex flex-col space-y-4">
                    <Card className="flex-1 flex items-center justify-center p-6">
                        <div className="text-center">
                            <div className="h-20 w-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <Users className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="font-medium text-gray-800">Nombre</h3>
                            <p className="text-gray-600 text-sm">Fonoaudiólogo</p>
                        </div>
                    </Card>

                    <div className="grid grid-cols-3 gap-4">
                        <Card className="p-3 text-center">
                            <h4 className="text-sm font-medium text-gray-600">Consultas</h4>
                            <p className="text-xl font-bold text-gray-800 mt-1">0</p>
                        </Card>

                        <Card className="p-3 text-center">
                            <h4 className="text-sm font-medium text-gray-600">Pacientes</h4>
                            <p className="text-xl font-bold text-gray-800 mt-1">0</p>
                        </Card>

                        <Card className="p-3 text-center">
                            <h4 className="text-sm font-medium text-gray-600">Regulares</h4>
                            <p className="text-xl font-bold text-gray-800 mt-1">0</p>
                        </Card>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Pacientes Recientes</h2>
                <Card className="p-0 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última sesión</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* {pacientesRecientes.length > 0 ? (
                                                    pacientesRecientes.map((paciente, idx) => (
                                                        <tr
                                                            key={paciente.id + '-' + idx}
                                                            className="hover:bg-gray-50 cursor-pointer"
                                                            onClick={() => navegarADetallesPaciente(paciente.id || 0)}
                                                            style={{ userSelect: 'none' }}
                                                        >
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">{paciente.nombre} {paciente.apellido}</div>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                                {paciente.ultimaConsulta
                                                                    ? isToday(parse(paciente.ultimaConsulta, 'dd/MM/yyyy', new Date()))
                                                                        ? 'Hoy'
                                                                        : paciente.ultimaConsulta
                                                                    : 'Sin consultas'}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                    Activo
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className="px-4 py-5 text-center text-gray-500">
                                                            No hay pacientes recientes para mostrar
                                                        </td>
                                                    </tr>
                                                )} */}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div >
    );
}