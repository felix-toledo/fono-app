import { Card } from './Card';
import { Users } from 'lucide-react';

interface UserProfileProps {
    name: string;
    role: string;
    stats: {
        consultas: number;
        pacientes: number;
        regulares: number;
    };
}

export function UserProfile({ name, role, stats }: UserProfileProps) {
    return (
        <div className="flex flex-col space-y-4">
            <Card className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="h-20 w-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Users className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-medium text-gray-800">{name}</h3>
                    <p className="text-gray-600 text-sm">{role}</p>
                </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
                <Card className="p-3 text-center">
                    <h4 className="text-sm font-medium text-gray-600">Consultas</h4>
                    <p className="text-xl font-bold text-gray-800 mt-1">{stats.consultas}</p>
                </Card>

                <Card className="p-3 text-center">
                    <h4 className="text-sm font-medium text-gray-600">Pacientes</h4>
                    <p className="text-xl font-bold text-gray-800 mt-1">{stats.pacientes}</p>
                </Card>

                <Card className="p-3 text-center">
                    <h4 className="text-sm font-medium text-gray-600">Regulares</h4>
                    <p className="text-xl font-bold text-gray-800 mt-1">{stats.regulares}</p>
                </Card>
            </div>
        </div>
    );
} 