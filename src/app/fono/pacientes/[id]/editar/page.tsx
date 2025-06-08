'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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

export default function EditarPaciente({ params }: { params: { id: string } }) {
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
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchPaciente();
    }, [params.id]);

    const fetchPaciente = async () => {
        try {
            const response = await fetch(`/api/pacientes/${params.id}`);
            if (!response.ok) {
                throw new Error('Error al cargar los datos del paciente');
            }

            const data = await response.json();

            setFormData({
                persona: {
                    nombre: data.persona.nombre,
                    apellido: data.persona.apellido,
                    dni: data.persona.dni,
                    fechaNac: data.persona.fechaNac ? data.persona.fechaNac.split('T')[0] : '',
                    direccion: data.persona.direccion || '',
                    telefono: data.persona.telefono || '',
                    mail: data.persona.mail || ''
                },
                escolaridad: data.escolaridad || '',
                ocupacion: data.ocupacion || '',
                obraSocial: data.obraSocial || '',
                fechaAlta: data.fechaAlta || new Date().toISOString().split('T')[0]
            });
        } catch (error: any) {
            console.error('Error al cargar paciente:', error);
            toast.error(error.message || 'Error al cargar los datos del paciente');
            router.push('/fono/pacientes');
        } finally {
            setIsLoading(false);
        }
    };

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
        setIsSaving(true);

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

            // Validar y formatear la fecha de nacimiento
            const fechaNac = new Date(formData.persona.fechaNac);
            if (isNaN(fechaNac.getTime())) {
                throw new Error('Error en el formato de fecha de nacimiento');
            }

            const pacienteData = {
                persona: {
                    nombre: formData.persona.nombre.trim(),
                    apellido: formData.persona.apellido.trim(),
                    dni: dni.toString(),
                    fechaNac: fechaNac,
                    direccion: formData.persona.direccion?.trim() || undefined,
                    telefono: telefono?.toString() || undefined,
                    mail: formData.persona.mail?.trim() || undefined
                },
                escolaridad: formData.escolaridad?.trim() || undefined,
                ocupacion: formData.ocupacion?.trim() || undefined,
                obraSocial: formData.obraSocial?.trim() || undefined
            };

            const response = await fetch(`/api/pacientes/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pacienteData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al actualizar el paciente');
            }

            toast.success('Paciente actualizado exitosamente');
            router.push('/fono/pacientes');

        } catch (error: any) {
            console.error('Error al actualizar paciente:', error);
            toast.error(error instanceof Error ? error.message : 'Error al actualizar el paciente. Por favor, intente nuevamente.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" onClick={() => router.push('/fono/pacientes')} className="mr-">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <h1 className="text-2xl font-bold">Editar Paciente</h1>
                </div>
                <Card className="p-6">
                    <div className="text-center text-gray-500">Cargando datos del paciente...</div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={() => router.push('/fono/pacientes')} className="mr-">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <h1 className="text-2xl font-bold">Editar Paciente</h1>
            </div>

            <Card className="p-6">
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
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
} 