import { PrismaClient, TipoUsuario } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    // Create default fonoaudiologo user
    const hashedPassword = await bcrypt.hash('pass123', 10)

    const persona = await prisma.persona.create({
        data: {
            nombre: 'Gilda',
            apellido: 'Romero',
            dni: 20876532,
            fechaNac: new Date('1990-01-01'),
            direccion: 'Calle Principal 123',
            telefono: 1234567890,
            mail: 'fonoprueba@gmail.com',
            usuario: {
                create: {
                    username: 'gilda',
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

    // const safariGame = await prisma.juego.create({
    //     data: {
    //         titulo: 'safari',
    //         rama: 'Semantica',
    //         rangoEdad: 'TODOS',
    //         descripcion: 'Encuentra todos los animales escondidos en la jungla',
    //         nivelDificultad: 1,
    //         experienciaDada: 10,
    //         estado: true,
    //         fonoIdCreado: 1,
    //         fechaCreado: new Date(),
    //         tipoJuego: 'EMOCIONES'
    //     }
    // });
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 