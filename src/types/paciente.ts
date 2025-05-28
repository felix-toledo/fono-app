export interface Paciente {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    fechaNacimiento: Date;
    genero: string;
    direccion: string;
    telefono: string;
    email: string;
    tieneHistoriaClinica: boolean;
    persona: {
        nombre: string;
        apellido: string;
        dni: string;
    };
} 