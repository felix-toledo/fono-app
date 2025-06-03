'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BarChart3, Eye } from "lucide-react";
import Link from "next/link";

export default function JuegosDashboard() {
    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
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
                    <Button variant="outline" asChild>
                        <Link href="/fono/juegos/estadisticas">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Ver Estadísticas
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
                        <p className="text-3xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">Juegos en curso</p>
                    </CardContent>
                </Card>

                {/* Card de Juegos Completados */}
                <Card>
                    <CardHeader>
                        <CardTitle>Juegos Completados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">Total de juegos finalizados</p>
                    </CardContent>
                </Card>

                {/* Card de Promedio de Puntuación */}
                <Card>
                    <CardHeader>
                        <CardTitle>Promedio de Puntuación</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">0%</p>
                        <p className="text-sm text-muted-foreground">Puntuación media</p>
                    </CardContent>
                </Card>
            </div>

            {/* Sección de Estadísticas Detalladas */}
            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Estadísticas Detalladas</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Progreso por Tipo de Juego</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Aquí irá un gráfico de progreso por tipo de juego</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Rendimiento por Día</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Aquí irá un gráfico de rendimiento diario</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
