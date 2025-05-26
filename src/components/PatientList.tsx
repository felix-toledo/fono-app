import { CheckCircle, Clock, Calendar } from 'lucide-react';

interface Patient {
    id: number;
    nombre: string;
    estado: 'actual' | 'pendiente';
    horasRestantes?: number;
}

interface PatientListProps {
    patients: Patient[];
    onPatientClick: (id: number) => void;
    title?: string;
    showHeader?: boolean;
}

export function PatientList({ patients, onPatientClick, title = 'Pacientes del día', showHeader = true }: PatientListProps) {
    return (
        <div className="bg-white rounded-lg shadow border border-border">
            {showHeader && (
                <div className="p-3 border-b border-gray-100 flex items-center">
                    <Calendar className="h-4 w-4 text-primary mr-2" />
                    <h3 className="font-medium text-gray-700">{title}</h3>
                    <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        Clickeable
                    </span>
                </div>
            )}
            <ul className="divide-y divide-gray-100">
                {patients.length > 0 ? (
                    patients.map((patient, idx) => (
                        <li
                            key={patient.id + '-' + idx}
                            className="p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                            onClick={() => onPatientClick(patient.id)}
                        >
                            <div className="text-gray-800 hover:text-primary transition-colors flex items-center">
                                <span className="mr-2 text-xs text-primary">→</span>
                                {patient.nombre}
                            </div>
                            <div className="text-gray-500">
                                {patient.estado === 'actual' ? (
                                    <span className="inline-flex items-center text-secondary">
                                        <CheckCircle size={16} className="mr-1" /> Ahora
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center text-gray-500">
                                        <Clock size={16} className="mr-1" /> {patient.horasRestantes}h
                                    </span>
                                )}
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="p-4 text-center text-gray-500">
                        No hay pacientes programados para hoy
                    </li>
                )}
            </ul>
        </div>
    );
} 