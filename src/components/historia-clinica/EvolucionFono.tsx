import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EvolucionFono as EvolucionFonoType } from '@/types/evolucion-fono';

interface EvolucionFonoProps {
    data: EvolucionFonoType;
    onSave: (data: EvolucionFonoType) => void;
    onCancel: () => void;
}

export function EvolucionFono({ data, onSave, onCancel }: EvolucionFonoProps) {
    const [evolucion, setEvolucion] = useState<EvolucionFonoType>({
        id: data.id || 0,
        historiaClinicaId: data.historiaClinicaId,
        fonoId: data.fonoId,
        fechaSesion: data.fechaSesion || new Date(),
        avances: data.avances || '',
        observaciones: data.observaciones || '',
        cambiosPlan: data.cambiosPlan || ''
    });

    useEffect(() => {
        setEvolucion({
            id: data.id || 0,
            historiaClinicaId: data.historiaClinicaId,
            fonoId: data.fonoId,
            fechaSesion: data.fechaSesion || new Date(),
            avances: data.avances || '',
            observaciones: data.observaciones || '',
            cambiosPlan: data.cambiosPlan || ''
        });
    }, [data]);

    const handleChange = (field: keyof EvolucionFonoType, value: string | Date) => {
        setEvolucion(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validar que todos los campos requeridos estén presentes y no estén vacíos
        if (!evolucion.avances?.trim()) {
            console.error('El campo Avances es requerido');
            return;
        }
        if (!evolucion.observaciones?.trim()) {
            console.error('El campo Observaciones es requerido');
            return;
        }
        if (!evolucion.cambiosPlan?.trim()) {
            console.error('El campo Cambios en el Plan es requerido');
            return;
        }

        // Asegurarse de que la fecha sea válida
        const fechaSesion = evolucion.fechaSesion instanceof Date
            ? evolucion.fechaSesion
            : new Date(evolucion.fechaSesion);

        if (isNaN(fechaSesion.getTime())) {
            console.error('Fecha de sesión inválida');
            return;
        }

        onSave({
            ...evolucion,
            fechaSesion
        });
    };

    return (
        <Card className="p-4 mb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="fechaSesion">Fecha de Sesión</Label>
                    <Input
                        id="fechaSesion"
                        type="date"
                        value={evolucion.fechaSesion instanceof Date
                            ? evolucion.fechaSesion.toISOString().split('T')[0]
                            : new Date(evolucion.fechaSesion).toISOString().split('T')[0]}
                        onChange={(e) => handleChange('fechaSesion', new Date(e.target.value))}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="avances">Avances</Label>
                    <Textarea
                        id="avances"
                        value={evolucion.avances}
                        onChange={(e) => handleChange('avances', e.target.value)}
                        placeholder="Describa los avances del paciente..."
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <Textarea
                        id="observaciones"
                        value={evolucion.observaciones}
                        onChange={(e) => handleChange('observaciones', e.target.value)}
                        placeholder="Agregue sus observaciones..."
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="cambiosPlan">Cambios en el Plan</Label>
                    <Textarea
                        id="cambiosPlan"
                        value={evolucion.cambiosPlan}
                        onChange={(e) => handleChange('cambiosPlan', e.target.value)}
                        placeholder="Describa los cambios en el plan de tratamiento..."
                        required
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit">
                        Guardar Evolución
                    </Button>
                </div>
            </form>
        </Card>
    );
} 