import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import os from 'os';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
    let tempFilePath: string | null = null;

    try {
        const formData = await request.formData();
        const file = formData.get('audio') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create a temporary file in the system's temp directory
        tempFilePath = join(os.tmpdir(), `audio-${Date.now()}.webm`);
        await writeFile(tempFilePath, buffer);

        const resp = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: 'gpt-4o-mini-transcribe'
        });

        return NextResponse.json({ text: resp.text });
    } catch (error) {
        console.error('Transcription error:', error);
        return NextResponse.json(
            { error: 'Error processing audio file' },
            { status: 500 }
        );
    } finally {
        // Clean up the temporary file
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (error) {
                console.error('Error cleaning up temp file:', error);
            }
        }
    }
}
