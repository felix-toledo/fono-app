import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { EvolucionFono } from '@/components/historia-clinica/EvolucionFono';
import type { EvolucionFono as EvolucionFonoType } from '@/types/evolucion-fono';
import { Plus, History, PenSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EvolucionesListProps {
    evoluciones: EvolucionFonoType[];
    historiaId: number;
    fonoId: number;
    isAddingEvolucion: boolean;
    selectedEvolucion: EvolucionFonoType | null;
    onAddEvolucion: () => void;
    onCancelEvolucion: () => void;
    onSaveEvolucion: (evolucion: EvolucionFonoType) => void;
}

const ITEMS_PER_PAGE = 5;

// Función auxiliar para manejar fechas
const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    // Ajustamos la fecha para compensar la zona horaria
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date;
};

export function EvolucionesList({
    evoluciones,
    historiaId,
    fonoId,
    isAddingEvolucion,
    selectedEvolucion,
    onAddEvolucion,
    onCancelEvolucion,
    onSaveEvolucion
}: EvolucionesListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredEvoluciones, setFilteredEvoluciones] = useState<EvolucionFonoType[]>([]);

    useEffect(() => {
        let filtered = [...evoluciones];

        // Sort by date, most recent first
        filtered.sort((a, b) =>
            formatDate(b.fechaSesion).getTime() - formatDate(a.fechaSesion).getTime()
        );

        setFilteredEvoluciones(filtered);
        setCurrentPage(1); // Reset to first page when filter changes
    }, [evoluciones]);

    const totalPages = Math.ceil(filteredEvoluciones.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedEvoluciones = filteredEvoluciones.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Evoluciones</h3>
                {historiaId && (
                    <Button onClick={onAddEvolucion}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Evolución
                    </Button>
                )}
            </div>

            {isAddingEvolucion && historiaId && (
                <EvolucionFono
                    data={{
                        id: selectedEvolucion?.id || 0,
                        historiaClinicaId: historiaId,
                        fonoId: fonoId,
                        fechaSesion: selectedEvolucion?.fechaSesion || new Date(),
                        avances: selectedEvolucion?.avances || '',
                        observaciones: selectedEvolucion?.observaciones || '',
                        cambiosPlan: selectedEvolucion?.cambiosPlan || ''
                    }}
                    onSave={onSaveEvolucion}
                    onCancel={onCancelEvolucion}
                />
            )}

            <div className="space-y-4">
                {paginatedEvoluciones.map(evolucion => (
                    <Card key={evolucion.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                                <History className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="font-medium">
                                    {formatDate(evolucion.fechaSesion).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {evolucion.avances && (
                                <div>
                                    <h4 className="font-medium">Avances:</h4>
                                    <p className="text-gray-600">{evolucion.avances}</p>
                                </div>
                            )}
                            {evolucion.observaciones && (
                                <div>
                                    <h4 className="font-medium">Observaciones:</h4>
                                    <p className="text-gray-600">{evolucion.observaciones}</p>
                                </div>
                            )}
                            {evolucion.cambiosPlan && (
                                <div>
                                    <h4 className="font-medium">Cambios en el Plan:</h4>
                                    <p className="text-gray-600">{evolucion.cambiosPlan}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
} 