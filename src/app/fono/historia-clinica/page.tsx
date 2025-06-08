'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFono } from '@/contexts/FonoContext';
import type { Paciente } from '@/types/paciente';
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
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader } from '@/components/Loader';
import { useRouter } from 'next/navigation';

export default function HistoriaClinica() {
    const router = useRouter();
    const { getFonoId } = useFono();
    const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingPacientes, setIsLoadingPacientes] = useState(false);

    useEffect(() => {
        const fonoId = getFonoId();
        if (fonoId !== null) {
            loadPacientes(fonoId);
        }
    }, [getFonoId]);

    const loadPacientes = async (fonoId: number) => {
        setIsLoadingPacientes(true);
        try {
            const response = await fetch(`/api/fono/pacientes?fonoId=${fonoId}`);
            if (response.ok) {
                const data = await response.json();
                setPacientes(data);
            } else {
                toast.error('Error al cargar los pacientes');
            }
        } catch (error) {
            console.error('Error loading patients:', error);
            toast.error('Error al cargar los pacientes');
        } finally {
            setIsLoadingPacientes(false);
        }
    };


    const handlePacienteSelect = (paciente: Paciente) => {
        router.push(`/fono/pacientes/${paciente.id}/historia`);
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
                        {isLoadingPacientes ? (
                            <Loader />
                        ) : (
                            <div className="grid gap-4">
                                {filteredPacientes.map(paciente => (
                                    <Card
                                        key={paciente.id}
                                        className="p-4 cursor-pointer hover:bg-gray-50"
                                        onClick={() => handlePacienteSelect(paciente)}
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
                        )}
                    </div>
                ) : (<></>)}
            </Card>
        </div>
    );
}
