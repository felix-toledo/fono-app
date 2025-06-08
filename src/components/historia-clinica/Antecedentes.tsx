import { Input } from '../Input';
import type { Antecedentes as AntecedentesType } from '@/types/historia-clinica';

interface AntecedentesProps {
    data: AntecedentesType;
    onChange: (field: keyof AntecedentesType, value: string) => void;
    disabled?: boolean;
}

export const Antecedentes = ({ data, onChange, disabled }: AntecedentesProps) => {
    const safeData = {
        embarazoParto: data?.embarazoParto || '',
        desarrolloPsicomotor: data?.desarrolloPsicomotor || '',
        enfermedadesPrevias: data?.enfermedadesPrevias || '',
        medicacionActual: data?.medicacionActual || '',
        historiaFamiliar: data?.historiaFamiliar || ''
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Antecedentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Embarazo y Parto"
                    value={safeData.embarazoParto}
                    onChange={(e) => onChange('embarazoParto', e.target.value)}
                    disabled={disabled}
                />
                <Input
                    label="Desarrollo Psicomotor"
                    value={safeData.desarrolloPsicomotor}
                    onChange={(e) => onChange('desarrolloPsicomotor', e.target.value)}
                    disabled={disabled}
                />
                <Input
                    label="Enfermedades Previas"
                    value={safeData.enfermedadesPrevias}
                    onChange={(e) => onChange('enfermedadesPrevias', e.target.value)}
                    disabled={disabled}
                />
                <Input
                    label="Medicación Actual"
                    value={safeData.medicacionActual}
                    onChange={(e) => onChange('medicacionActual', e.target.value)}
                    disabled={disabled}
                />
                <div className="md:col-span-2">
                    <Input
                        label="Historia Familiar"
                        value={safeData.historiaFamiliar}
                        onChange={(e) => onChange('historiaFamiliar', e.target.value)}
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    );
}; 