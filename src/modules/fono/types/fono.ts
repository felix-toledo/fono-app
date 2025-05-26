export interface DatosFono {
    UserId: number | string;
    FonoId: number | string;
    PersonaId: number | string;
    Nombre: string;
    Apellido: string;
    DNI: string;
    Direccion: string;
    DireccionConsultorio: string;
    Email: string;
    FechaAltaFono: string; // ISO date string
    FechaCreacionUsuario: string; // ISO date string
    FechaNacimiento: string; // ISO date string
    Matricula: string;
    Telefono: string;
    Username: string;
    UsuarioActivo: boolean;
    perfil: string;
    FotoPerfil: string;
}