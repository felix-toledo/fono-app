import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'No text provided' },
                { status: 400 }
            );
        }

        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy", // Puedes elegir entre: alloy, echo, fable, onyx, nova, shimmer
            input: text,
        });

        // Convertir el buffer a base64
        const buffer = Buffer.from(await mp3.arrayBuffer());
        const base64Audio = buffer.toString('base64');

        return NextResponse.json({ audio: base64Audio });
    } catch (error) {
        console.error('Speech synthesis error:', error);
        return NextResponse.json(
            { error: 'Error generating speech' },
            { status: 500 }
        );
    }
}
