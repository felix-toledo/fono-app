import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

type PacienteRaw = {
    paciente_id: bigint;
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    mail: string;
    obraSocial: string;
    escolaridad: string;
    ocupacion: string;
    fechaAlta: Date;
    fechaAsignacion: Date;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fonoId = searchParams.get('fonoId');

    if (!fonoId || isNaN(Number(fonoId))) {
        return NextResponse.json({ error: 'Valid fonoId is required' }, { status: 400 });
    }

    try {
        const pacientes = await prisma.$queryRaw<PacienteRaw[]>`
            SELECT 
                vp.*,
                fp."fechaAsignacion" as "fechaAsignacion"
            FROM vista_datos_paciente vp
            JOIN "FonoPaciente" fp ON vp.paciente_id = fp."pacienteId"
            WHERE fp."fonoId" = ${BigInt(fonoId)}
        `;

        return NextResponse.json(pacientes.map((p: any) => ({
            id: Number(p.paciente_id),
            nombre: p.nombre,
            apellido: p.apellido,
            dni: p.dni,
            telefono: p.telefono,
            mail: p.mail,
            obraSocial: p.obraSocial,
            escolaridad: p.escolaridad,
            ocupacion: p.ocupacion,
            fechaAlta: format(new Date(p.fechaAlta), 'dd/MM/yyyy'),
            estado: 'activo'
        })));
    } catch (error) {
        console.error('Error fetching patients:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 