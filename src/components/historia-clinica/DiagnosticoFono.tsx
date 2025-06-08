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

    const handleAreasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const selectedValues: string[] = [];

        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }

        setSelectedAreas(selectedValues);
        // Only save the first selected value to the database
        if (selectedValues.length > 0) {
            onChange('areasComprometidas', selectedValues[0]);
        }
    };

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
                    <select
                        multiple
                        value={selectedAreas}
                        onChange={handleAreasChange}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                        size={4}
                    >
                        <option value="Pragmatica">Pragmática</option>
                        <option value="Semantica">Semántica</option>
                        <option value="Fonologia_y_Fonetica">Fonología y Fonética</option>
                        <option value="Morfosintaxis">Morfosintaxis</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                        Seleccione las áreas comprometidas.
                    </p>
                </div>
            </div>
        </div>
    );
}; 