'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EvolucionFono } from "@/components/historia-clinica/EvolucionFono";

interface Turno {
    id: number;
    fecha: Date;
    estado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'REALIZADO';
    observaciones: string;
    tipoSesion: string;
    fonoNombre: string;
    historiaClinicaId?: number;
}

export default function TurnosPaciente() {
    const params = useParams();
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showEvolucionModal, setShowEvolucionModal] = useState(false);
    const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);

    useEffect(() => {
        const fetchTurnos = async () => {
            try {
                const response = await fetch(`/api/pacientes/${params.id}/turnos`);
                if (!response.ok) {
                    throw new Error('Error al obtener los turnos');
                }
                const data = await response.json();
                setTurnos(data.map((turno: any) => ({
                    ...turno,
                    fecha: new Date(turno.fecha)
                })));
            } catch (error) {
                console.error('Error fetching appointments:', error);
                setError('No se pudieron cargar los turnos');
            } finally {
                setLoading(false);
            }
        };

        fetchTurnos();
    }, [params.id]);

    const handleStatusChange = async (turnoId: number, newStatus: 'REALIZADO' | 'CANCELADO') => {
        try {
            if (newStatus === 'REALIZADO') {
                const historiaResponse = await fetch(`/api/pacientes/${params.id}/historia`);
                if (!historiaResponse.ok) {
                    const errorData = await historiaResponse.json();
                    throw new Error(errorData.error || 'No se encontró la historia clínica del paciente');
                }
                const historiaData = await historiaResponse.json();

                setSelectedTurno({
                    ...turnos.find(t => t.id === turnoId)!,
                    historiaClinicaId: historiaData.id
                });
                setShowEvolucionModal(true);
                return;
            }

            const response = await fetch(`/api/turnos/${turnoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estado: newStatus
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar el estado del turno');
            }

            setTurnos(turnos.map(turno =>
                turno.id === turnoId
                    ? { ...turno, estado: newStatus }
                    : turno
            ));
            toast.success(`Turno ${(newStatus as string) === 'REALIZADO' ? 'marcado como realizado' : 'cancelado'} exitosamente`);
        } catch (error) {
            console.error('Error updating appointment status:', error);
            toast.error(error instanceof Error ? error.message : 'Error al actualizar el estado del turno');
        }
    };

    const handleEvolucionSave = async (evolucionData: any) => {
        try {
            const evolucionResponse = await fetch('/api/fono/pacientes/evolucion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...evolucionData,
                    historiaClinicaId: selectedTurno?.historiaClinicaId,
                    fonoId: params.id
                })
            });

            if (!evolucionResponse.ok) {
                const errorData = await evolucionResponse.json();
                throw new Error(errorData.error || 'Error al guardar la evolución');
            }

            const turnoResponse = await fetch(`/api/turnos/${selectedTurno?.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estado: 'REALIZADO'
                })
            });

            if (!turnoResponse.ok) {
                const errorData = await turnoResponse.json();
                throw new Error(errorData.error || 'Error al actualizar el estado del turno');
            }

            setTurnos(turnos.map(turno =>
                turno.id === selectedTurno?.id
                    ? { ...turno, estado: 'REALIZADO' }
                    : turno
            ));

            setShowEvolucionModal(false);
            setSelectedTurno(null);
            toast.success('Evolución guardada y turno marcado como realizado');
        } catch (error) {
            console.error('Error saving evolution:', error);
            toast.error(error instanceof Error ? error.message : 'Error al guardar la evolución');
        }
    };

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader>
                    <CardTitle>Turnos del Paciente</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <p>Cargando turnos...</p>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center h-40 text-red-500">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Fonoaudiológo</TableHead>
                                    <TableHead>Tipo de Sesión</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {turnos.map((turno) => (
                                    <TableRow key={turno.id}>
                                        <TableCell>
                                            {format(turno.fecha, 'PPP', { locale: es })}
                                        </TableCell>
                                        <TableCell>{turno.fonoNombre}</TableCell>
                                        <TableCell>{turno.tipoSesion}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-sm ${turno.estado === 'CONFIRMADO' ? 'bg-green-100 text-green-800' :
                                                turno.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                                                    turno.estado === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {turno.estado}
                                            </span>
                                        </TableCell>
                                        <TableCell>{turno.observaciones}</TableCell>
                                        <TableCell>
                                            {isToday(turno.fecha) && turno.estado === 'CONFIRMADO' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleStatusChange(turno.id, 'REALIZADO')}
                                                    >
                                                        Marcar como Realizado
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleStatusChange(turno.id, 'CANCELADO')}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {turnos.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4">
                                            No hay turnos registrados
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showEvolucionModal} onOpenChange={setShowEvolucionModal}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Registrar Evolución</DialogTitle>
                    </DialogHeader>
                    {selectedTurno && (
                        <EvolucionFono
                            data={{
                                id: 0,
                                historiaClinicaId: selectedTurno.historiaClinicaId!,
                                fonoId: Number(params.id),
                                fechaSesion: selectedTurno.fecha,
                                avances: '',
                                observaciones: '',
                                cambiosPlan: ''
                            }}
                            onSave={handleEvolucionSave}
                            onCancel={() => {
                                setShowEvolucionModal(false);
                                setSelectedTurno(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
