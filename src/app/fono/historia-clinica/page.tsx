'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
    FileText,
    PenSquare,
    Check,
    X,
    ChevronLeft,
    Plus,
    User,
    History,
    Search
} from 'lucide-react';
import { HistoriaClinicaView } from '@/components/historia-clinica/HistoriaClinicaView';
import { EvolucionesList } from '@/components/historia-clinica/EvolucionesList';

const initialHistoriaClinica: HistoriaClinicaType = {
    pacienteId: 0,
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
};

export default function HistoriaClinica() {
    const { getFonoId } = useFono();
    const [historiaData, setHistoriaData] = useState<HistoriaClinicaType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
    const [evoluciones, setEvoluciones] = useState<EvolucionFonoType[]>([]);
    const [isAddingEvolucion, setIsAddingEvolucion] = useState(false);
    const [selectedEvolucion, setSelectedEvolucion] = useState<EvolucionFonoType | null>(null);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fonoId = getFonoId();
        if (fonoId) {
            loadPacientes(fonoId);
        }
    }, [getFonoId]);

    useEffect(() => {
        if (selectedPaciente) {
            loadHistoriaClinica();
        }
    }, [selectedPaciente]);

    const loadPacientes = async (fonoId: number) => {
        try {
            const response = await fetch(`/api/fono/pacientes?fonoId=${fonoId}`);
            if (response.ok) {
                const data = await response.json();
                setPacientes(data);
            }
        } catch (error) {
            console.error('Error loading patients:', error);
        }
    };

    const loadHistoriaClinica = async () => {
        if (!selectedPaciente) return;

        try {
            const response = await fetch(`/api/fono/pacientes/historia?pacienteId=${selectedPaciente.id}`);
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
        if (!historiaData || !selectedPaciente) return;

        const fonoId = getFonoId();
        if (!fonoId) {
            console.error('Missing fonoId');
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
                    pacienteId: selectedPaciente.id,
                    fonoId: Number(fonoId)
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Historia clínica guardada:', data);
                setHistoriaData(data);
                setIsEditing(false);

                if (data.id) {
                    loadEvoluciones(data.id);
                }
            } else {
                const error = await response.json();
                console.error('Error saving:', error);
            }
        } catch (error) {
            console.error('Error saving:', error);
        }
    };

    const handleNuevaHistoria = () => {
        if (!selectedPaciente) return;

        setHistoriaData({
            ...initialHistoriaClinica,
            pacienteId: selectedPaciente.id
        });
        setIsEditing(true);
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

        console.log('Sending evolution data:', evolucionCompleta);

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

    const filteredPacientes = pacientes.filter(paciente =>
        `${paciente.nombre} ${paciente.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.dni.toString().includes(searchTerm)
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Historia Clínica</h1>
                <Button variant="ghost" onClick={() => window.history.back()}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
            </div>

            <Card className="p-6">
                {!selectedPaciente ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Buscar paciente por nombre o DNI..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="grid gap-4">
                            {filteredPacientes.map(paciente => (
                                <Card
                                    key={paciente.id}
                                    className="p-4 cursor-pointer hover:bg-gray-50"
                                    onClick={() => setSelectedPaciente(paciente)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium">
                                                {paciente.nombre} {paciente.apellido}
                                            </h3>
                                            <p className="text-sm text-gray-500">DNI: {paciente.dni}</p>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            Seleccionar
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                            {filteredPacientes.length === 0 && (
                                <p className="text-center text-gray-500 py-4">
                                    No se encontraron pacientes
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {selectedPaciente.nombre} {selectedPaciente.apellido}
                                </h2>
                                <p className="text-gray-600">DNI: {selectedPaciente.dni}</p>
                            </div>
                            <div className="flex space-x-2">
                                <Button variant="outline" onClick={() => setSelectedPaciente(null)}>
                                    Cambiar Paciente
                                </Button>
                                {!historiaData && (
                                    <Button onClick={handleNuevaHistoria}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nueva Historia
                                    </Button>
                                )}
                                {historiaData && !isEditing && (
                                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                                        <PenSquare className="h-4 w-4 mr-2" />
                                        Editar
                                    </Button>
                                )}
                                {isEditing && (
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
                        </div>

                        {historiaData && (
                            <>
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
                    </div>
                )}
            </Card>
        </div>
    );
}
