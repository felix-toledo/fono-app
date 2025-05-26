import { NextResponse } from 'next/server';
import { PrismaClient, TipoUsuario, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// Helper function to serialize BigInt values
function serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'bigint') {
        return obj.toString();
    }

    if (Array.isArray(obj)) {
        return obj.map(serializeBigInt);
    }

    if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            result[key] = serializeBigInt(obj[key]);
        }
        return result;
    }

    return obj;
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { persona, escolaridad, ocupacion, obraSocial, fechaAlta, fonoId } = data;

        // Check if a person with this DNI already exists
        const existingPerson = await prisma.persona.findUnique({
            where: { dni: persona.dni },
            include: {
                paciente: true,
                usuario: true
            }
        });

        if (existingPerson) {
            // If the person exists but doesn't have a patient record, we can create one
            if (!existingPerson.paciente) {
                // Generate a random password
                const randomPassword = randomBytes(8).toString('hex');
                const passwordHash = await bcrypt.hash(randomPassword, 10);

                // Create username from DNI
                const username = `paciente_${persona.dni}`;

                // Create everything in a transaction
                const result = await prisma.$transaction(async (tx) => {
                    // 1. Create Usuario if it doesn't exist
                    let usuario = existingPerson.usuario;
                    if (!usuario) {
                        usuario = await tx.usuario.create({
                            data: {
                                personaId: existingPerson.id,
                                perfil: TipoUsuario.PACIENTE,
                                username,
                                passwordHash,
                                activo: true
                            }
                        });
                    }

                    // 2. Create Paciente
                    const newPaciente = await tx.paciente.create({
                        data: {
                            personaId: existingPerson.id,
                            escolaridad,
                            ocupacion,
                            obraSocial,
                            fechaAlta
                        }
                    });

                    // 3. Create FonoPaciente relationship if fonoId is provided
                    if (fonoId) {
                        await tx.fonoPaciente.create({
                            data: {
                                pacienteId: newPaciente.id,
                                fonoId: BigInt(fonoId),
                                fechaAsignacion: new Date()
                            }
                        });
                    }

                    return {
                        paciente: newPaciente,
                        usuario: {
                            username,
                            password: randomPassword
                        }
                    };
                });

                const serializedResult = serializeBigInt(result);
                return NextResponse.json({
                    message: 'Paciente creado exitosamente para persona existente',
                    data: serializedResult
                });
            } else {
                return NextResponse.json(
                    { message: 'Ya existe un paciente con este DNI' },
                    { status: 400 }
                );
            }
        }

        // If no existing person, proceed with normal creation
        const randomPassword = randomBytes(8).toString('hex');
        const passwordHash = await bcrypt.hash(randomPassword, 10);
        const username = `paciente_${persona.dni}`;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Persona
            const newPersona = await tx.persona.create({
                data: {
                    nombre: persona.nombre,
                    apellido: persona.apellido,
                    dni: persona.dni,
                    fechaNac: persona.fechaNac,
                    direccion: persona.direccion,
                    telefono: persona.telefono,
                    mail: persona.mail
                }
            });

            // 2. Create Usuario
            const newUsuario = await tx.usuario.create({
                data: {
                    personaId: newPersona.id,
                    perfil: TipoUsuario.PACIENTE,
                    username,
                    passwordHash,
                    activo: true
                }
            });

            // 3. Create Paciente
            const newPaciente = await tx.paciente.create({
                data: {
                    personaId: newPersona.id,
                    escolaridad,
                    ocupacion,
                    obraSocial,
                    fechaAlta
                }
            });

            // 4. Create FonoPaciente relationship if fonoId is provided
            if (fonoId) {
                await tx.fonoPaciente.create({
                    data: {
                        pacienteId: newPaciente.id,
                        fonoId: BigInt(fonoId),
                        fechaAsignacion: new Date()
                    }
                });
            }

            return {
                paciente: newPaciente,
                usuario: {
                    username,
                    password: randomPassword
                }
            };
        });

        const serializedResult = serializeBigInt(result);
        return NextResponse.json({
            message: 'Paciente creado exitosamente',
            data: serializedResult
        });

    } catch (error: any) {
        console.error('Error creating patient:', error);

        // Handle specific Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return NextResponse.json(
                    { message: 'Ya existe una persona con este DNI' },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { message: error.message || 'Error al crear el paciente' },
            { status: 500 }
        );
    }
} 