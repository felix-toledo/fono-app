'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Calendar as CalendarIcon, Clock, CalendarCheck, CheckSquare, ChevronLeft, ChevronRight, Plus, UserPlus, Users, Info, X, Edit2 } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useFono } from '@/contexts/FonoContext';
import { Loader } from '@/components/Loader';
import { DeleteAppointmentModal } from '@/modules/fono/components/modals/DeleteAppointmentModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EvolucionFono } from '@/components/historia-clinica/EvolucionFono';

// Tipo para los horarios
type TimeSlot = {
    id: string;
    time: string;
    label: 'Mañana' | 'Tarde';
    status: 'available' | 'booked';
};

const Turnos = () => {
    const { getFonoId, isLoading: isLoadingSession } = useFono();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [showNewTurnoForm, setShowNewTurnoForm] = useState<boolean>(false);
    const [nuevoPaciente, setNuevoPaciente] = useState<string>('');
    const [nuevoTipoSesion, setNuevoTipoSesion] = useState<string>('Sesión regular');
    const [nuevaNota, setNuevaNota] = useState<string>('');
    const [turnosDelDia, setTurnosDelDia] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pacientes, setPacientes] = useState<any[]>([]);
    const [isLoadingPacientes, setIsLoadingPacientes] = useState(false);
    const [turnoEditando, setTurnoEditando] = useState<any | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [turnoToDelete, setTurnoToDelete] = useState<any | null>(null);
    const [showEvolucionModal, setShowEvolucionModal] = useState(false);
    const [selectedTurno, setSelectedTurno] = useState<any | null>(null);

    // Horarios predefinidos
    const [timeSlots] = useState<TimeSlot[]>([
        { id: '1', time: '09:00', label: 'Mañana', status: 'available' },
        { id: '2', time: '10:00', label: 'Mañana', status: 'available' },
        { id: '3', time: '11:00', label: 'Mañana', status: 'available' },
        { id: '4', time: '12:00', label: 'Mañana', status: 'available' },
        { id: '5', time: '14:00', label: 'Tarde', status: 'available' },
        { id: '6', time: '15:00', label: 'Tarde', status: 'available' },
        { id: '7', time: '16:00', label: 'Tarde', status: 'available' },
        { id: '8', time: '17:00', label: 'Tarde', status: 'available' },
    ]);

    // Agrupar por mañana y tarde
    const morningSlots = timeSlots.filter(slot => slot.label === 'Mañana');
    const afternoonSlots = timeSlots.filter(slot => slot.label === 'Tarde');

    // Función para formatear la hora en formato 12 horas con AM/PM
    const formatearHora = (hora: string) => {
        const [hours, minutes] = hora.split(':');
        const horaNum = parseInt(hours);
        const ampm = horaNum >= 12 ? 'PM' : 'AM';
        const hora12 = horaNum % 12 || 12;
        return `${hora12}:${minutes} ${ampm}`;
    };

    // Función para cargar los turnos del día seleccionado
    const cargarTurnosDelDia = async (fecha: Date) => {
        try {
            setIsLoading(true);
            setError(null);
            const fechaFormateada = format(fecha, 'dd/MM/yyyy');
            const fonoId = getFonoId();
            console.log('Cargando turnos para fecha:', fechaFormateada, 'fonoId:', fonoId);

            const response = await fetch(`/api/fono/turnos?fecha=${fechaFormateada}&fonoId=${fonoId}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al cargar los turnos');
            }

            const data = await response.json();
            console.log('Turnos cargados:', data);
            setTurnosDelDia(data);
        } catch (error) {
            console.error('Error al cargar turnos:', error);
            setError(error instanceof Error ? error.message : 'Error al cargar los turnos');
        } finally {
            setIsLoading(false);
        }
    };

    // Función para cargar los pacientes
    const cargarPacientes = async () => {
        try {
            setIsLoadingPacientes(true);
            const fonoId = getFonoId();
            const response = await fetch(`/api/fono/pacientes?fonoId=${fonoId}`);

            if (!response.ok) {
                throw new Error('Error al cargar los pacientes');
            }

            const data = await response.json();
            setPacientes(data);
        } catch (error) {
            console.error('Error:', error);
            setError('Error al cargar los pacientes');
        } finally {
            setIsLoadingPacientes(false);
        }
    };

    // Cargar datos iniciales
    useEffect(() => {
        if (!isLoadingSession) {
            cargarPacientes();
            cargarTurnosDelDia(selectedDate);
        }
    }, [isLoadingSession, selectedDate]);

    // Agregar esta función para verificar si una fecha es anterior a hoy
    const esFechaAnterior = (fecha: Date) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaComparar = new Date(fecha);
        fechaComparar.setHours(0, 0, 0, 0);
        return fechaComparar < hoy;
    };

    // Función para manejar la edición de un turno
    const handleEdit = (turno: any) => {
        setTurnoEditando(turno);
        setNuevoPaciente(turno.pacienteId.toString());
        setNuevoTipoSesion(turno.tipo || 'Sesión regular');
        setNuevaNota(turno.notas || '');
        setSelectedSlot(timeSlots.find(slot => slot.time === turno.horario)?.id || null);
        setShowNewTurnoForm(true);
    };

    // Función para manejar la eliminación de un turno
    const handleDelete = async (turno: any) => {
        // Verificar si el turno es de un día anterior
        const fechaTurno = new Date(turno.fecha.split('/').reverse().join('-'));
        if (esFechaAnterior(fechaTurno)) {
            toast.error('No se pueden eliminar turnos de días anteriores');
            return;
        }

        setTurnoToDelete(turno);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!turnoToDelete) return;

        try {
            setIsLoading(true);
            setError(null);
            const fonoId = getFonoId();

            const response = await fetch(`/api/fono/turnos?id=${turnoToDelete.id}&fonoId=${fonoId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar el turno');
            }

            // Recargar los turnos del día
            await cargarTurnosDelDia(selectedDate);
            toast.success('Turno eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar turno:', error);
            toast.error(error instanceof Error ? error.message : 'Error al eliminar el turno');
        } finally {
            setIsLoading(false);
            setShowDeleteModal(false);
            setTurnoToDelete(null);
        }
    };

    // Modificar el handleSubmit para manejar tanto la creación como la edición
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Iniciando operación de turno...');

        if (!selectedDate || !selectedSlot || !nuevoPaciente) {
            toast.error('Por favor completa todos los campos requeridos');
            return;
        }

        // Agregar validación de fecha
        if (esFechaAnterior(selectedDate)) {
            toast.error('No se pueden crear turnos para fechas anteriores');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const fonoId = getFonoId();
            const fechaFormateada = format(selectedDate, 'dd/MM/yyyy');
            const horarioSeleccionado = timeSlots.find(slot => slot.id === selectedSlot)?.time;

            const turnoData = {
                pacienteId: nuevoPaciente,
                fecha: fechaFormateada,
                horario: horarioSeleccionado,
                tipo: nuevoTipoSesion,
                notas: nuevaNota,
                fonoId
            };

            const response = await fetch('/api/fono/turnos', {
                method: turnoEditando ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(turnoEditando ? { ...turnoData, id: turnoEditando.id } : turnoData),
            });

            const responseData = await response.json();
            console.log('Respuesta del servidor:', responseData);

            if (!response.ok) {
                throw new Error(responseData.error || `Error al ${turnoEditando ? 'actualizar' : 'crear'} el turno`);
            }

            // Recargar los turnos del día
            await cargarTurnosDelDia(selectedDate);
            toast.success(`Turno ${turnoEditando ? 'actualizado' : 'creado'} exitosamente`);

            // Limpiar el formulario
            setShowNewTurnoForm(false);
            setNuevoPaciente('');
            setNuevoTipoSesion('Sesión regular');
            setNuevaNota('');
            setSelectedSlot(null);
            setTurnoEditando(null);
        } catch (error) {
            console.error(`Error al ${turnoEditando ? 'actualizar' : 'crear'} turno:`, error);
            toast.error(error instanceof Error ? error.message : `Error al ${turnoEditando ? 'actualizar' : 'crear'} el turno`);
        } finally {
            setIsLoading(false);
        }
    };

    // Agregar función para manejar el cambio de estado
    const handleStatusChange = async (turno: any, newStatus: 'REALIZADO' | 'CANCELADO') => {
        try {
            if (newStatus === 'REALIZADO') {
                // Primero necesitamos obtener el ID de la historia clínica
                const historiaResponse = await fetch(`/api/pacientes/${turno.pacienteId}/historia`);
                if (!historiaResponse.ok) {
                    const errorData = await historiaResponse.json();
                    throw new Error(errorData.error || 'No se encontró la historia clínica del paciente');
                }
                const historiaData = await historiaResponse.json();

                // Abrir el modal de evolución
                setSelectedTurno({
                    ...turno,
                    historiaClinicaId: historiaData.id
                });
                setShowEvolucionModal(true);
                return;
            }

            const response = await fetch(`/api/turnos/${turno.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estado: newStatus
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar el estado del turno');
            }

            // Recargar los turnos del día
            await cargarTurnosDelDia(selectedDate);
            toast.success(`Turno ${newStatus as string === 'REALIZADO' ? 'marcado como realizado' : 'cancelado'} exitosamente`);
        } catch (error) {
            console.error('Error updating appointment status:', error);
            toast.error(error instanceof Error ? error.message : 'Error al actualizar el estado del turno');
        }
    };

    // Agregar función para manejar el guardado de la evolución
    const handleEvolucionSave = async (evolucionData: any) => {
        try {
            if (!selectedTurno) return;

            // Primero guardamos la evolución
            const evolucionResponse = await fetch('/api/fono/pacientes/evolucion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...evolucionData,
                    historiaClinicaId: selectedTurno.historiaClinicaId,
                    fonoId: getFonoId()
                })
            });

            if (!evolucionResponse.ok) {
                const errorData = await evolucionResponse.json();
                throw new Error(errorData.error || 'Error al guardar la evolución');
            }

            // Luego actualizamos el estado del turno
            const turnoResponse = await fetch(`/api/turnos/${selectedTurno.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estado: 'REALIZADO'
                })
            });

            if (!turnoResponse.ok) {
                const errorData = await turnoResponse.json();
                throw new Error(errorData.error || 'Error al actualizar el estado del turno');
            }

            // Recargar los turnos del día
            await cargarTurnosDelDia(selectedDate);
            toast.success('Evolución guardada y turno marcado como realizado');
            setShowEvolucionModal(false);
            setSelectedTurno(null);
        } catch (error) {
            console.error('Error saving evolution:', error);
            toast.error(error instanceof Error ? error.message : 'Error al guardar la evolución');
        }
    };

    // Actualizar la sección de turnos del día para mostrar los turnos reales
    const renderTurnosDelDia = () => {
        if (isLoading) {
            return <Loader />;
        }

        if (error) {
            return <div className="text-red-500 text-center py-4">{error}</div>;
        }

        if (turnosDelDia.length === 0) {
            return <div className="text-gray-500 text-center py-4">No hay turnos para este día</div>;
        }

        return (
            <div className="space-y-3">
                {turnosDelDia.map(turno => (
                    <div key={turno.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{formatearHora(turno.horario)}</span>
                            <span className="text-sm text-gray-600">{turno.pacienteNombre}</span>
                        </div>
                        <div className="mt-2">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${turno.estado === 'CONFIRMADO' ? 'bg-green-100 text-green-800' :
                                turno.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                                    turno.estado === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                }`}>
                                {turno.estado}
                            </span>
                        </div>
                        <div className="flex justify-end space-x-2 mt-2">
                            {turno.estado === 'CONFIRMADO' && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusChange(turno, 'REALIZADO')}
                                    >
                                        Realizado
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleStatusChange(turno, 'CANCELADO')}
                                    >
                                        Cancelar
                                    </Button>
                                </>
                            )}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(turno)}
                            >
                                Editar
                            </Button>
                            <Button
                                className='text-white'
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(turno)}
                            >
                                Eliminar
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto py-8">
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:space-x-8">
                    {/* COLUMNA IZQUIERDA: CALENDARIO */}
                    <div className="md:w-2/3">
                        <h2 className="text-xl font-bold mb-4">Calendario de turnos</h2>
                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-white p-2">
                            <Calendar
                                onChange={(date) => setSelectedDate(date as Date)}
                                value={selectedDate}
                                locale="es-ES"
                                calendarType="iso8601"
                                className="!border-0 !shadow-none !bg-white calendar-minimal"
                                tileClassName={({ date, view }) => {
                                    if (view !== 'month') return undefined;

                                    const today = new Date();
                                    const isToday = date.getDate() === today.getDate() &&
                                        date.getMonth() === today.getMonth() &&
                                        date.getFullYear() === today.getFullYear();

                                    return `text-sm !rounded !border-0 !shadow-none hover:!bg-gray-100 focus:!bg-primary/10 ${isToday ? '!bg-green-200 hover:!bg-green-600' : ''
                                        }`;
                                }}
                                prevLabel={<ChevronLeft className="w-4 h-4" />}
                                nextLabel={<ChevronRight className="w-4 h-4" />}
                                formatShortWeekday={(locale, date) => format(date, 'EEE', { locale: es })}
                                formatMonthYear={(locale, date) => format(date, 'MMMM yyyy', { locale: es })}
                            />
                        </div>
                        {/* Leyenda del calendario */}
                        <div className="calendar-legend mt-4 flex space-x-4 text-xs text-gray-500">
                            <div className="legend-item flex items-center space-x-2">
                                <div className="legend-color w-3 h-3 rounded-full bg-primary" />
                                <span>Con turnos</span>
                            </div>
                            <div className="legend-item flex items-center space-x-2">
                                <div className="legend-color w-3 h-3 rounded-full bg-green-200" />
                                <span>Hoy</span>
                            </div>
                            <div className="legend-item flex items-center space-x-2">
                                <div className="legend-color w-3 h-3 rounded-full bg-blue-200" />
                                <span>Seleccionado</span>
                            </div>
                        </div>
                        {/* Botón para crear nuevo turno */}
                        <div className="flex justify-end mt-4">
                            <Button
                                onClick={() => {
                                    setTurnoEditando(null);
                                    setShowNewTurnoForm(true);
                                }}
                                disabled={esFechaAnterior(selectedDate)}
                                className="flex items-center space-x-2 text-white"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Nuevo turno</span>
                            </Button>
                        </div>
                        {/* FORMULARIO NUEVO TURNO */}
                        {showNewTurnoForm && (
                            <div className="mt-8 p-6 border border-primary/20 rounded-lg bg-blue-50">
                                <h3 className="text-lg font-semibold mb-4">
                                    {turnoEditando ? 'Editar turno' : 'Nuevo turno'}
                                </h3>
                                <form className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Paciente</label>
                                        <select
                                            className="w-full border rounded p-2"
                                            value={nuevoPaciente}
                                            onChange={e => setNuevoPaciente(e.target.value)}
                                            required
                                            disabled={isLoadingPacientes}
                                        >
                                            <option value="">Selecciona un paciente</option>
                                            {pacientes.map(paciente => (
                                                <option key={paciente.id} value={paciente.id}>
                                                    {paciente.nombre} {paciente.apellido}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tipo de sesión</label>
                                        <input
                                            className="w-full border rounded p-2"
                                            value={nuevoTipoSesion}
                                            onChange={e => setNuevoTipoSesion(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Horario</label>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <span className="text-xs font-semibold">Mañana</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {morningSlots.map(slot => (
                                                        <Button
                                                            key={slot.id}
                                                            type="button"
                                                            size="sm"
                                                            variant={selectedSlot === slot.id ? "default" : "outline"}
                                                            className="px-3 py-2"
                                                            onClick={() => setSelectedSlot(slot.id)}
                                                        >
                                                            {slot.time}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold">Tarde</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {afternoonSlots.map(slot => (
                                                        <Button
                                                            key={slot.id}
                                                            type="button"
                                                            size="sm"
                                                            variant={selectedSlot === slot.id ? "default" : "outline"}
                                                            className="px-3 py-2 "
                                                            onClick={() => setSelectedSlot(slot.id)}
                                                        >
                                                            {slot.time}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Notas</label>
                                        <textarea
                                            className="w-full border rounded p-2"
                                            value={nuevaNota}
                                            onChange={e => setNuevaNota(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex space-x-2 mt-4">
                                        <Button className='text-white' type="submit" onClick={handleSubmit}>
                                            {turnoEditando ? 'Actualizar turno' : 'Guardar turno'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowNewTurnoForm(false);
                                                setTurnoEditando(null);
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                    {/* COLUMNA DERECHA: LISTA DE TURNOS DEL DÍA */}
                    <div className="md:w-1/3 mt-8 md:mt-0">
                        <h2 className="text-lg font-semibold mb-3">Turnos para el día seleccionado</h2>
                        {renderTurnosDelDia()}
                    </div>
                </div>
            </div>
            <DeleteAppointmentModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setTurnoToDelete(null);
                }}
                onConfirm={confirmDelete}
                isLoading={isLoading}
            />
            <Dialog open={showEvolucionModal} onOpenChange={setShowEvolucionModal}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Registrar Evolución</DialogTitle>
                    </DialogHeader>
                    {selectedTurno && (
                        <EvolucionFono
                            data={{
                                id: 0,
                                historiaClinicaId: selectedTurno.historiaClinicaId!,
                                fonoId: Number(getFonoId()),
                                fechaSesion: new Date(selectedTurno.fecha.split('/').reverse().join('-')),
                                avances: '',
                                observaciones: '',
                                cambiosPlan: ''
                            }}
                            onSave={handleEvolucionSave}
                            onCancel={() => {
                                setShowEvolucionModal(false);
                                setSelectedTurno(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
        </div>
    );
};

export default Turnos;
