"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
    Search,
    User,
    Trash2,
    Calendar,
    FileText,
    Phone,
    Mail,
    Filter,
    ChevronDown,
    ChevronUp,
    MapPin,
    GraduationCap,
    Briefcase,
    Pencil,
    KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DeletePatientModal } from '@/modules/fono/components/modals/DeletePatientModal';
import { Loader } from '@/components/Loader';

type Paciente = {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    telefono?: string;
    mail?: string;
    direccion?: string;
    obraSocial?: string;
    escolaridad?: string;
    ocupacion?: string;
    fechaAlta: string;
    estado: 'activo' | 'inactivo' | 'pendiente';
    ultimaConsulta?: string;
    tieneHistoriaClinica: boolean;
};

export default function PacientesPage() {
    const router = useRouter();
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof Paciente>('nombre');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'inactivo' | 'pendiente'>('todos');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
    const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [newPasswordModalOpen, setNewPasswordModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchPacientes();
    }, []);

    const fetchPacientes = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const userSession = localStorage.getItem('userSession');
            if (!userSession) {
                throw new Error('No se pudo obtener la información del fonoaudiólogo');
            }

            const fonoData = JSON.parse(userSession);
            if (!fonoData.FonoId) {
                throw new Error('No se pudo obtener el ID del fonoaudiólogo');
            }

            const response = await fetch(`/api/fono/pacientes?fonoId=${fonoData.FonoId}`);
            if (!response.ok) {
                throw new Error('Error al cargar los pacientes');
            }

            const data = await response.json();
            setPacientes(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar los pacientes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSort = (field: keyof Paciente) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredPacientes = pacientes
        .filter(paciente => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                paciente.nombre.toLowerCase().includes(searchLower) ||
                paciente.apellido.toLowerCase().includes(searchLower) ||
                paciente.dni.includes(searchTerm) ||
                (paciente.obraSocial?.toLowerCase().includes(searchLower) ?? false) ||
                (paciente.escolaridad?.toLowerCase().includes(searchLower) ?? false) ||
                (paciente.ocupacion?.toLowerCase().includes(searchLower) ?? false);

            const matchesStatus = statusFilter === 'todos' || paciente.estado === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return 0;
        });

    const getStatusBadge = (estado: Paciente['estado']) => {
        const variants = {
            activo: 'bg-green-100 text-green-800',
            inactivo: 'bg-gray-100 text-gray-800',
            pendiente: 'bg-yellow-100 text-yellow-800'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[estado]}`}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </span>
        );
    };

    const handleDelete = async (pacienteId: number) => {
        const paciente = pacientes.find(p => p.id === pacienteId);
        if (!paciente) return;

        setSelectedPaciente(paciente);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedPaciente) return;

        try {
            const response = await fetch(`/api/pacientes/${selectedPaciente.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el paciente');
            }

            // Refresh the patients list
            fetchPacientes();
            toast.success('Paciente eliminado exitosamente');
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar el paciente');
        } finally {
            setDeleteModalOpen(false);
            setSelectedPaciente(null);
        }
    };

    const handleResetPassword = async (pacienteId: number) => {
        const paciente = pacientes.find(p => p.id === pacienteId);
        if (!paciente) return;

        setSelectedPaciente(paciente);
        setResetPasswordModalOpen(true);
    };

    const handleConfirmResetPassword = async () => {
        if (!selectedPaciente) return;

        try {
            setIsResettingPassword(true);
            const response = await fetch(`/api/pacientes/${selectedPaciente.id}/reset-password`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Error al resetear la contraseña');
            }

            const data = await response.json();
            setNewPassword(data.password);
            setResetPasswordModalOpen(false);
            setNewPasswordModalOpen(true);
        } catch (error: any) {
            toast.error(error.message || 'Error al resetear la contraseña');
        } finally {
            setIsResettingPassword(false);
            setSelectedPaciente(null);
        }
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(newPassword);
        toast.success('Contraseña copiada al portapapeles');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Mis Pacientes</h1>
                <Button className='text-white' onClick={() => router.push('/fono/pacientes/nuevo')}>
                    <User className="h-4 w-4 mr-2" />
                    Nuevo Paciente
                </Button>
            </div>

            <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Buscar por nombre, apellido, DNI, obra social, escolaridad o ocupación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'todos' | 'activo' | 'inactivo' | 'pendiente')}
                        className="w-full md:w-auto px-3 py-2 border rounded-md"
                    >
                        <option value="todos">Todos</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                        <option value="pendiente">Pendientes</option>
                    </select>
                </div>

                {isLoading ? (
                    <Loader />
                ) : error ? (
                    <div className="text-red-500 text-center py-4">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('nombre')}
                                    >
                                        <div className="flex items-center">
                                            Nombre
                                            {sortField === 'nombre' && (
                                                sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        DNI
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contacto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Información
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('estado')}
                                    >
                                        <div className="flex items-center">
                                            Estado
                                            {sortField === 'estado' && (
                                                sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('ultimaConsulta')}
                                    >
                                        <div className="flex items-center">
                                            Última Consulta
                                            {sortField === 'ultimaConsulta' && (
                                                sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPacientes.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                            No se encontraron pacientes
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPacientes.map((paciente) => (
                                        <tr key={paciente.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {paciente.nombre} {paciente.apellido}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {paciente.dni}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col space-y-1">
                                                    {paciente.telefono && (
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Phone className="h-4 w-4 mr-1" />
                                                            {paciente.telefono}
                                                        </div>
                                                    )}
                                                    {paciente.mail && (
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Mail className="h-4 w-4 mr-1" />
                                                            {paciente.mail}
                                                        </div>
                                                    )}
                                                    {paciente.direccion && (
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <MapPin className="h-4 w-4 mr-1" />
                                                            {paciente.direccion}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col space-y-1">
                                                    {paciente.obraSocial && (
                                                        <div className="text-sm text-gray-500">
                                                            {paciente.obraSocial}
                                                        </div>
                                                    )}
                                                    {paciente.escolaridad && (
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <GraduationCap className="h-4 w-4 mr-1" />
                                                            {paciente.escolaridad}
                                                        </div>
                                                    )}
                                                    {paciente.ocupacion && (
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Briefcase className="h-4 w-4 mr-1" />
                                                            {paciente.ocupacion}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(paciente.estado)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {paciente.ultimaConsulta || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Link href={`/fono/pacientes/${paciente.id}/historia`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title="Historia Clínica"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                    </Link>

                                                    <Link href={`/fono/pacientes/${paciente.id}/turnos`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title="Turnos"
                                                        >
                                                            <Calendar className="h-4 w-4" />
                                                        </Button>
                                                    </Link>

                                                    <Link href={`/fono/pacientes/${paciente.id}/editar`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title="Editar Paciente"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Resetear Contraseña"
                                                        onClick={() => handleResetPassword(paciente.id)}
                                                    >
                                                        <KeyRound className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Eliminar Paciente"
                                                        onClick={() => handleDelete(paciente.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <DeletePatientModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                paciente={selectedPaciente as any}
            />

            {/* Reset Password Modal */}
            {resetPasswordModalOpen && selectedPaciente && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="mb-4 text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                                    <KeyRound className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Resetear Contraseña</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    ¿Estás seguro de que deseas resetear la contraseña de <strong>{selectedPaciente.nombre} {selectedPaciente.apellido}</strong>?
                                </p>
                                <p className="text-sm text-blue-500 mt-2 font-medium">
                                    Se generará una nueva contraseña aleatoria que deberás compartir con el paciente.
                                </p>
                            </div>
                            <div className="mt-5 flex justify-center gap-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setResetPasswordModalOpen(false)}
                                    disabled={isResettingPassword}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={handleConfirmResetPassword}
                                    disabled={isResettingPassword}
                                >
                                    {isResettingPassword ? 'Reseteando...' : 'Resetear'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* New Password Modal */}
            {newPasswordModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="mb-4 text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                    <KeyRound className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Nueva Contraseña Generada</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    La nueva contraseña para el paciente es:
                                </p>
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <code className="text-lg font-mono">{newPassword}</code>
                                </div>
                                <p className="text-sm text-gray-500 mt-4">
                                    Por favor, copie esta contraseña y compártala con el paciente de manera segura.
                                </p>
                            </div>
                            <div className="mt-5 flex justify-center gap-6">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setNewPasswordModalOpen(false);
                                        setNewPassword('');
                                    }}
                                >
                                    Cerrar
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={handleCopyPassword}
                                >
                                    Copiar Contraseña
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}