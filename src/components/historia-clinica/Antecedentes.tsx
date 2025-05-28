import { Input } from '../Input';
import type { Antecedentes as AntecedentesType } from '@/types/historia-clinica';

interface AntecedentesProps {
    data: AntecedentesType;
    onChange: (field: keyof AntecedentesType, value: string) => void;
    disabled?: boolean;
}

export const Antecedentes = ({ data, onChange, disabled }: AntecedentesProps) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Antecedentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Embarazo y Parto"
                    value={data.embarazoParto}
                    onChange={(e) => onChange('embarazoParto', e.target.value)}
                    disabled={disabled}
                />
                <Input
                    label="Desarrollo Psicomotor"
                    value={data.desarrolloPsicomotor}
                    onChange={(e) => onChange('desarrolloPsicomotor', e.target.value)}
                    disabled={disabled}
                />
                <Input
                    label="Enfermedades Previas"
                    value={data.enfermedadesPrevias}
                    onChange={(e) => onChange('enfermedadesPrevias', e.target.value)}
                    disabled={disabled}
                />
                <Input
                    label="Medicación Actual"
                    value={data.medicacionActual}
                    onChange={(e) => onChange('medicacionActual', e.target.value)}
                    disabled={disabled}
                />
                <div className="md:col-span-2">
                    <Input
                        label="Historia Familiar"
                        value={data.historiaFamiliar}
                        onChange={(e) => onChange('historiaFamiliar', e.target.value)}
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    );
}; 