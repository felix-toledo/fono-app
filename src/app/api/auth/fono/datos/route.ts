import { NextResponse } from 'next/server';
import { getDatosFonoPorUserId } from '@/modules/fono/services/fonoService';

function replacerBigInt(key: string, value: any) {
    return typeof value === 'bigint' ? value.toString() : value;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get('userId'));
    if (!userId) {
        return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }
    const datos = await getDatosFonoPorUserId(userId);
    // Serializa manualmente y parsea para evitar el error
    const safeDatos = JSON.parse(JSON.stringify(datos, replacerBigInt));
    return NextResponse.json(safeDatos);
}
