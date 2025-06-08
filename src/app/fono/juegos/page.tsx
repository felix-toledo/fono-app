'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BarChart3, Eye } from "lucide-react";
import Link from "next/link";
import { useFono } from '@/contexts/FonoContext';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface EstadisticasJuego {
    titulo: string;
    intentos: number;
    ganados: number;
    perdidos: number;
}

interface EstadisticasPaciente {
    nivel: number;
    experiencia: number;
    totalJuegosJugados: number;
    ultimaFechaJugada: string | null;
    estadisticasPorJuego: EstadisticasJuego[];
}

interface Paciente {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
}

export default function JuegosDashboard() {
    const { getFonoId } = useFono();
    const [loading, setLoading] = useState(true);
    const [estadisticas, setEstadisticas] = useState<{
        juegosActivos: number;
        juegosCompletados: number;
        promedioPuntuacion: number;
    } | null>(null);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState<string>('');
    const [estadisticasDetalladas, setEstadisticasDetalladas] = useState<EstadisticasPaciente | null>(null);
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        const fonoId = getFonoId();
        if (!fonoId) return;

        // Fetch dashboard statistics
        fetch(`/api/fono/juegos/detalles?fonoId=${fonoId}`)
            .then(res => res.json())
            .then(data => {
                setEstadisticas(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching statistics:', error);
                setLoading(false);
            });

        // Fetch patients
        fetch(`/api/fono/pacientes?fonoId=${fonoId}`)
            .then(res => res.json())
            .then(data => {
                setPacientes(data);
            })
            .catch(error => {
                console.error('Error fetching patients:', error);
            });
    }, [getFonoId]);

    useEffect(() => {
        const fonoId = getFonoId();
        if (!fonoId || !pacienteSeleccionado) return;

        // Fetch detailed statistics for selected patient
        fetch(`/api/fono/pacientes/juegos?fonoId=${fonoId}&pacienteId=${pacienteSeleccionado}`)
            .then(res => res.json())
            .then(data => {
                setEstadisticasDetalladas(data);
            })
            .catch(error => {
                console.error('Error fetching detailed statistics:', error);
            });
    }, [getFonoId, pacienteSeleccionado]);

    // Filtrar pacientes por nombre o apellido
    const pacientesFiltrados = pacientes.filter(
        (p) =>
            p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
            p.apellido.toLowerCase().includes(filtro.toLowerCase())
    );

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <Skeleton className="h-8 w-[200px] mb-6" />
                <Skeleton className="h-10 w-[300px] mb-8" />
                <div className="grid gap-6">
                    <Skeleton className="h-[200px] w-full" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <h1 className="text-3xl font-bold">Dashboard de Juegos</h1>
                <div className="flex gap-4">
                    <Button asChild>
                        <Link href="/fono/juegos/crear">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear Juego
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/fono/juegos/ver">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Juegos
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card de Juegos Activos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Juegos Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{estadisticas?.juegosActivos || 0}</p>
                        <p className="text-sm text-muted-foreground">Juegos en curso</p>
                    </CardContent>
                </Card>

                {/* Card de Juegos Completados */}
                <Card>
                    <CardHeader>
                        <CardTitle>Juegos Completados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{estadisticas?.juegosCompletados || 0}</p>
                        <p className="text-sm text-muted-foreground">Total de juegos finalizados</p>
                    </CardContent>
                </Card>

                {/* Card de Promedio de Puntuación */}
                <Card>
                    <CardHeader>
                        <CardTitle>Promedio de Puntuación</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{estadisticas?.promedioPuntuacion || 0}%</p>
                        <p className="text-sm text-muted-foreground">Puntuación media</p>
                    </CardContent>
                </Card>
            </div>

            {/* Sección de Estadísticas Detalladas */}
            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Estadísticas Detalladas</h2>

                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Filtrar pacientes por nombre o apellido"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className="mb-4 p-2 border rounded w-full max-w-md"
                    />
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Apellido</TableHead>
                                <TableHead>DNI</TableHead>
                                <TableHead>Teléfono</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pacientesFiltrados.map((paciente) => (
                                <TableRow
                                    key={paciente.id}
                                    className={
                                        pacienteSeleccionado === paciente.id.toString()
                                            ? "bg-blue-100 border-l-4 border-blue-500 cursor-pointer"
                                            : "hover:bg-muted cursor-pointer"
                                    }
                                    onClick={() => setPacienteSeleccionado(paciente.id.toString())}
                                    style={{ transition: 'background 0.2s, border 0.2s' }}
                                >
                                    <TableCell>{paciente.nombre}</TableCell>
                                    <TableCell>{paciente.apellido}</TableCell>
                                    <TableCell>{paciente.dni}</TableCell>
                                    <TableCell>{paciente.telefono}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {estadisticasDetalladas && (
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Progreso del Paciente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">Nivel {estadisticasDetalladas.nivel}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {estadisticasDetalladas.experiencia} XP
                                            </span>
                                        </div>
                                        <Progress value={estadisticasDetalladas.experiencia % 100} className="h-2" />
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Total de juegos jugados: {estadisticasDetalladas.totalJuegosJugados}
                                    </div>
                                    {estadisticasDetalladas.ultimaFechaJugada && (
                                        <div className="text-sm text-muted-foreground">
                                            Última fecha jugada: {new Date(estadisticasDetalladas.ultimaFechaJugada).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Estadísticas por Juego</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {estadisticasDetalladas.estadisticasPorJuego && estadisticasDetalladas.estadisticasPorJuego.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Juego</TableHead>
                                                <TableHead className="text-right">Intentos</TableHead>
                                                <TableHead className="text-right">Ganados</TableHead>
                                                <TableHead className="text-right">Perdidos</TableHead>
                                                <TableHead className="text-right">% Éxito</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {estadisticasDetalladas.estadisticasPorJuego.map((juego) => (
                                                <TableRow key={juego.titulo}>
                                                    <TableCell>{juego.titulo}</TableCell>
                                                    <TableCell className="text-right">{juego.intentos}</TableCell>
                                                    <TableCell className="text-right">{juego.ganados}</TableCell>
                                                    <TableCell className="text-right">{juego.perdidos}</TableCell>
                                                    <TableCell className="text-right">
                                                        {juego.intentos > 0
                                                            ? Math.round((juego.ganados / juego.intentos) * 100)
                                                            : 0}%
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center text-muted-foreground py-4">
                                        No hay juegos jugados aún
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
