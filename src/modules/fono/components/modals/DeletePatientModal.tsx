"use client";

import { Trash2 } from 'lucide-react';
import { Paciente } from '../../types';
import { Button } from '@/components/ui/button';

interface DeletePatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    paciente: Paciente | null;
    onConfirm: () => void;
}

export function DeletePatientModal({ isOpen, onClose, paciente, onConfirm }: DeletePatientModalProps) {
    if (!isOpen || !paciente) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                <div className="p-6">
                    <div className="mb-4 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Eliminar Paciente</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            ¿Estás seguro de que deseas eliminar a <strong>{paciente.nombre} {paciente.apellido}</strong>?
                        </p>
                        <p className="text-sm text-red-500 mt-2 font-medium">
                            Esta acción eliminará también todos los turnos e historias clínicas asociadas.
                        </p>
                    </div>
                    <div className="mt-5 flex justify-center gap-6">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onConfirm}
                        >
                            Eliminar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 