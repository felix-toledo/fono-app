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
import { ChevronLeft, Plus, History, PenSquare, X, Check } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { HistoriaClinicaView } from '@/components/historia-clinica/HistoriaClinicaView';
import { EvolucionesList } from '@/components/historia-clinica/EvolucionesList';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
            } else {
                toast.error('Error al cargar los datos del paciente');
            }
        } catch (error) {
            console.error('Error loading patient:', error);
            toast.error('Error al cargar los datos del paciente');
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
            } else {
                toast.error('Error al cargar la historia clínica');
            }
        } catch (error) {
            console.error('Error loading clinical history:', error);
            toast.error('Error al cargar la historia clínica');
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

    const handleChange = <T extends keyof HistoriaClinicaType>(
        section: T,
        field: keyof HistoriaClinicaType[T],
        value: string | number
    ) => {
        if (!historiaData) return;

        let processedValue = value;
        if (typeof value === 'number' && isNaN(value)) {
            processedValue = 1;
        }

        setHistoriaData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [section]: {
                    ...(prev[section] as any),
                    [field]: processedValue
                }
            };
        });
    };

    const handleGuardar = async () => {
        if (!historiaData || !paciente) return;

        const fonoId = getFonoId();
        if (!fonoId) {
            toast.error('Error: ID de fonoaudiólogo no encontrado');
            return;
        }

        try {
            const url = '/api/fono/pacientes/historia';
            const method = historiaData.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...historiaData,
                    pacienteId: paciente.id,
                    fonoId: Number(fonoId)
                })
            });

            if (response.ok) {
                const data = await response.json();
                setHistoriaData(data);
                setIsEditing(false);
                toast.success('Historia clínica guardada exitosamente');

                if (data.id) {
                    loadEvoluciones(data.id);
                }
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Error al guardar la historia clínica');
            }
        } catch (error) {
            console.error('Error saving:', error);
            toast.error(error instanceof Error ? error.message : 'Error al guardar la historia clínica');
        }
    };

    const handleGuardarEvolucion = async (evolucion: EvolucionFonoType) => {
        if (!historiaData) {
            toast.error('No hay historia clínica seleccionada');
            return;
        }

        if (!historiaData.id) {
            toast.error('La historia clínica debe ser guardada primero');
            return;
        }

        const fonoId = getFonoId();
        if (!fonoId) {
            toast.error('Error: ID de fonoaudiólogo no encontrado');
            return;
        }

        if (!evolucion.avances?.trim() || !evolucion.observaciones?.trim() || !evolucion.cambiosPlan?.trim()) {
            toast.error('Todos los campos son requeridos');
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
            toast.success('Evolución guardada exitosamente');
        } catch (error) {
            console.error('Error saving evolution:', error);
            toast.error(error instanceof Error ? error.message : 'Error al guardar la evolución');
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
                            <div className="flex justify-end space-x-2 mb-4">
                                {!isEditing ? (
                                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                                        <PenSquare className="h-4 w-4 mr-2" />
                                        Editar
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                                            <X className="h-4 w-4 mr-2" />
                                            Cancelar
                                        </Button>
                                        <Button onClick={handleGuardar}>
                                            <Check className="h-4 w-4 mr-2" />
                                            Guardar
                                        </Button>
                                    </>
                                )}
                            </div>
                            <HistoriaClinicaView
                                historiaData={historiaData}
                                isEditing={isEditing}
                                onChange={handleChange}
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
                    {!historiaData && (
                        <div className="flex justify-center py-8">
                            <Button onClick={() => {
                                setHistoriaData({
                                    pacienteId: paciente.id,
                                    motivo: {
                                        id: 0,
                                        razonConsulta: '',
                                        derivacion: '',
                                        observaciones: ''
                                    },
                                    antecedente: {
                                        id: 0,
                                        embarazoParto: '',
                                        desarrolloPsicomotor: '',
                                        enfermedadesPrevias: '',
                                        medicacionActual: '',
                                        historiaFamiliar: ''
                                    },
                                    evaluacion: {
                                        id: 0,
                                        lenguaje: '',
                                        habla: '',
                                        voz: '',
                                        audicion: '',
                                        deglucion: ''
                                    },
                                    diagnostico: {
                                        id: 0,
                                        tipoTrastorno: '',
                                        severidad: '',
                                        areasComprometidas: 'Pragmatica'
                                    },
                                    plan: {
                                        id: 0,
                                        objetivos: '',
                                        frecuenciaSesiones: 1,
                                        duracionTratamiento: 1,
                                        tecnicas: '',
                                        participacionFamiliar: '',
                                        estado: 'Activa'
                                    }
                                });
                                setIsEditing(true);
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nueva Historia
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
} 