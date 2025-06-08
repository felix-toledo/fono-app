import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

        const { currentPassword, newPassword } = await request.json();

        // Get user with password
        const user = await prisma.usuario.findUnique({
            where: { id: userId },
            select: { passwordHash: true }
        });

        if (!user) {
            console.error('User not found for userId:', userId); // Debug log
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(
            currentPassword,
            user.passwordHash
        );

        if (!isValidPassword) {
            console.error('Invalid current password'); // Debug log
            return NextResponse.json(
                { error: 'Contraseña actual incorrecta' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        const updatedUser = await prisma.usuario.update({
            where: { id: userId },
            data: { passwordHash: hashedPassword }
        });


        return NextResponse.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return NextResponse.json(
            { error: 'Error al cambiar la contraseña' },
            { status: 500 }
        );
    }
} 