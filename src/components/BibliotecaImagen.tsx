import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BibliotecaImagenProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImage: (imagePath: string) => void;
}

const BibliotecaImagen = ({ isOpen, onClose, onSelectImage }: BibliotecaImagenProps) => {
    const [images, setImages] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredImages, setFilteredImages] = useState<string[]>([]);

    useEffect(() => {
        // Cargar las imágenes de la carpeta pictograms
        const loadImages = async () => {
            try {
                const response = await fetch('/api/pictograms');
                const data = await response.json();
                setImages(data.images);
                setFilteredImages(data.images);
            } catch (error) {
                console.error('Error loading images:', error);
            }
        };

        if (isOpen) {
            loadImages();
        }
    }, [isOpen]);

    useEffect(() => {
        // Filtrar imágenes basado en el término de búsqueda
        const filtered = images.filter(image =>
            image.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredImages(filtered);
    }, [searchTerm, images]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-11/12 max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Biblioteca de Imágenes</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Buscar imagen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto flex-1">
                    {filteredImages.map((image, index) => (
                        <div
                            key={index}
                            className="relative aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                                onSelectImage(`/pictograms/${image}`);
                                onClose();
                            }}
                        >
                            <Image
                                src={`/pictograms/${image}`}
                                alt={image}
                                fill
                                className="object-contain p-2"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                                {image}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BibliotecaImagen; 