import { Input } from '../Input';
import type { DiagnosticoFono as DiagnosticoFonoType } from '@/types/historia-clinica';

interface DiagnosticoFonoProps {
    data: DiagnosticoFonoType;
    onChange: (field: keyof DiagnosticoFonoType, value: string) => void;
    disabled?: boolean;
}

export const DiagnosticoFono = ({ data, onChange, disabled }: DiagnosticoFonoProps) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Diagnóstico Fonoaudiológico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Trastorno
                    </label>
                    <select
                        value={data.tipoTrastorno}
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
                    value={data.severidad}
                    onChange={(e) => onChange('severidad', e.target.value)}
                    disabled={disabled}
                />
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Áreas Comprometidas
                    </label>
                    <select
                        value={data.areasComprometidas}
                        onChange={(e) => onChange('areasComprometidas', e.target.value as DiagnosticoFonoType['areasComprometidas'])}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="Pragmatica">Pragmática</option>
                        <option value="Semantica">Semántica</option>
                        <option value="Fonologia_y_Fonetica">Fonología y Fonética</option>
                        <option value="Morfosintaxis">Morfosintaxis</option>
                    </select>
                </div>
            </div>
        </div>
    );
}; 