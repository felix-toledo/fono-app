import { Input } from '../Input';
import type { EvaluacionFono as EvaluacionFonoType } from '@/types/historia-clinica';

interface EvaluacionFonoProps {
    data: EvaluacionFonoType;
    onChange: (field: keyof EvaluacionFonoType, value: string) => void;
    disabled?: boolean;
}

export const EvaluacionFono = ({ data, onChange, disabled }: EvaluacionFonoProps) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Evaluación Fonoaudiológica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Lenguaje"
                    value={data.lenguaje}
                    onChange={(e) => onChange('lenguaje', e.target.value)}
                    disabled={disabled}
                />
                <Input
                    label="Habla"
                    value={data.habla}
                    onChange={(e) => onChange('habla', e.target.value)}
                    disabled={disabled}
                />
                <Input
                    label="Voz"
                    value={data.voz}
                    onChange={(e) => onChange('voz', e.target.value)}
                    disabled={disabled}
                />
                <Input
                    label="Audición"
                    value={data.audicion}
                    onChange={(e) => onChange('audicion', e.target.value)}
                    disabled={disabled}
                />
                <div className="md:col-span-2">
                    <Input
                        label="Deglución"
                        value={data.deglucion}
                        onChange={(e) => onChange('deglucion', e.target.value)}
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    );
}; 