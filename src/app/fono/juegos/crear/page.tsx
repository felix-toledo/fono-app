'use client';

import { useState } from 'react';
import GamePreview from '@/components/juegos/GamePreview';
import { useFono } from '@/contexts/FonoContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BibliotecaImagen from '@/components/BibliotecaImagen';
import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';

interface Option {
    text: string;
    isCorrect: boolean;
    urlImg?: string;
}

interface GameFields {
    // Consigna y Respuestas (combines ROLES and EMOCIONES)
    consigna?: string;
    imagenConsigna?: string;
    opciones?: Option[];

    // REPETIR
    textoRepetir?: string;
    imagenRepetir?: string;

    // HABLAR
    imagenesHablar?: string[];
    textoCompleto?: string;
    textoIncompleto?: string;
    palabraCompletar?: string;

    // COMPLETAR
    imagenesCompletar?: string[];
    textoCompletoCompletar?: string;
    textoIncompletoCompletar?: string;
    opcionesCompletar?: string[];

    // ORDEN
    imagenesOrden?: string[];
    palabrasOrdenadas?: string[];
    consignaOrden?: string;
}

export default function Juegos() {
    const { getFonoId } = useFono();
    const [formData, setFormData] = useState({
        titulo: '',
        rama: 'Pragmatica',
        rangoEdad: 'TODOS',
        descripcion: '',
        nivelDificultad: 1,
        experienciaDada: 10,
        tipoJuego: 'CONSIGNA',
        estado: true
    });

    const [showPreview, setShowPreview] = useState(false);
    const [showBiblioteca, setShowBiblioteca] = useState(false);
    const [currentImageField, setCurrentImageField] = useState<string>('');

    const [gameFields, setGameFields] = useState<GameFields>({
        opciones: [{ text: '', isCorrect: false }],
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
            rangoEdad: 'TODOS',
            descripcion: '',
            nivelDificultad: 1,
            experienciaDada: 10,
            tipoJuego: 'CONSIGNA',
            estado: true
        });
        setGameFields({
            opciones: [{ text: '', isCorrect: false }],
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
                case 'CONSIGNA':
                    gameFieldsData.push({
                        tipoCampo: 'elegir_respuesta',
                        titulo: 'Consigna y Respuestas',
                        consigna: gameFields.consigna || '',
                        rptaValida: JSON.stringify(gameFields.opciones?.filter(opt => opt.isCorrect).map(opt => opt.text) || []),
                        opciones: JSON.stringify(gameFields.opciones?.map(opt => ({
                            text: opt.text,
                            isCorrect: opt.isCorrect,
                            urlImg: opt.urlImg
                        })) || []),
                        imagenConsigna: gameFields.imagenConsigna,
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
                rangoEdad: formData.rangoEdad,
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
            if (gameFields.imagenConsigna) formDataToSend.append('imagenConsigna', gameFields.imagenConsigna);
            if (gameFields.imagenRepetir) formDataToSend.append('imagenRepetir', gameFields.imagenRepetir);

            // Add option images for CONSIGNA
            if (formData.tipoJuego === 'CONSIGNA') {
                gameFields.opciones?.forEach((option, index) => {
                    if (option.urlImg) {
                        formDataToSend.append(`opciones_${index}`, option.urlImg);
                    }
                });
            }

            // Add other game type images
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

    const handleOpenBiblioteca = (field: string) => {
        setCurrentImageField(field);
        setShowBiblioteca(true);
    };

    const handleSelectImage = (imagePath: string) => {
        setGameFields(prev => {
            if (currentImageField.includes('[]')) {
                const fieldName = currentImageField.replace('[]', '');
                return {
                    ...prev,
                    [fieldName]: [...(prev[fieldName as keyof GameFields] as string[] || []), imagePath]
                };
            } else if (currentImageField.includes('_')) {
                // Handle option images
                const [field, index] = currentImageField.split('_');
                const options = [...(prev[field as keyof GameFields] as Option[] || [])];
                options[parseInt(index)] = {
                    ...options[parseInt(index)],
                    urlImg: imagePath
                };
                return { ...prev, [field]: options };
            } else {
                return {
                    ...prev,
                    [currentImageField]: imagePath
                };
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleOptionChange = (index: number, field: string, value: string, isCorrect?: boolean, urlImg?: string) => {
        setGameFields(prev => {
            const options = [...(prev[field as keyof GameFields] as Option[] || [])];
            options[index] = {
                ...options[index],
                text: value,
                isCorrect: isCorrect ?? options[index]?.isCorrect,
                urlImg: urlImg ?? options[index]?.urlImg
            };
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
            case 'CONSIGNA':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Consigna
                            </label>
                            <textarea
                                value={gameFields.consigna || ''}
                                onChange={(e) => setGameFields(prev => ({ ...prev, consigna: e.target.value }))}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Imagen de Consigna (opcional)
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleOpenBiblioteca('imagenConsigna')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Seleccionar Imagen
                                </button>
                                {gameFields.imagenConsigna && (
                                    <div className="relative w-20 h-20">
                                        <Image
                                            src={gameFields.imagenConsigna}
                                            alt="Imagen seleccionada"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Respuestas
                            </label>
                            {gameFields.opciones?.map((option, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => handleOptionChange(index, 'opciones', e.target.value)}
                                            className="flex-1 p-2 border rounded-md"
                                            placeholder="Respuesta"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleOpenBiblioteca(`opciones_${index}`)}
                                            className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Seleccionar imagen"
                                        >
                                            <ImageIcon size={20} />
                                        </button>
                                    </div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={option.isCorrect}
                                            onChange={(e) => handleOptionChange(index, 'opciones', option.text, e.target.checked)}
                                            className="mr-2"
                                        />
                                        Correcta
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => removeOption('opciones', index)}
                                        className="px-2 py-1 bg-red-500 text-white rounded"
                                    >
                                        X
                                    </button>
                                    {option.urlImg && (
                                        <div className="relative w-8 h-8">
                                            <Image
                                                src={option.urlImg}
                                                alt="Imagen de respuesta"
                                                fill
                                                className="object-contain rounded-md"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addOption('opciones')}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Agregar Respuesta
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
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleOpenBiblioteca('imagenRepetir')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Seleccionar Imagen
                                </button>
                                {gameFields.imagenRepetir && (
                                    <div className="relative w-20 h-20">
                                        <Image
                                            src={gameFields.imagenRepetir}
                                            alt="Imagen seleccionada"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                )}
                            </div>
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
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleOpenBiblioteca('imagenesHablar[]')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Seleccionar Imágenes
                                </button>
                                <div className="flex gap-2 flex-wrap">
                                    {gameFields.imagenesHablar?.map((image, index) => (
                                        <div key={index} className="relative w-20 h-20">
                                            <Image
                                                src={image}
                                                alt={`Imagen ${index + 1}`}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleOpenBiblioteca('imagenesCompletar[]')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Seleccionar Imágenes
                                </button>
                                <div className="flex gap-2 flex-wrap">
                                    {gameFields.imagenesCompletar?.map((image, index) => (
                                        <div key={index} className="relative w-20 h-20">
                                            <Image
                                                src={image}
                                                alt={`Imagen ${index + 1}`}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleOpenBiblioteca('imagenesOrden[]')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Seleccionar Imágenes
                                </button>
                                <div className="flex gap-2 flex-wrap">
                                    {gameFields.imagenesOrden?.map((image, index) => (
                                        <div key={index} className="relative w-20 h-20">
                                            <Image
                                                src={image}
                                                alt={`Imagen ${index + 1}`}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                        <label htmlFor="rangoEdad" className="block text-sm font-medium mb-2">
                            Rango de Edad
                        </label>
                        <select
                            id="rangoEdad"
                            name="rangoEdad"
                            value={formData.rangoEdad}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                            required
                        >
                            <option value="TODOS">Todos</option>
                            <option value="DE_4_A_6">De 4 a 6 años</option>
                            <option value="DE_7_A_10">De 7 a 10 años</option>
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
                            <option value="CONSIGNA">Consigna y Respuestas</option>
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
                    gameData={
                        formData.tipoJuego === 'CONSIGNA' ? {
                            tipo_juego: 'select',
                            url_imagen: gameFields.imagenConsigna,
                            consigna: gameFields.consigna || '',
                            respuestas: gameFields.opciones?.map(opt => ({
                                texto: opt.text,
                                esCorrecta: opt.isCorrect,
                                urlImg: opt.urlImg
                            })) || [],
                            onRespuestaSeleccionada: () => { }
                        } : formData.tipoJuego === 'REPETIR' ? {
                            imagenRepetir: gameFields.imagenRepetir,
                            textoRepetir: gameFields.textoRepetir
                        } : undefined
                    }
                />

                <BibliotecaImagen
                    isOpen={showBiblioteca}
                    onClose={() => setShowBiblioteca(false)}
                    onSelectImage={handleSelectImage}
                />
            </div>
        </div>
    );
} 