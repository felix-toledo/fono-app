"use client";

import { DatosPaciente } from '../../types/pacienteLocalStorage';

interface Props {
    userInfo: DatosPaciente | null;
    edad: number | null;
}

export default function ContenidoDashboardAdultos({ userInfo, edad }: Props) {
    return (
        <div className="flex flex-col gap-6">
            <h1>Dashboard Adultos</h1>
            <h1>Hola {userInfo?.Nombre} {userInfo?.Apellido}</h1>
            <p>Edad: {edad}</p>
        </div>
    );
}