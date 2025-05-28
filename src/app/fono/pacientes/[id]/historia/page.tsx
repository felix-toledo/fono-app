'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { MotivoConsulta } from '@/components/historia-clinica/MotivoConsulta';
import { Antecedentes } from '@/components/historia-clinica/Antecedentes';
import { EvaluacionFono } from '@/components/historia-clinica/EvaluacionFono';
import { DiagnosticoFono } from '@/components/historia-clinica/DiagnosticoFono';
import { PlanFono } from '@/components/historia-clinica/PlanFono';
import { EvolucionFono } from '@/components/historia-clinica/EvolucionFono';
import { useFono } from '@/contexts/FonoContext';
import type { HistoriaClinica as HistoriaClinicaType } from '@/types/historia-clinica';
import type { Paciente } from '@/types/paciente';
import type { EvolucionFono as EvolucionFonoType } from '@/types/evolucion-fono';
import { ChevronLeft, Plus, History, PenSquare } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { HistoriaClinicaView } from '@/components/historia-clinica/HistoriaClinicaView';
import { EvolucionesList } from '@/components/historia-clinica/EvolucionesList';

export default function HistoriaPaciente() {
    const params = useParams();
    const router = useRouter();
    const { getFonoId } = useFono();
    const [historiaData, setHistoriaData] = useState<HistoriaClinicaType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [paciente, setPaciente] = useState<Paciente | null>(null);
    const [evoluciones, setEvoluciones] = useState<EvolucionFonoType[]>([]);
    const [isAddingEvolucion, setIsAddingEvolucion] = useState(false);
    const [selectedEvolucion, setSelectedEvolucion] = useState<EvolucionFonoType | null>(null);

    useEffect(() => {
        if (params.id) {
            loadPaciente(Number(params.id));
        }
    }, [params.id]);

    useEffect(() => {
        if (paciente) {
            loadHistoriaClinica();
        }
    }, [paciente]);

    const loadPaciente = async (pacienteId: number) => {
        try {
            const response = await fetch(`/api/fono/pacientes/${pacienteId}`);
            if (response.ok) {
                const data = await response.json();
                setPaciente(data);
            }
        } catch (error) {
            console.error('Error loading patient:', error);
        }
    };

    const loadHistoriaClinica = async () => {
        if (!paciente) return;

        try {
            const response = await fetch(`/api/fono/pacientes/historia?pacienteId=${paciente.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setHistoriaData(data);
                    loadEvoluciones(data.id);
                } else {
                    setHistoriaData(null);
                }
            }
        } catch (error) {
            console.error('Error loading clinical history:', error);
        }
    };

    const loadEvoluciones = async (historiaId: number) => {
        try {
            const response = await fetch(`/api/fono/pacientes/evolucion?historiaId=${historiaId}`);
            if (response.ok) {
                const data = await response.json();
                setEvoluciones(data);
            }
        } catch (error) {
            console.error('Error loading evolutions:', error);
        }
    };

    const handleGuardarEvolucion = async (evolucion: EvolucionFonoType) => {
        if (!historiaData) {
            console.error('No hay historia clínica seleccionada');
            return;
        }

        if (!historiaData.id) {
            console.error('La historia clínica debe ser guardada primero');
            return;
        }

        const fonoId = getFonoId();
        if (!fonoId) {
            console.error('Missing fonoId');
            return;
        }

        if (!evolucion.avances?.trim() || !evolucion.observaciones?.trim() || !evolucion.cambiosPlan?.trim()) {
            console.error('Todos los campos son requeridos');
            return;
        }

        const evolucionCompleta = {
            id: evolucion.id || 0,
            historiaClinicaId: Number(historiaData.id),
            fonoId: Number(fonoId),
            fechaSesion: evolucion.fechaSesion instanceof Date
                ? evolucion.fechaSesion.toISOString()
                : new Date(evolucion.fechaSesion).toISOString(),
            avances: evolucion.avances.trim(),
            observaciones: evolucion.observaciones.trim(),
            cambiosPlan: evolucion.cambiosPlan.trim()
        };

        try {
            const response = await fetch('/api/fono/pacientes/evolucion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(evolucionCompleta)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al guardar la evolución');
            }

            const data = await response.json();
            setEvoluciones(prev => [data, ...prev]);
            setIsAddingEvolucion(false);
            setSelectedEvolucion(null);
        } catch (error) {
            console.error('Error saving evolution:', error);
        }
    };

    if (!paciente) {
        return <div>Cargando...</div>;
    }

    console.log(paciente);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Historia Clínica</h1>
                <Button variant="ghost" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
            </div>

            <Card className="p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">
                                {paciente.persona.nombre} {paciente.persona.apellido}
                            </h2>
                            <p className="text-gray-600">DNI: {paciente.persona.dni}</p>
                        </div>
                    </div>

                    {historiaData && (
                        <>
                            <HistoriaClinicaView
                                historiaData={historiaData}
                                isEditing={false}
                            />

                            <EvolucionesList
                                evoluciones={evoluciones}
                                historiaId={historiaData.id || 0}
                                fonoId={Number(getFonoId())}
                                isAddingEvolucion={isAddingEvolucion}
                                selectedEvolucion={selectedEvolucion}
                                onAddEvolucion={() => {
                                    setIsAddingEvolucion(true);
                                    setSelectedEvolucion(null);
                                }}
                                onCancelEvolucion={() => {
                                    setIsAddingEvolucion(false);
                                    setSelectedEvolucion(null);
                                }}
                                onSaveEvolucion={handleGuardarEvolucion}
                            />
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
} 