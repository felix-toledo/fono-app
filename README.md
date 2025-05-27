# Fono App

Aplicación web para la gestión de pacientes y seguimiento de tratamientos fonoaudiológicos.

## Descripción

Fono App es una plataforma diseñada para fonoaudiólogos que permite:
- Gestionar pacientes y sus historias clínicas
- Realizar evaluaciones y diagnósticos
- Planificar tratamientos
- Seguimiento de evoluciones
- Gestión de turnos
- Juegos y ejercicios interactivos para pacientes

## Requisitos Previos

- Node.js (versión 18 o superior)
- PostgreSQL (versión 14 o superior)
- npm o yarn

## Configuración del Proyecto

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd fono-app
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:
```env
JWT_SECRET=secret-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/fono_app"
```

4. Configurar la base de datos:
```bash
# Crear la base de datos en PostgreSQL
createdb fono_app

# Ejecutar las migraciones de Prisma
npx prisma migrate dev

# Ejecutar el seed para crear el usuario fonoaudiologo por defecto
npx prisma db seed
```

5. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Credenciales por Defecto

Se crea automáticamente un usuario fonoaudiologo con las siguientes credenciales:
- Usuario: fono
- Contraseña: fono123

## Estructura del Proyecto

- `/app` - Componentes y páginas de Next.js
- `/prisma` - Esquema y migraciones de la base de datos
- `/public` - Archivos estáticos
- `/components` - Componentes reutilizables
- `/lib` - Utilidades y configuraciones

## Tecnologías Principales

- Next.js 14
- Prisma ORM
- PostgreSQL
- TypeScript
- Tailwind CSS

## Comandos Útiles

```bash
# Ejecutar migraciones
npx prisma migrate dev

# Actualizar el cliente de Prisma
npx prisma generate

# Abrir Prisma Studio (interfaz visual para la base de datos)
npx prisma studio

# Ejecutar el seed
npx prisma db seed
```

## Contribución

1. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
2. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
3. Push a la rama (`git push origin feature/AmazingFeature`)
4. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
