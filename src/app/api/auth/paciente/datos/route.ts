import { NextResponse } from 'next/server';
import { getDatosPacientePorUserId } from '@/modules/paciente/services/pacienteService';

export const dynamic = 'force-dynamic';

function replacerBigInt(key: string, value: any) {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    return value;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
        }

        const datos = await getDatosPacientePorUserId(Number(userId));
        if (!datos) {
            return NextResponse.json({ error: 'No se encontraron datos' }, { status: 404 });
        }

        // Serializa manualmente y parsea para evitar el error
        const safeDatos = JSON.parse(JSON.stringify(datos, replacerBigInt));
        return NextResponse.json(safeDatos);
    } catch (error) {
        console.error('Error en /api/auth/paciente/datos:', error);
        return NextResponse.json(
            { error: 'Error al obtener datos del paciente' },
            { status: 500 }
        );
    }
}
