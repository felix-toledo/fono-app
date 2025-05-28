import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET handler to fetch user profile
export async function GET(request: Request) {
    try {
        // Get userId from session header
        const sessionData = request.headers.get('x-session-data');
        if (!sessionData) {
            console.error('No session data found in headers');
            return NextResponse.json(
                { error: 'No hay sesión activa' },
                { status: 401 }
            );
        }

        const { userId } = JSON.parse(sessionData);
        console.log('Fetching profile for userId:', userId); // Added for debugging

        // Get user data using the existing service
        const userData = await prisma.$queryRaw<any[]>`
            SELECT 
                u.id::integer AS "UserId",
                f.id::integer AS "FonoId",
                p.id::integer AS "PersonaId",
                p.nombre AS "Nombre",
                p.apellido AS "Apellido",
                p.dni AS "DNI",
                p.telefono AS "Telefono",
                p.mail AS "Email",
                f.matricula AS "Matricula",
                f."direccionConsultorio" AS "DireccionConsultorio",
                f."fechaAlta"::text AS "FechaAltaFono"
            FROM "Fonoaudiologo" f
            JOIN "Persona" p ON f."personaId" = p.id
            JOIN "Usuario" u ON u."personaId" = p.id
            WHERE u.id = ${userId}
        `;

        if (!userData || userData.length === 0) {
            console.error('No user data found for userId:', userId);
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(userData[0]);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        return NextResponse.json(
            { error: 'Error al obtener el perfil' },
            { status: 500 }
        );
    }
}

// PUT handler to update user profile
export async function PUT(request: Request) {
    try {
        // Get userId from session header
        const sessionData = request.headers.get('x-session-data');
        if (!sessionData) {
            console.error('No session data found in headers');
            return NextResponse.json(
                { error: 'No hay sesión activa' },
                { status: 401 }
            );
        }

        const { userId } = JSON.parse(sessionData);
        console.log('Updating profile for userId:', userId); // Added for debugging
        const body = await request.json();
        console.log('Update data:', body); // Added for debugging

        // First get the user to find the related Persona and Fonoaudiologo IDs
        const user = await prisma.usuario.findUnique({
            where: { id: userId },
            include: {
                persona: {
                    include: {
                        fonoaudiologo: true
                    }
                }
            }
        });

        if (!user) {
            console.error('No user found for userId:', userId);
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Update Persona data
        await prisma.persona.update({
            where: { id: user.persona.id },
            data: {
                nombre: body.name,
                apellido: body.lastName,
                telefono: body.phone,
                mail: body.email,
            }
        });

        // Update Fonoaudiologo data
        await prisma.fonoaudiologo.update({
            where: { id: user.persona.fonoaudiologo?.id || 0 },
            data: {
                direccionConsultorio: body.address,
                matricula: body.licenseNumber,
            }
        });

        // Get updated data to return
        const updatedUser = await prisma.$queryRaw<any[]>`
            SELECT 
                u.id::integer AS "UserId",
                f.id::integer AS "FonoId",
                p.id::integer AS "PersonaId",
                p.nombre AS "Nombre",
                p.apellido AS "Apellido",
                p.dni AS "DNI",
                p.telefono AS "Telefono",
                p.mail AS "Email",
                f.matricula AS "Matricula",
                f."direccionConsultorio" AS "DireccionConsultorio",
                f."fechaAlta"::text AS "FechaAltaFono"
            FROM "Fonoaudiologo" f
            JOIN "Persona" p ON f."personaId" = p.id
            JOIN "Usuario" u ON u."personaId" = p.id
            WHERE u.id = ${userId}
        `;

        return NextResponse.json(updatedUser[0]);
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el perfil' },
            { status: 500 }
        );
    }
}
