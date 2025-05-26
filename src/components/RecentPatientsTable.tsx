import { Card } from './Card';
import { isToday, parse } from 'date-fns';

interface Patient {
    id?: number;
    nombre: string;
    apellido: string;
    ultimaConsulta?: string;
    estado: string;
}

interface RecentPatientsTableProps {
    patients: Patient[];
    onPatientClick: (id: number) => void;
    title?: string;
}

export function RecentPatientsTable({ patients, onPatientClick, title = 'Pacientes Recientes' }: RecentPatientsTableProps) {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
            <Card className="p-0 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última sesión</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.length > 0 ? (
                            patients.map((patient, idx) => (
                                <tr
                                    key={patient.id + '-' + idx}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => patient.id && onPatientClick(patient.id)}
                                    style={{ userSelect: 'none' }}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{patient.nombre} {patient.apellido}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {patient.ultimaConsulta
                                            ? isToday(parse(patient.ultimaConsulta, 'dd/MM/yyyy', new Date()))
                                                ? 'Hoy'
                                                : patient.ultimaConsulta
                                            : 'Sin consultas'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {patient.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-4 py-5 text-center text-gray-500">
                                    No hay pacientes recientes para mostrar
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
} 