import { Card } from '@/components/Card';
import { MotivoConsulta } from '@/components/historia-clinica/MotivoConsulta';
import { Antecedentes } from '@/components/historia-clinica/Antecedentes';
import { EvaluacionFono } from '@/components/historia-clinica/EvaluacionFono';
import { DiagnosticoFono } from '@/components/historia-clinica/DiagnosticoFono';
import { PlanFono } from '@/components/historia-clinica/PlanFono';
import type { HistoriaClinica as HistoriaClinicaType } from '@/types/historia-clinica';

interface HistoriaClinicaViewProps {
    historiaData: HistoriaClinicaType;
    isEditing?: boolean;
    onChange?: <T extends keyof HistoriaClinicaType>(
        section: T,
        field: keyof HistoriaClinicaType[T],
        value: string | number
    ) => void;
}

export function HistoriaClinicaView({
    historiaData,
    isEditing = false,
    onChange = () => { }
}: HistoriaClinicaViewProps) {
    return (
        <div className="space-y-8">
            <MotivoConsulta
                data={historiaData.motivo}
                onChange={(field, value) => onChange('motivo', field, value)}
                disabled={!isEditing}
            />

            <Antecedentes
                data={historiaData.antecedente}
                onChange={(field, value) => onChange('antecedente', field, value)}
                disabled={!isEditing}
            />

            <EvaluacionFono
                data={historiaData.evaluacion}
                onChange={(field, value) => onChange('evaluacion', field, value)}
                disabled={!isEditing}
            />

            <DiagnosticoFono
                data={historiaData.diagnostico}
                onChange={(field, value) => onChange('diagnostico', field, value)}
                disabled={!isEditing}
            />

            <PlanFono
                data={historiaData.plan}
                onChange={(field, value) => onChange('plan', field, value)}
                disabled={!isEditing}
            />
        </div>
    );
} 