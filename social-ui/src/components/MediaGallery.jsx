import { useState } from "react";
import { API_BASE_URL } from "../api/config";

export default function MediaGallery({ images }) {
    const [selectedImage, setSelectedImage] = useState(null);

    if (!images || images.length === 0) return null;

    const fullImages = images.map(img => img.startsWith("http") ? img : `${API_BASE_URL}${img}`);

    const renderGrid = () => {
        const count = fullImages.length;

        if (count === 1) {
            return (
                <img
                    src={fullImages[0]}
                    alt="Post content"
                    className="w-full max-h-[500px] object-cover rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer"
                    onClick={() => setSelectedImage(fullImages[0])}
                />
            );
        }

        if (count === 2) {
            return (
                <div className="grid grid-cols-2 gap-1 h-64">
                    {fullImages.map((src, i) => (
                        <img
                            key={i}
                            src={src}
                            alt={`Post content ${i + 1}`}
                            className="w-full h-full object-cover rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer"
                            onClick={() => setSelectedImage(src)}
                        />
                    ))}
                </div>
            );
        }

        if (count === 3) {
            return (
                <div className="grid grid-cols-2 gap-1 h-64">
                    <img
                        src={fullImages[0]}
                        alt="Post content 1"
                        className="w-full h-full object-cover rounded-l-lg border border-gray-100 dark:border-gray-700 cursor-pointer"
                        onClick={() => setSelectedImage(fullImages[0])}
                    />
                    <div className="flex flex-col gap-1 h-full">
                        <img
                            src={fullImages[1]}
                            alt="Post content 2"
                            className="w-full h-1/2 object-cover rounded-tr-lg border border-gray-100 dark:border-gray-700 cursor-pointer"
                            onClick={() => setSelectedImage(fullImages[1])}
                        />
                        <img
                            src={fullImages[2]}
                            alt="Post content 3"
                            className="w-full h-1/2 object-cover rounded-br-lg border border-gray-100 dark:border-gray-700 cursor-pointer"
                            onClick={() => setSelectedImage(fullImages[2])}
                        />
                    </div>
                </div>
            );
        }

        if (count >= 4) {
            return (
                <div className="grid grid-cols-2 gap-1 h-64">
                    <img
                        src={fullImages[0]}
                        alt="Post content 1"
                        className="w-full h-full object-cover rounded-l-lg border border-gray-100 dark:border-gray-700 cursor-pointer"
                        onClick={() => setSelectedImage(fullImages[0])}
                    />
                    <div className="flex flex-col gap-1 h-full">
                        <img
                            src={fullImages[1]}
                            alt="Post content 2"
                            className="w-full h-1/2 object-cover rounded-tr-lg border border-gray-100 dark:border-gray-700 cursor-pointer"
                            onClick={() => setSelectedImage(fullImages[1])}
                        />
                        <div className="relative w-full h-1/2">
                            <img
                                src={fullImages[2]}
                                alt="Post content 3"
                                className="w-full h-full object-cover rounded-br-lg border border-gray-100 dark:border-gray-700 cursor-pointer"
                                onClick={() => setSelectedImage(fullImages[2])}
                            />
                            {count > 3 && (
                                <div
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-br-lg cursor-pointer"
                                    onClick={() => setSelectedImage(fullImages[2])}
                                >
                                    <span className="text-white font-bold text-xl">+{count - 3}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <>
            <div className="mt-2 mb-2">
                {renderGrid()}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300"
                        onClick={() => setSelectedImage(null)}
                    >
                        &times;
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full size"
                        className="max-w-full max-h-full rounded shadow-lg"
                        onClick={(e) => e.stopPropagation()} // Prevent clicking image from closing
                    />
                </div>
            )}
        </>
    );
}
