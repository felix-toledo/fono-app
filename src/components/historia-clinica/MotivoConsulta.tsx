import { Input } from '../Input';
import type { MotivoConsulta as MotivoConsultaType } from '@/types/historia-clinica';

interface MotivoConsultaProps {
    data: MotivoConsultaType;
    onChange: (field: keyof MotivoConsultaType, value: string) => void;
    disabled?: boolean;
}

export const MotivoConsulta = ({ data, onChange, disabled }: MotivoConsultaProps) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Motivo de Consulta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Razón de Consulta"
                    value={data.razonConsulta}
                    onChange={(e) => onChange('razonConsulta', e.target.value)}
                    disabled={disabled}
                />
                <Input
                    label="Derivación"
                    value={data.derivacion}
                    onChange={(e) => onChange('derivacion', e.target.value)}
                    disabled={disabled}
                />
                <div className="md:col-span-2">
                    <Input
                        label="Observaciones"
                        value={data.observaciones}
                        onChange={(e) => onChange('observaciones', e.target.value)}
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    );
}; 