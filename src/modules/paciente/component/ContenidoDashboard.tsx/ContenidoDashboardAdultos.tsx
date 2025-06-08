"use client";

import { DatosPaciente } from '../../types/pacienteLocalStorage';
import { Calendar, FileText, User, Clock } from 'lucide-react';

interface Props {
    userInfo: DatosPaciente | null;
    edad: number | null;
}

export default function ContenidoDashboardAdultos({ userInfo, edad }: Props) {
    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header with welcome message */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-6 text-white">
                <h1 className="text-3xl font-bold">Bienvenido/a {userInfo?.Nombre} {userInfo?.Apellido}</h1>
                <p className="text-lg mt-2">Panel de Control de Tratamiento</p>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <User className="h-8 w-8 text-blue-500" />
                    <h2 className="text-xl font-bold text-gray-800">Información Personal</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Nombre Completo</p>
                        <p className="font-medium">{userInfo?.Nombre} {userInfo?.Apellido}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Edad</p>
                        <p className="font-medium">{edad} años</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{userInfo?.Email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="font-medium">{userInfo?.Telefono}</p>
                    </div>
                </div>
            </div>

            {/* Appointments Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Calendar className="h-8 w-8 text-green-500" />
                    <h2 className="text-xl font-bold text-gray-800">Próximos Turnos</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium">Consulta Regular</p>
                            <p className="text-sm text-gray-600">15 de Marzo, 2024 - 10:00 AM</p>
                        </div>
                        <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium">Evaluación de Progreso</p>
                            <p className="text-sm text-gray-600">22 de Marzo, 2024 - 11:30 AM</p>
                        </div>
                        <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Medical History Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                    <FileText className="h-8 w-8 text-indigo-500" />
                    <h2 className="text-xl font-bold text-gray-800">Historia Clínica</h2>
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium mb-2">Última Consulta</h3>
                        <p className="text-sm text-gray-600">Fecha: 1 de Marzo, 2024</p>
                        <p className="text-sm text-gray-600 mt-1">Diagnóstico: Mejora en la articulación de fonemas</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium mb-2">Tratamiento Actual</h3>
                        <p className="text-sm text-gray-600">Ejercicios de articulación y respiración</p>
                        <p className="text-sm text-gray-600 mt-1">Frecuencia: 2 veces por semana</p>
                    </div>
                </div>
            </div>
        </div>
    );
}