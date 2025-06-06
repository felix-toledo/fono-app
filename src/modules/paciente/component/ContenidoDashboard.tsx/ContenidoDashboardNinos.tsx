"use client";

import { DatosPaciente } from '../../types/pacienteLocalStorage';

interface Props {
    userInfo: DatosPaciente | null;
    edad: number;
}

export default function ContenidoDashboardNinos({ userInfo, edad }: Props) {
    return (
        <div className="flex flex-col gap-6">
            <h1>Dashboard Ninos</h1>
            <h1>Hola {userInfo?.Nombre} {userInfo?.Apellido}</h1>
            <p>Edad: {edad}</p>
        </div>
    );
}