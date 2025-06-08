import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const gameData = JSON.parse(formData.get('gameData') as string);

        // Parsear gameFields si es un string
        if (typeof gameData.gameFields === 'string') {
            gameData.gameFields = JSON.parse(gameData.gameFields);
        }

        // Create the main game record
        const game = await prisma.juego.create({
            data: {
                titulo: gameData.titulo,
                rama: gameData.rama,
                descripcion: gameData.descripcion,
                nivelDificultad: gameData.nivelDificultad,
                experienciaDada: gameData.experienciaDada,
                estado: gameData.estado,
                rangoEdad: gameData.rangoEdad,
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
                const imageFile = formData.get('imagenConsigna');
                if (imageFile instanceof File) {
                    // Procesar como archivo
                    const bytes = await imageFile.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const fileName = `${Date.now()}-${imageFile.name}`;
                    const path = join(process.cwd(), 'public', 'uploads', fileName);
                    await writeFile(path, buffer);
                    imagenConsigna = `/uploads/${fileName}`;
                } else if (typeof imageFile === 'string') {
                    // Usar la ruta directamente
                    imagenConsigna = imageFile;
                }
            }

            // Special handling for ROLES type
            let processedOpciones = fieldData.opciones;
            let processedRptaValida = fieldData.rptaValida;

            if (gameData.tipoJuego === 'ROLES') {
                // Process options to include images and correct status
                const options = fieldData.opciones || [];
                const processedOptions = await Promise.all(options.map(async (option: any, index: number) => {
                    const optionImage = formData.get(`opciones_${index}`) as File;
                    let imageUrl = null;

                    if (optionImage && optionImage instanceof File) {
                        const bytes = await optionImage.arrayBuffer();
                        const buffer = Buffer.from(bytes);
                        const fileName = `${Date.now()}-${optionImage.name}`;
                        const path = join(process.cwd(), 'public', 'uploads', fileName);
                        await writeFile(path, buffer);
                        imageUrl = `/uploads/${fileName}`;
                    }

                    return {
                        text: option.text || '',
                        isCorrect: option.isCorrect || false,
                        urlImg: imageUrl || option.urlImg || null
                    };
                }));

                processedOpciones = JSON.stringify(processedOptions);
                processedRptaValida = JSON.stringify(
                    processedOptions
                        .filter((opt: any) => opt.isCorrect)
                        .map((opt: any) => opt.text)
                );
            }

            // Create the game field
            const campoJuego = await prisma.campoJuego.create({
                data: {
                    tipoCampo: fieldData.tipoCampo,
                    titulo: fieldData.titulo || 'Campo de Juego',
                    consigna: fieldData.consigna || '',
                    rptaValida: processedRptaValida || '[]',
                    opciones: processedOpciones || '[]',
                    imagenConsigna: imagenConsigna ? JSON.stringify({ url: imagenConsigna }) : Prisma.JsonNull,
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

export async function GET() {
    try {
        const juegos = await prisma.juego.findMany({
            include: {
                juegoCampoJs: {
                    include: {
                        campoJuego: true
                    }
                }
            },
            orderBy: {
                fechaCreado: 'desc'
            }
        });

        // Custom replacer function to handle BigInt
        const replacer = (key: string, value: any) => {
            if (typeof value === 'bigint') {
                return value.toString();
            }
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        };

        const juegosSerializados = JSON.parse(JSON.stringify(juegos, replacer));

        return NextResponse.json({
            success: true,
            juegos: juegosSerializados
        });
    } catch (error) {
        console.error('Error fetching games:', error);
        return NextResponse.json(
            { error: 'Error al obtener los juegos' },
            { status: 500 }
        );
    }
} 