'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Settings, User, Bell, HelpCircle, Upload, Trash2, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useFono } from '@/contexts/FonoContext';

type DoctorProfile = {
    name: string;
    lastName: string;
    matricula: string;
    email: string;
    phone: string;
    address: string;
    photoUrl: string | null;
};

type PasswordChange = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

const Configuracion = () => {
    const { userInfo, getFonoId } = useFono();
    const [activeTab, setActiveTab] = useState('perfil');
    const [isLoading, setIsLoading] = useState(false);
    const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>({
        name: '',
        lastName: '',
        matricula: '',
        email: '',
        phone: '',
        address: '',
        photoUrl: null
    });

    const [passwordChange, setPasswordChange] = useState<PasswordChange>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswordChange, setShowPasswordChange] = useState(false);

    // Lista de pestañas
    const tabs = [
        { id: 'perfil', name: 'Perfil', icon: <User className="h-5 w-5" /> },
        { id: 'notificaciones', name: 'Notificaciones', icon: <Bell className="h-5 w-5" /> },
        { id: 'ayuda', name: 'Ayuda', icon: <HelpCircle className="h-5 w-5" /> },
    ];

    // Cargar datos del perfil
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!userInfo) {
                    toast.error('No hay sesión activa');
                    return;
                }

                const response = await axios.get('/api/fono/configuracion', {
                    headers: {
                        'x-session-data': JSON.stringify({ userId: getFonoId() })
                    }
                });
                setDoctorProfile({
                    name: response.data.Nombre,
                    lastName: response.data.Apellido,
                    matricula: response.data.Matricula || '',
                    email: response.data.Email,
                    phone: response.data.Telefono,
                    address: response.data.DireccionConsultorio,
                    photoUrl: response.data.PhotoUrl
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Error al cargar el perfil');
            }
        };

        fetchProfile();
    }, [userInfo, getFonoId]);

    // Manejar cambios en los campos del formulario
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Prevent changes to matricula
        if (name === 'matricula') {
            return;
        }

        setDoctorProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejar cambios en los campos de contraseña
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordChange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejar cambio de pestaña
    const handleTabChange = (tabId: string) => {
        if (tabId === 'notificaciones') {
            toast.error('Las notificaciones están en desarrollo. ¡Pronto estará disponible!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        setActiveTab(tabId);
    };

    // Manejar cambio de foto
    const handlePhotoChange = () => {
        toast.error('La funcionalidad de cambio de foto está en desarrollo. ¡Pronto estará disponible!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    // Guardar cambios del perfil
    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            if (!userInfo) {
                toast.error('No hay sesión activa');
                return;
            }

            await axios.put('/api/fono/configuracion', doctorProfile, {
                headers: {
                    'x-session-data': JSON.stringify({ userId: getFonoId() })
                }
            });
            toast.success('Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error al actualizar el perfil');
        } finally {
            setIsLoading(false);
        }
    };

    // Cambiar contraseña
    const handleChangePassword = async () => {
        if (passwordChange.newPassword !== passwordChange.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);
        try {
            if (!userInfo) {
                toast.error('No hay sesión activa');
                return;
            }

            console.log('Sending password change request...'); // Debug log
            const response = await axios.put('/api/fono/configuracion/password', {
                currentPassword: passwordChange.currentPassword,
                newPassword: passwordChange.newPassword
            }, {
                headers: {
                    'x-session-data': JSON.stringify({ userId: getFonoId() })
                }
            });
            console.log('Password change response:', response.data); // Debug log

            toast.success('Contraseña actualizada correctamente');
            setShowPasswordChange(false);
            setPasswordChange({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error: any) {
            console.error('Password change error:', error.response?.data); // Debug log
            if (error.response?.status === 400) {
                toast.error('Contraseña actual incorrecta');
            } else {
                toast.error('Error al cambiar la contraseña');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Settings className="mr-2 h-6 w-6" />
                    Configuración
                </h1>
                <div className="text-gray-500">5 de Julio del 2025</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <Card className="p-0 overflow-hidden">
                        <nav className="divide-y divide-gray-100">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`w-full flex items-center p-3 text-left transition-colors ${activeTab === tab.id
                                        ? 'bg-primary text-white'
                                        : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    onClick={() => handleTabChange(tab.id)}
                                >
                                    <span className="mr-3">{tab.icon}</span>
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </Card>

                    <div className="mt-6">
                        <Card className="bg-blue-50 border-blue-100 p-4">
                            <div className="flex items-start">
                                <HelpCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-primary">¿Necesitas ayuda?</h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Si tienes problemas con la configuración, contacta a soporte técnico.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="mt-3 bg-white border-blue-200 text-primary hover:bg-blue-100 w-full"
                                    >
                                        Contactar Soporte
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="md:col-span-3">
                    {activeTab === 'perfil' && (
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Perfil Profesional</h2>

                            <div className="space-y-6">
                                <div className="flex items-center">
                                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mr-6 overflow-hidden relative">
                                        {doctorProfile.photoUrl ? (
                                            <img
                                                src={doctorProfile.photoUrl}
                                                alt="Foto de perfil"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-12 w-12 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-700">Foto de perfil</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Esta foto será visible para tus pacientes
                                        </p>
                                        <div className="mt-3 space-x-3">
                                            <Button
                                                variant="outline"
                                                onClick={handlePhotoChange}
                                            >
                                                <Upload className="h-4 w-4 mr-1" />
                                                Cambiar Foto
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                disabled={!doctorProfile.photoUrl}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Eliminar
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Input
                                            label="Nombre"
                                            name="name"
                                            value={doctorProfile.name}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Apellido"
                                            name="lastName"
                                            value={doctorProfile.lastName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Matrícula Profesional"
                                            name="matricula"
                                            value={doctorProfile.matricula}
                                            onChange={handleInputChange}
                                            disabled={true}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Correo Electrónico"
                                            name="email"
                                            value={doctorProfile.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Teléfono"
                                            name="phone"
                                            value={doctorProfile.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Dirección del Consultorio"
                                            name="address"
                                            value={doctorProfile.address}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                                        className="flex items-center"
                                    >
                                        <Lock className="h-4 w-4 mr-2" />
                                        {showPasswordChange ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
                                    </Button>

                                    {showPasswordChange && (
                                        <div className="mt-4 space-y-4 p-4 border rounded-md bg-gray-50">
                                            <Input
                                                label="Contraseña actual"
                                                name="currentPassword"
                                                type="password"
                                                value={passwordChange.currentPassword}
                                                onChange={handlePasswordChange}
                                            />
                                            <Input
                                                label="Nueva contraseña"
                                                name="newPassword"
                                                type="password"
                                                value={passwordChange.newPassword}
                                                onChange={handlePasswordChange}
                                            />
                                            <Input
                                                label="Confirmar nueva contraseña"
                                                name="confirmPassword"
                                                type="password"
                                                value={passwordChange.confirmPassword}
                                                onChange={handlePasswordChange}
                                            />
                                            <Button
                                                onClick={handleChangePassword}
                                                disabled={isLoading}
                                            >
                                                Actualizar contraseña
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => window.location.reload()}
                                        disabled={isLoading}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'ayuda' && (
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Centro de Ayuda</h2>

                            <div className="space-y-6">
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                        <h3 className="font-medium text-gray-700">Preguntas frecuentes</h3>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="border-b border-gray-100 pb-3">
                                            <h4 className="font-medium text-gray-700 mb-2">¿Cómo actualizo mis datos de contacto?</h4>
                                            <p className="text-gray-600 text-sm">
                                                Puedes actualizar tus datos de contacto en la sección de "Perfil" en Configuración.
                                                Todos los cambios se guardarán automáticamente al hacer clic en "Guardar Cambios".
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">¿Cómo puedo cambiar mi contraseña?</h4>
                                            <p className="text-gray-600 text-sm">
                                                Para cambiar tu contraseña, ve a la sección de "Perfil" y haz clic en "Cambiar Contraseña".
                                                Deberás ingresar tu contraseña actual y la nueva contraseña.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <h3 className="font-medium text-primary mb-2">Contacto de soporte técnico</h3>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Si necesitas ayuda adicional, puedes contactar a nuestro equipo de soporte técnico.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
                                            <p className="text-sm text-gray-700">felixtoledoctes@gmail.com</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">Teléfono</p>
                                            <p className="text-sm text-gray-700">+379 4363693</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Configuracion;
