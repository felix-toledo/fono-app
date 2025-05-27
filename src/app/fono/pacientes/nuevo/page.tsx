'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { authService } from '@/services/authService';

// Types
type PacienteFormData = {
    persona: {
        nombre: string;
        apellido: string;
        dni: string;
        fechaNac: string;
        direccion?: string;
        telefono?: string;
        mail?: string;
    };
    escolaridad?: string;
    ocupacion?: string;
    obraSocial?: string;
    fechaAlta: string;
};

type Credentials = {
    username: string;
    password: string;
} | null;

export default function NuevoPaciente() {
    const router = useRouter();
    const [formData, setFormData] = useState<PacienteFormData>({
        persona: {
            nombre: '',
            apellido: '',
            dni: '',
            fechaNac: '',
            direccion: '',
            telefono: '',
            mail: ''
        },
        escolaridad: '',
        ocupacion: '',
        obraSocial: '',
        fechaAlta: new Date().toISOString().split('T')[0]
    });
    const [isLoading, setIsLoading] = useState(false);
    const [credentials, setCredentials] = useState<Credentials>(null);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('persona.')) {
            const field = name.split('.')[1];
            setFormData(prevData => ({
                ...prevData,
                persona: {
                    ...prevData.persona,
                    [field]: value
                }
            }));
        } else {
            setFormData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setCredentials(null);

        try {
            // Validate required fields
            if (!formData.persona.nombre.trim() || !formData.persona.apellido.trim() || !formData.persona.dni.trim()) {
                throw new Error('Por favor complete todos los campos requeridos');
            }

            // Convert dni and telefono to numbers
            const dni = parseFloat(formData.persona.dni.trim());
            const telefono = formData.persona.telefono?.trim() ? parseFloat(formData.persona.telefono.trim()) : null;

            if (isNaN(dni)) {
                throw new Error('El DNI debe ser un número válido');
            }

            if (telefono !== null && isNaN(telefono)) {
                throw new Error('El teléfono debe ser un número válido');
            }

            // Get current fono data from localStorage
            const userSession = localStorage.getItem('userSession');
            if (!userSession) {
                throw new Error('No se pudo obtener la información del fonoaudiólogo');
            }

            const fonoData = JSON.parse(userSession);
            if (!fonoData.FonoId) {
                throw new Error('No se pudo obtener el ID del fonoaudiólogo');
            }

            const pacienteData = {
                persona: {
                    nombre: formData.persona.nombre.trim(),
                    apellido: formData.persona.apellido.trim(),
                    dni: dni.toString(),
                    fechaNac: new Date(formData.persona.fechaNac),
                    direccion: formData.persona.direccion?.trim() || undefined,
                    telefono: telefono?.toString() || undefined,
                    mail: formData.persona.mail?.trim() || undefined
                },
                escolaridad: formData.escolaridad?.trim() || undefined,
                ocupacion: formData.ocupacion?.trim() || undefined,
                obraSocial: formData.obraSocial?.trim() || undefined,
                fechaAlta: new Date(formData.fechaAlta),
                fonoId: fonoData.FonoId
            };

            const response = await fetch('/api/pacientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pacienteData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al crear el paciente');
            }

            const result = await response.json();
            setCredentials(result.data.usuario);
            toast.success('Paciente creado exitosamente');

        } catch (error: any) {
            console.error('Error al guardar paciente:', error);
            toast.error(error instanceof Error ? error.message : 'Error al guardar el paciente. Por favor, intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={() => router.push('/fono/pacientes')} className="mr-">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <h1 className="text-2xl font-bold">Nuevo Paciente</h1>
            </div>

            <Card className="p-6">
                {credentials ? (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-green-800 mb-2">¡Paciente creado exitosamente!</h3>
                            <p className="text-green-700 mb-4">Las credenciales de acceso para el paciente son:</p>
                            <div className="space-y-2">
                                <p><span className="font-medium">Usuario:</span> {credentials.username}</p>
                                <p><span className="font-medium">Contraseña:</span> {credentials.password}</p>
                            </div>
                            <p className="text-sm text-green-600 mt-4">
                                Por favor, guarde estas credenciales y compártalas con el paciente.
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={() => router.push('/fono/pacientes')}>
                                Volver a la lista de pacientes
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="persona.nombre" className="text-sm font-medium">Nombre</label>
                                <Input
                                    id="persona.nombre"
                                    name="persona.nombre"
                                    value={formData.persona.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="persona.apellido" className="text-sm font-medium">Apellido</label>
                                <Input
                                    id="persona.apellido"
                                    name="persona.apellido"
                                    value={formData.persona.apellido}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="persona.dni" className="text-sm font-medium">DNI</label>
                                <Input
                                    id="persona.dni"
                                    name="persona.dni"
                                    value={formData.persona.dni}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="persona.fechaNac" className="text-sm font-medium">Fecha de Nacimiento</label>
                                <Input
                                    id="persona.fechaNac"
                                    name="persona.fechaNac"
                                    type="date"
                                    value={formData.persona.fechaNac}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="persona.direccion" className="text-sm font-medium">Dirección</label>
                                <Input
                                    id="persona.direccion"
                                    name="persona.direccion"
                                    value={formData.persona.direccion}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="persona.telefono" className="text-sm font-medium">Teléfono</label>
                                <Input
                                    id="persona.telefono"
                                    name="persona.telefono"
                                    value={formData.persona.telefono}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="persona.mail" className="text-sm font-medium">Email</label>
                                <Input
                                    id="persona.mail"
                                    name="persona.mail"
                                    type="email"
                                    value={formData.persona.mail}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="obraSocial" className="text-sm font-medium">Obra Social</label>
                                <Input
                                    id="obraSocial"
                                    name="obraSocial"
                                    value={formData.obraSocial}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="escolaridad" className="text-sm font-medium">Escolaridad</label>
                                <Input
                                    id="escolaridad"
                                    name="escolaridad"
                                    value={formData.escolaridad}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="ocupacion" className="text-sm font-medium">Ocupación</label>
                                <Input
                                    id="ocupacion"
                                    name="ocupacion"
                                    value={formData.ocupacion}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/fono/pacientes')}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
}
