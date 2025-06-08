import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const pictogramsDir = path.join(process.cwd(), 'public', 'pictograms');
        const files = fs.readdirSync(pictogramsDir);

        // Filtrar solo archivos de imagen
        const imageFiles = files.filter(file =>
            file.endsWith('.webp') ||
            file.endsWith('.png') ||
            file.endsWith('.jpg') ||
            file.endsWith('.jpeg')
        );

        return NextResponse.json({ images: imageFiles });
    } catch (error) {
        console.error('Error reading pictograms directory:', error);
        return NextResponse.json(
            { error: 'Error reading pictograms directory' },
            { status: 500 }
        );
    }
} 