'use client';

import { useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';

interface GoogleMapFacadeProps {
    src: string;
    title?: string;
    className?: string;
}

/**
 * GoogleMapFacade — Shows a lightweight static preview instead of loading 
 * the full Google Maps iframe (~200KB+ JS). The iframe only loads when 
 * the user clicks "Lihat Peta". This saves significant data on mobile.
 */
export default function GoogleMapFacade({ src, title = 'Google Maps', className = '' }: GoogleMapFacadeProps) {
    const [showMap, setShowMap] = useState(false);

    const handleLoad = useCallback(() => {
        setShowMap(true);
    }, []);

    if (showMap) {
        return (
            <iframe
                src={src}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={title}
                className={className}
            />
        );
    }

    return (
        <button
            onClick={handleLoad}
            className={`relative cursor-pointer group border-0 p-0 w-full h-full bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center gap-4 rounded-2xl transition-all hover:shadow-lg ${className}`}
            aria-label={`Muat peta: ${title}`}
            type="button"
        >
            {/* Map icon */}
            <div className="w-16 h-16 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-red-500" />
            </div>

            <div className="text-center">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    Kantor Kelurahan Mojo, Surakarta
                </p>
                <p className="text-xs text-primary font-semibold mt-1 group-hover:underline">
                    Klik untuk muat peta →
                </p>
            </div>

            {/* Decorative dots to suggest map grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, #666 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }} />
        </button>
    );
}
