import { PrismaClient, TipoUsuario } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    // Create default fonoaudiologo user
    const hashedPassword = await bcrypt.hash('prueba123', 10)

    const persona = await prisma.persona.create({
        data: {
            nombre: 'Fono',
            apellido: 'Prueba',
            dni: 40999888,
            fechaNac: new Date('1990-01-01'),
            direccion: 'Calle Principal 123',
            telefono: 1234567890,
            mail: 'fonoprueba@gmail.com',
            usuario: {
                create: {
                    username: 'fono.prueba',
                    passwordHash: hashedPassword,
                    perfil: TipoUsuario.FONO,
                    activo: true
                }
            },
            fonoaudiologo: {
                create: {
                    matricula: 'prueba123',
                    direccionConsultorio: 'Consultorio Principal 123',
                    fechaAlta: new Date()
                }
            }
        }
    })

}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 