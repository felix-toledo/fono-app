import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const gameData = JSON.parse(formData.get('gameData') as string);

        // Create the main game record
        const game = await prisma.juego.create({
            data: {
                titulo: gameData.titulo,
                rama: gameData.rama,
                descripcion: gameData.descripcion,
                nivelDificultad: gameData.nivelDificultad,
                experienciaDada: gameData.experienciaDada,
                estado: gameData.estado,
                fonoIdCreado: gameData.fonoIdCreado,
                fechaCreado: new Date(gameData.fechaCreado),
                tipoJuego: gameData.tipoJuego,
            },
        });

        // Process and create game fields
        for (const fieldData of gameData.gameFields) {
            // Handle image uploads if present
            let imagenConsigna = null;
            if (fieldData.imagenConsigna) {
                const imageFile = formData.get(fieldData.imagenConsigna.name) as File;
                if (imageFile) {
                    const bytes = await imageFile.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const fileName = `${Date.now()}-${imageFile.name}`;
                    const path = join(process.cwd(), 'public', 'uploads', fileName);
                    await writeFile(path, buffer);
                    imagenConsigna = JSON.stringify({ url: `/uploads/${fileName}` });
                }
            }

            // Create the game field
            const campoJuego = await prisma.campoJuego.create({
                data: {
                    tipoCampo: fieldData.tipoCampo,
                    titulo: fieldData.titulo,
                    consigna: fieldData.consigna,
                    rptaValida: fieldData.rptaValida,
                    opciones: fieldData.opciones,
                    imagenConsigna: imagenConsigna || undefined,
                    rama: gameData.rama,
                },
            });

            // Create the relationship
            await prisma.juegoCampoJ.create({
                data: {
                    juegoId: game.id,
                    campoJuegoId: campoJuego.id,
                },
            });
        }

        // Convert BigInt to string for JSON serialization
        return NextResponse.json({
            success: true,
            gameId: game.id.toString()
        });
    } catch (error) {
        console.error('Error creating game:', error);
        return NextResponse.json(
            { error: 'Error al crear el juego' },
            { status: 500 }
        );
    }
} 