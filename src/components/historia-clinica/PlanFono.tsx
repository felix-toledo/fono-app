import { Input } from '../Input';
import type { PlanFono as PlanFonoType } from '@/types/historia-clinica';

interface PlanFonoProps {
    data: PlanFonoType;
    onChange: (field: keyof PlanFonoType, value: string | number) => void;
    disabled?: boolean;
}

export const PlanFono = ({ data, onChange, disabled }: PlanFonoProps) => {
    const safeData = {
        objetivos: data?.objetivos || '',
        frecuenciaSesiones: data?.frecuenciaSesiones || 1,
        duracionTratamiento: data?.duracionTratamiento || 1,
        tecnicas: data?.tecnicas || '',
        participacionFamiliar: data?.participacionFamiliar || '',
        estado: data?.estado || 'Activa'
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Plan Fonoaudiológico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Input
                        label="Objetivos"
                        value={safeData.objetivos}
                        onChange={(e) => onChange('objetivos', e.target.value)}
                        disabled={disabled}
                    />
                </div>
                <Input
                    label="Frecuencia de Sesiones"
                    type="number"
                    value={safeData.frecuenciaSesiones}
                    onChange={(e) => onChange('frecuenciaSesiones', Number(e.target.value))}
                    disabled={disabled}
                />
                <Input
                    label="Duración del Tratamiento"
                    type="number"
                    value={safeData.duracionTratamiento}
                    onChange={(e) => onChange('duracionTratamiento', Number(e.target.value))}
                    disabled={disabled}
                />
                <div className="md:col-span-2">
                    <Input
                        label="Técnicas"
                        value={safeData.tecnicas}
                        onChange={(e) => onChange('tecnicas', e.target.value)}
                        disabled={disabled}
                    />
                </div>
                <div className="md:col-span-2">
                    <Input
                        label="Participación Familiar"
                        value={safeData.participacionFamiliar}
                        onChange={(e) => onChange('participacionFamiliar', e.target.value)}
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    );
}; 