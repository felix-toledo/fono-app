'use client';

import { useState } from 'react';
import GamePreview from '@/components/juegos/GamePreview';
import { useFono } from '@/contexts/FonoContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Option {
    text: string;
    isCorrect: boolean;
}

interface GameFields {
    // ROLES
    preguntaPrincipal?: string;
    imagenRoles?: File | null;
    opcionesRoles?: Option[];

    // EMOCIONES
    consignaEmociones?: string;
    imagenEmociones?: File | null;
    opcionesEmociones?: Option[];

    // REPETIR
    textoRepetir?: string;
    imagenRepetir?: File | null;

    // HABLAR
    imagenesHablar?: File[];
    textoCompleto?: string;
    textoIncompleto?: string;
    palabraCompletar?: string;

    // COMPLETAR
    imagenesCompletar?: File[];
    textoCompletoCompletar?: string;
    textoIncompletoCompletar?: string;
    opcionesCompletar?: string[];

    // ORDEN
    imagenesOrden?: File[];
    palabrasOrdenadas?: string[];
    consignaOrden?: string;
}

export default function Juegos() {
    const { getFonoId } = useFono();
    const [formData, setFormData] = useState({
        titulo: '',
        rama: 'Pragmatica',
        descripcion: '',
        nivelDificultad: 1,
        experienciaDada: 10,
        tipoJuego: 'ROLES',
        estado: true
    });

    const [showPreview, setShowPreview] = useState(false);

    const [gameFields, setGameFields] = useState<GameFields>({
        opcionesRoles: [{ text: '', isCorrect: false }],
        opcionesEmociones: [{ text: '', isCorrect: false }],
        opcionesCompletar: [''],
        palabrasOrdenadas: [''],
        imagenesHablar: [],
        imagenesCompletar: [],
        imagenesOrden: []
    });

    // Nueva función para limpiar el formulario
    const resetForm = () => {
        setFormData({
            titulo: '',
            rama: 'Pragmatica',
            descripcion: '',
            nivelDificultad: 1,
            experienciaDada: 10,
            tipoJuego: 'ROLES',
            estado: true
        });
        setGameFields({
            opcionesRoles: [{ text: '', isCorrect: false }],
            opcionesEmociones: [{ text: '', isCorrect: false }],
            opcionesCompletar: [''],
            palabrasOrdenadas: [''],
            imagenesHablar: [],
            imagenesCompletar: [],
            imagenesOrden: []
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const fonoId = getFonoId();
            if (!fonoId) {
                throw new Error('No se encontró el ID del fonoaudiólogo');
            }

            // Prepare game fields data based on game type
            const gameFieldsData = [];

            switch (formData.tipoJuego) {
                case 'ROLES':
                    gameFieldsData.push({
                        tipoCampo: 'elegir_respuesta',
                        titulo: 'Roles',
                        consigna: gameFields.preguntaPrincipal || '',
                        rptaValida: JSON.stringify(gameFields.opcionesRoles?.filter(opt => opt.isCorrect).map(opt => opt.text) || []),
                        opciones: JSON.stringify(gameFields.opcionesRoles?.map(opt => opt.text) || []),
                        imagenConsigna: gameFields.imagenRoles,
                    });
                    break;

                case 'EMOCIONES':
                    gameFieldsData.push({
                        tipoCampo: 'elegir_respuesta',
                        titulo: 'Emociones',
                        consigna: gameFields.consignaEmociones || '',
                        rptaValida: JSON.stringify(gameFields.opcionesEmociones?.filter(opt => opt.isCorrect).map(opt => opt.text) || []),
                        opciones: JSON.stringify(gameFields.opcionesEmociones?.map(opt => opt.text) || []),
                        imagenConsigna: gameFields.imagenEmociones,
                    });
                    break;

                case 'REPETIR':
                    gameFieldsData.push({
                        tipoCampo: 'frase_audio',
                        titulo: 'Repetir',
                        consigna: 'Repite la siguiente frase',
                        rptaValida: gameFields.textoRepetir || '',
                        imagenConsigna: gameFields.imagenRepetir,
                    });
                    break;

                case 'HABLAR':
                    gameFieldsData.push({
                        tipoCampo: 'escribir_respuesta',
                        titulo: 'Hablar',
                        consigna: gameFields.textoIncompleto || '',
                        rptaValida: gameFields.palabraCompletar || '',
                        opciones: JSON.stringify(gameFields.imagenesHablar || []),
                    });
                    break;

                case 'COMPLETAR':
                    gameFieldsData.push({
                        tipoCampo: 'elegir_respuesta',
                        titulo: 'Completar',
                        consigna: gameFields.textoIncompletoCompletar || '',
                        rptaValida: JSON.stringify(gameFields.opcionesCompletar || []),
                        opciones: JSON.stringify(gameFields.imagenesCompletar || []),
                    });
                    break;

                case 'ORDEN':
                    gameFieldsData.push({
                        tipoCampo: 'ordenar_palabras',
                        titulo: 'Ordenar',
                        consigna: gameFields.consignaOrden || '',
                        rptaValida: JSON.stringify(gameFields.palabrasOrdenadas || []),
                        opciones: JSON.stringify(gameFields.imagenesOrden || []),
                    });
                    break;
            }

            // Create FormData to handle file uploads
            const formDataToSend = new FormData();

            // Add game data
            formDataToSend.append('gameData', JSON.stringify({
                titulo: formData.titulo,
                rama: formData.rama,
                descripcion: formData.descripcion,
                nivelDificultad: formData.nivelDificultad,
                experienciaDada: formData.experienciaDada,
                estado: formData.estado,
                fonoIdCreado: fonoId,
                fechaCreado: new Date(),
                tipoJuego: formData.tipoJuego,
                gameFields: gameFieldsData
            }));

            // Add all images
            if (gameFields.imagenRoles) formDataToSend.append('imagenRoles', gameFields.imagenRoles);
            if (gameFields.imagenEmociones) formDataToSend.append('imagenEmociones', gameFields.imagenEmociones);
            if (gameFields.imagenRepetir) formDataToSend.append('imagenRepetir', gameFields.imagenRepetir);
            if (gameFields.imagenesHablar) {
                gameFields.imagenesHablar.forEach((img, index) => {
                    formDataToSend.append(`imagenesHablar_${index}`, img);
                });
            }
            if (gameFields.imagenesCompletar) {
                gameFields.imagenesCompletar.forEach((img, index) => {
                    formDataToSend.append(`imagenesCompletar_${index}`, img);
                });
            }
            if (gameFields.imagenesOrden) {
                gameFields.imagenesOrden.forEach((img, index) => {
                    formDataToSend.append(`imagenesOrden_${index}`, img);
                });
            }

            // Send everything to a single endpoint
            const response = await fetch('/api/juegos', {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) {
                throw new Error('Error al crear el juego');
            }

            // Mostrar toast de éxito
            toast.success('¡Juego creado exitosamente!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Limpiar formulario
            resetForm();

        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al crear el juego: ' + (error as Error).message, {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    // Helper function to upload images
    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Error al subir la imagen');
        }

        const data = await response.json();
        return data.url;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const files = e.target.files;
        if (files) {
            if (field.includes('[]')) {
                setGameFields(prev => ({
                    ...prev,
                    [field.replace('[]', '')]: Array.from(files)
                }));
            } else {
                setGameFields(prev => ({
                    ...prev,
                    [field]: files[0]
                }));
            }
        }
    };

    const handleOptionChange = (index: number, field: string, value: string, isCorrect?: boolean) => {
        setGameFields(prev => {
            const options = [...(prev[field as keyof GameFields] as Option[] || [])];
            options[index] = { ...options[index], text: value, isCorrect: isCorrect ?? options[index]?.isCorrect };
            return { ...prev, [field]: options };
        });
    };

    const addOption = (field: string) => {
        setGameFields(prev => ({
            ...prev,
            [field]: [...(prev[field as keyof GameFields] as Option[] || []), { text: '', isCorrect: false }]
        }));
    };

    const removeOption = (field: string, index: number) => {
        setGameFields(prev => ({
            ...prev,
            [field]: (prev[field as keyof GameFields] as Option[]).filter((_, i) => i !== index)
        }));
    };

    const renderGameTypeFields = () => {
        switch (formData.tipoJuego) {
            case 'ROLES':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Pregunta Principal
                            </label>
                            <input
                                type="text"
                                value={gameFields.preguntaPrincipal || ''}
                                onChange={(e) => setGameFields(prev => ({ ...prev, preguntaPrincipal: e.target.value }))}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Imagen (opcional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'imagenRoles')}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Opciones
                            </label>
                            {gameFields.opcionesRoles?.map((option, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(index, 'opcionesRoles', e.target.value)}
                                        className="flex-1 p-2 border rounded-md"
                                        placeholder="Opción"
                                        required
                                    />
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={option.isCorrect}
                                            onChange={(e) => handleOptionChange(index, 'opcionesRoles', option.text, e.target.checked)}
                                            className="mr-2"
                                        />
                                        Correcta
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => removeOption('opcionesRoles', index)}
                                        className="px-2 py-1 bg-red-500 text-white rounded"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addOption('opcionesRoles')}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Agregar Opción
                            </button>
                        </div>
                    </>
                );

            case 'EMOCIONES':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Consigna
                            </label>
                            <textarea
                                value={gameFields.consignaEmociones || ''}
                                onChange={(e) => setGameFields(prev => ({ ...prev, consignaEmociones: e.target.value }))}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Imagen de Consigna
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'imagenEmociones')}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Opciones (múltiples correctas)
                            </label>
                            {gameFields.opcionesEmociones?.map((option, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(index, 'opcionesEmociones', e.target.value)}
                                        className="flex-1 p-2 border rounded-md"
                                        placeholder="Opción"
                                        required
                                    />
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={option.isCorrect}
                                            onChange={(e) => handleOptionChange(index, 'opcionesEmociones', option.text, e.target.checked)}
                                            className="mr-2"
                                        />
                                        Correcta
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => removeOption('opcionesEmociones', index)}
                                        className="px-2 py-1 bg-red-500 text-white rounded"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addOption('opcionesEmociones')}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Agregar Opción
                            </button>
                        </div>
                    </>
                );

            case 'REPETIR':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Palabra o Frase a Repetir
                            </label>
                            <input
                                type="text"
                                value={gameFields.textoRepetir || ''}
                                onChange={(e) => setGameFields(prev => ({ ...prev, textoRepetir: e.target.value }))}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Imagen (opcional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'imagenRepetir')}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                    </>
                );

            case 'HABLAR':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Imágenes (opcional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFileChange(e, 'imagenesHablar[]')}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Texto Completo
                            </label>
                            <textarea
                                value={gameFields.textoCompleto || ''}
                                onChange={(e) => setGameFields(prev => ({ ...prev, textoCompleto: e.target.value }))}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Texto Sin Completar
                            </label>
                            <textarea
                                value={gameFields.textoIncompleto || ''}
                                onChange={(e) => setGameFields(prev => ({ ...prev, textoIncompleto: e.target.value }))}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Palabra a Completar
                            </label>
                            <input
                                type="text"
                                value={gameFields.palabraCompletar || ''}
                                onChange={(e) => setGameFields(prev => ({ ...prev, palabraCompletar: e.target.value }))}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                    </>
                );

            case 'COMPLETAR':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Imágenes (opcional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFileChange(e, 'imagenesCompletar[]')}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Texto Completo
                            </label>
                            <textarea
                                value={gameFields.textoCompletoCompletar || ''}
                                onChange={(e) => setGameFields(prev => ({ ...prev, textoCompletoCompletar: e.target.value }))}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Texto Sin Completar
                            </label>
                            <textarea
                                value={gameFields.textoIncompletoCompletar || ''}
                                onChange={(e) => setGameFields(prev => ({ ...prev, textoIncompletoCompletar: e.target.value }))}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Opciones para Completar
                            </label>
                            {gameFields.opcionesCompletar?.map((option, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => {
                                            const newOptions = [...(gameFields.opcionesCompletar || [])];
                                            newOptions[index] = e.target.value;
                                            setGameFields(prev => ({ ...prev, opcionesCompletar: newOptions }));
                                        }}
                                        className="flex-1 p-2 border rounded-md"
                                        placeholder="Opción"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newOptions = gameFields.opcionesCompletar?.filter((_, i) => i !== index);
                                            setGameFields(prev => ({ ...prev, opcionesCompletar: newOptions }));
                                        }}
                                        className="px-2 py-1 bg-red-500 text-white rounded"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setGameFields(prev => ({
                                        ...prev,
                                        opcionesCompletar: [...(prev.opcionesCompletar || []), '']
                                    }));
                                }}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Agregar Opción
                            </button>
                        </div>
                    </>
                );

            case 'ORDEN':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Imágenes
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFileChange(e, 'imagenesOrden[]')}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Palabras Ordenadas
                            </label>
                            {gameFields.palabrasOrdenadas?.map((word, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={word}
                                        onChange={(e) => {
                                            const newWords = [...(gameFields.palabrasOrdenadas || [])];
                                            newWords[index] = e.target.value;
                                            setGameFields(prev => ({ ...prev, palabrasOrdenadas: newWords }));
                                        }}
                                        className="flex-1 p-2 border rounded-md"
                                        placeholder="Palabra"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newWords = gameFields.palabrasOrdenadas?.filter((_, i) => i !== index);
                                            setGameFields(prev => ({ ...prev, palabrasOrdenadas: newWords }));
                                        }}
                                        className="px-2 py-1 bg-red-500 text-white rounded"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setGameFields(prev => ({
                                        ...prev,
                                        palabrasOrdenadas: [...(prev.palabrasOrdenadas || []), '']
                                    }));
                                }}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Agregar Palabra
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Consigna
                            </label>
                            <textarea
                                value={gameFields.consignaOrden || ''}
                                onChange={(e) => setGameFields(prev => ({ ...prev, consignaOrden: e.target.value }))}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                                required
                            />
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Crear Nuevo Juego</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="titulo" className="block text-sm font-medium mb-2">
                            Título del Juego
                        </label>
                        <input
                            type="text"
                            id="titulo"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="rama" className="block text-sm font-medium mb-2">
                            Rama
                        </label>
                        <select
                            id="rama"
                            name="rama"
                            value={formData.rama}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                            required
                        >
                            <option value="Pragmatica">Pragmática</option>
                            <option value="Semantica">Semántica</option>
                            <option value="Fonologia_y_Fonetica">Fonología y Fonética</option>
                            <option value="Morfosintaxis">Morfosintaxis</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium mb-2">
                            Descripción
                        </label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                            rows={4}
                        />
                    </div>

                    <div>
                        <label htmlFor="nivelDificultad" className="block text-sm font-medium mb-2">
                            Nivel de Dificultad (1-5)
                        </label>
                        <input
                            type="number"
                            id="nivelDificultad"
                            name="nivelDificultad"
                            value={formData.nivelDificultad}
                            onChange={handleChange}
                            min="1"
                            max="5"
                            className="w-full p-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="experienciaDada" className="block text-sm font-medium mb-2">
                            Experiencia Otorgada
                        </label>
                        <input
                            type="number"
                            id="experienciaDada"
                            name="experienciaDada"
                            value={formData.experienciaDada}
                            onChange={handleChange}
                            min="1"
                            className="w-full p-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="tipoJuego" className="block text-sm font-medium mb-2">
                            Tipo de Juego
                        </label>
                        <select
                            id="tipoJuego"
                            name="tipoJuego"
                            value={formData.tipoJuego}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                            required
                        >
                            <option value="ROLES">Roles</option>
                            <option value="EMOCIONES">Emociones</option>
                            <option value="REPETIR">Repetir</option>
                            <option value="HABLAR">Hablar</option>
                            <option value="COMPLETAR">Completar</option>
                            <option value="ORDEN">Orden</option>
                        </select>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="estado"
                            name="estado"
                            checked={formData.estado}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        <label htmlFor="estado" className="text-sm font-medium">
                            Juego Activo
                        </label>
                    </div>

                    {/* Dynamic fields based on game type */}
                    <div className="mt-8 p-4 border rounded-md bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Campos Específicos del Juego</h2>
                            <button
                                type="button"
                                onClick={() => setShowPreview(true)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Vista Previa
                            </button>
                        </div>
                        {renderGameTypeFields()}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Crear Juego
                    </button>
                </form>

                <GamePreview
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    gameType={formData.tipoJuego}
                    gameData={gameFields}
                />
            </div>
        </div>
    );
} 