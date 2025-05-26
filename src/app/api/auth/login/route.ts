import { NextResponse } from 'next/server';
import { PrismaClient, TipoUsuario } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        // Buscar usuario por username
        const usuario = await prisma.usuario.findFirst({
            where: { username: username as string },
            include: {
                persona: true
            }
        });

        if (!usuario) {
            return NextResponse.json(
                { message: 'Usuario incorrecto' },
                { status: 401 }
            );
        }

        // Verificar si el usuario está activo
        if (!usuario.activo) {
            return NextResponse.json(
                { message: 'Usuario inactivo' },
                { status: 401 }
            );
        }

        // Verificar contraseña
        const passwordMatch = await bcrypt.compare(password, usuario.passwordHash);
        if (!passwordMatch) {
            return NextResponse.json(
                { message: 'Contraseña incorrecta' },
                { status: 401 }
            );
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                userId: usuario.id.toString(),
                perfil: usuario.perfil
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Enviar respuesta
        return NextResponse.json({
            user: {
                id: usuario.id.toString(),
                username: usuario.username,
                perfil: usuario.perfil,
                persona: {
                    nombre: usuario.persona.nombre,
                    apellido: usuario.persona.apellido,
                    mail: usuario.persona.mail,
                    dni: usuario.persona.dni,
                    fechaNac: usuario.persona.fechaNac,
                    direccion: usuario.persona.direccion,
                    telefono: usuario.persona.telefono
                }
            },
            token
        });
    } catch (error) {
        console.error('Error en login:', error);
        return NextResponse.json(
            { message: 'Error al iniciar sesión' },
            { status: 500 }
        );
    }
} 