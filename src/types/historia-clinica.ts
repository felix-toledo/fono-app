export interface MotivoConsulta {
    id: number;
    razonConsulta: string;
    derivacion: string;
    observaciones: string;
}

export interface Antecedentes {
    id: number;
    embarazoParto: string;
    desarrolloPsicomotor: string;
    enfermedadesPrevias: string;
    medicacionActual: string;
    historiaFamiliar: string;
}

export interface EvaluacionFono {
    id: number;
    lenguaje: string;
    habla: string;
    voz: string;
    audicion: string;
    deglucion: string;
}

export interface DiagnosticoFono {
    id: number;
    tipoTrastorno: string;
    severidad: string;
    areasComprometidas: 'Pragmatica' | 'Semantica' | 'Fonologia_y_Fonetica' | 'Morfosintaxis';
}

export interface PlanFono {
    id: number;
    objetivos: string;
    frecuenciaSesiones: number;
    duracionTratamiento: number;
    tecnicas: string;
    participacionFamiliar: string;
    estado: string;
}

export interface HistoriaClinica {
    id?: number;
    pacienteId: number;
    motivo: MotivoConsulta;
    antecedente: Antecedentes;
    evaluacion: EvaluacionFono;
    diagnostico: DiagnosticoFono;
    plan: PlanFono;
    fechaCreacion?: Date;
    fechaActualizacion?: Date;
} 