import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { EvolucionFono } from '@/components/historia-clinica/EvolucionFono';
import type { EvolucionFono as EvolucionFonoType } from '@/types/evolucion-fono';
import { Plus, History, PenSquare } from 'lucide-react';

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
                {evoluciones.map(evolucion => (
                    <Card key={evolucion.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                                <History className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="font-medium">
                                    {new Date(evolucion.fechaSesion).toLocaleDateString()}
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
        </div>
    );
} 