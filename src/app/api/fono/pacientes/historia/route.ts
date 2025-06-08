import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función auxiliar para convertir BigInt a Number
function convertBigIntToNumber(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'bigint') {
        return Number(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(convertBigIntToNumber);
    }

    if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            result[key] = convertBigIntToNumber(obj[key]);
        }
        return result;
    }

    return obj;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const pacienteId = searchParams.get('pacienteId');

    if (!pacienteId || isNaN(Number(pacienteId))) {
        return NextResponse.json({ error: 'Valid pacienteId is required' }, { status: 400 });
    }

    try {
        const historia = await prisma.historiaClinica.findFirst({
            where: {
                pacienteId: BigInt(pacienteId),
                estado: 'Activa'
            },
            include: {
                motivo: true,
                antecedente: true,
                evaluacion: true,
                diagnostico: true,
                plan: true
            }
        });

        if (!historia) {
            return NextResponse.json(null);
        }

        // Convertir BigInt a Number antes de enviar la respuesta
        const convertedHistoria = convertBigIntToNumber(historia);
        return NextResponse.json(convertedHistoria);
    } catch (error) {
        console.error('Error fetching clinical history:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { pacienteId, fonoId, motivo, antecedente, evaluacion, diagnostico, plan } = data;

        if (!pacienteId || !fonoId || !motivo || !antecedente || !evaluacion || !diagnostico || !plan) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create everything in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create motivo
            const newMotivo = await tx.motivoConsulta.create({
                data: motivo
            });

            // Create antecedente
            const newAntecedente = await tx.antecedentes.create({
                data: antecedente
            });

            // Create evaluacion
            const newEvaluacion = await tx.evaluacionFono.create({
                data: evaluacion
            });

            // Create diagnostico
            const newDiagnostico = await tx.diagnosticoFono.create({
                data: diagnostico
            });

            // Create plan
            const newPlan = await tx.planFono.create({
                data: plan
            });

            // Create historia clinica
            const newHistoria = await tx.historiaClinica.create({
                data: {
                    pacienteId: BigInt(pacienteId),
                    motivoId: newMotivo.id,
                    antecedenteId: newAntecedente.id,
                    evaluacionId: newEvaluacion.id,
                    diagnosticoId: newDiagnostico.id,
                    planId: newPlan.id,
                    estado: 'Activa'
                }
            });

            // Crear la relación entre el fonoaudiólogo y la historia clínica
            await tx.fonoHistoria.create({
                data: {
                    historiaId: newHistoria.id,
                    fonoId: BigInt(fonoId),
                    fechaAsignacion: new Date()
                }
            });

            return newHistoria;
        });

        // Convertir BigInt a Number antes de enviar la respuesta
        const convertedResult = {
            ...result,
            id: Number(result.id),
            pacienteId: Number(result.pacienteId),
            motivoId: Number(result.motivoId),
            antecedenteId: Number(result.antecedenteId),
            evaluacionId: Number(result.evaluacionId),
            diagnosticoId: Number(result.diagnosticoId),
            planId: Number(result.planId)
        };

        return NextResponse.json(convertedResult);
    } catch (error) {
        console.error('Error creating clinical history:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, motivo, antecedente, evaluacion, diagnostico, plan } = data;

        if (!id || !motivo || !antecedente || !evaluacion || !diagnostico || !plan) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Update everything in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get the clinical history
            const historia = await tx.historiaClinica.findUnique({
                where: { id: BigInt(id) },
                include: {
                    motivo: true,
                    antecedente: true,
                    evaluacion: true,
                    diagnostico: true,
                    plan: true
                }
            });

            if (!historia) {
                throw new Error('Historia clínica no encontrada');
            }

            // 2. Update MotivoConsulta
            await tx.motivoConsulta.update({
                where: { id: historia.motivoId },
                data: {
                    razonConsulta: motivo.razonConsulta,
                    derivacion: motivo.derivacion,
                    observaciones: motivo.observaciones
                }
            });

            // 3. Update Antecedentes
            await tx.antecedentes.update({
                where: { id: historia.antecedenteId },
                data: {
                    embarazoParto: antecedente.embarazoParto,
                    desarrolloPsicomotor: antecedente.desarrolloPsicomotor,
                    enfermedadesPrevias: antecedente.enfermedadesPrevias,
                    medicacionActual: antecedente.medicacionActual,
                    historiaFamiliar: antecedente.historiaFamiliar
                }
            });

            // 4. Update EvaluacionFono
            await tx.evaluacionFono.update({
                where: { id: historia.evaluacionId },
                data: {
                    lenguaje: evaluacion.lenguaje,
                    habla: evaluacion.habla,
                    voz: evaluacion.voz,
                    audicion: evaluacion.audicion,
                    deglucion: evaluacion.deglucion
                }
            });

            // 5. Update DiagnosticoFono
            await tx.diagnosticoFono.update({
                where: { id: historia.diagnosticoId },
                data: {
                    tipoTrastorno: diagnostico.tipoTrastorno,
                    severidad: diagnostico.severidad,
                    areasComprometidas: diagnostico.areasComprometidas
                }
            });

            // 6. Update PlanFono
            await tx.planFono.update({
                where: { id: historia.planId },
                data: {
                    objetivos: plan.objetivos,
                    frecuenciaSesiones: plan.frecuenciaSesiones,
                    duracionTratamiento: plan.duracionTratamiento,
                    tecnicas: plan.tecnicas,
                    participacionFamiliar: plan.participacionFamiliar
                }
            });

            // 7. Get updated clinical history
            const updatedHistoria = await tx.historiaClinica.findUnique({
                where: { id: BigInt(id) },
                include: {
                    motivo: true,
                    antecedente: true,
                    evaluacion: true,
                    diagnostico: true,
                    plan: true
                }
            });

            return updatedHistoria;
        });

        // Convertir BigInt a Number antes de enviar la respuesta
        const convertedResult = convertBigIntToNumber(result);
        return NextResponse.json(convertedResult);
    } catch (error) {
        console.error('Error updating clinical history:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
