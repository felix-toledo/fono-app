import { Input } from '../Input';
import type { DiagnosticoFono as DiagnosticoFonoType } from '@/types/historia-clinica';
import { useState, useEffect } from 'react';

interface DiagnosticoFonoProps {
    data: DiagnosticoFonoType;
    onChange: (field: keyof DiagnosticoFonoType, value: string) => void;
    disabled?: boolean;
}

export const DiagnosticoFono = ({ data, onChange, disabled }: DiagnosticoFonoProps) => {
    const safeData = {
        tipoTrastorno: data?.tipoTrastorno || 'Expresivos',
        severidad: data?.severidad || '',
        areasComprometidas: data?.areasComprometidas || ''
    };

    // State to track selected areas for UI purposes
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

    // Update selectedAreas when data changes
    useEffect(() => {
        if (safeData.areasComprometidas) {
            setSelectedAreas([safeData.areasComprometidas]);
        }
    }, [safeData.areasComprometidas]);

    const handleAreaChange = (area: string, checked: boolean) => {
        let newSelectedAreas: string[];

        if (checked) {
            // Si se está marcando, agregar al array manteniendo las existentes
            newSelectedAreas = [...selectedAreas, area];
        } else {
            // Si se está desmarcando, remover del array
            newSelectedAreas = selectedAreas.filter(a => a !== area);
        }

        setSelectedAreas(newSelectedAreas);

        // Guardar la primera selección (o la única selección)
        if (newSelectedAreas.length > 0) {
            console.log('Área que se guardará:', newSelectedAreas[0]);
            onChange('areasComprometidas', newSelectedAreas[0]);
        }
    };

    const areas = [
        { value: 'Pragmatica', label: 'Pragmática' },
        { value: 'Semantica', label: 'Semántica' },
        { value: 'Fonologia_y_Fonetica', label: 'Fonología y Fonética' },
        { value: 'Morfosintaxis', label: 'Morfosintaxis' }
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Diagnóstico Fonoaudiológico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Trastorno
                    </label>
                    <select
                        value={safeData.tipoTrastorno}
                        onChange={(e) => onChange('tipoTrastorno', e.target.value as DiagnosticoFonoType['tipoTrastorno'])}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="Expresivos">Expresivos</option>
                        <option value="Mixtos">Mixtos</option>
                        <option value="Procesamiento_y_Formulacion">Procesamiento y Formulación</option>
                    </select>
                </div>
                <Input
                    label="Severidad"
                    value={safeData.severidad}
                    onChange={(e) => onChange('severidad', e.target.value)}
                    disabled={disabled}
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Áreas Comprometidas
                    </label>
                    <div className="space-y-2">
                        {areas.map((area) => (
                            <div key={area.value} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={area.value}
                                    checked={selectedAreas.includes(area.value)}
                                    onChange={(e) => handleAreaChange(area.value, e.target.checked)}
                                    disabled={disabled}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label
                                    htmlFor={area.value}
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    {area.label}
                                </label>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Seleccione las áreas comprometidas.
                    </p>
                </div>
            </div>
        </div>
    );
}; 