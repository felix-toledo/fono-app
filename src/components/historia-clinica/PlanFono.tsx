import { Input } from '../Input';
import type { PlanFono as PlanFonoType } from '@/types/historia-clinica';

interface PlanFonoProps {
    data: PlanFonoType;
    onChange: (field: keyof PlanFonoType, value: string | number) => void;
    disabled?: boolean;
}

export const PlanFono = ({ data, onChange, disabled }: PlanFonoProps) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Plan de Tratamiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Objetivos"
                    value={data.objetivos}
                    onChange={(e) => onChange('objetivos', e.target.value)}
                    disabled={disabled}
                />
                <Input
                    label="Frecuencia de Sesiones"
                    type="number"
                    value={data.frecuenciaSesiones}
                    onChange={(e) => onChange('frecuenciaSesiones', parseInt(e.target.value))}
                    disabled={disabled}
                />
                <Input
                    label="Duración del Tratamiento"
                    type="number"
                    value={data.duracionTratamiento}
                    onChange={(e) => onChange('duracionTratamiento', parseInt(e.target.value))}
                    disabled={disabled}
                />
                <Input
                    label="Técnicas"
                    value={data.tecnicas}
                    onChange={(e) => onChange('tecnicas', e.target.value)}
                    disabled={disabled}
                />
                <Input
                    label="Participación Familiar"
                    value={data.participacionFamiliar}
                    onChange={(e) => onChange('participacionFamiliar', e.target.value)}
                    disabled={disabled}
                />
                <Input
                    label="Estado"
                    value={data.estado}
                    onChange={(e) => onChange('estado', e.target.value)}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}; 