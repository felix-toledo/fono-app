import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const pacienteId = parseInt(params.id);
        if (isNaN(pacienteId)) {
            return NextResponse.json(
                { message: 'ID de paciente inválido' },
                { status: 400 }
            );
        }

        // Get the patient and associated user
        const paciente = await prisma.paciente.findUnique({
            where: { id: pacienteId },
            include: {
                persona: {
                    include: {
                        usuario: true
                    }
                }
            }
        });

        if (!paciente) {
            return NextResponse.json(
                { message: 'Paciente no encontrado' },
                { status: 404 }
            );
        }

        if (!paciente.persona.usuario) {
            return NextResponse.json(
                { message: 'El paciente no tiene una cuenta de usuario asociada' },
                { status: 400 }
            );
        }

        // Generate a new random password
        const newPassword = randomBytes(8).toString('hex');
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        await prisma.usuario.update({
            where: { id: paciente.persona.usuario.id },
            data: {
                passwordHash
            }
        });

        return NextResponse.json({
            message: 'Contraseña reseteada exitosamente',
            password: newPassword
        });

    } catch (error: any) {
        console.error('Error resetting password:', error);
        return NextResponse.json(
            { message: error.message || 'Error al resetear la contraseña' },
            { status: 500 }
        );
    }
} 