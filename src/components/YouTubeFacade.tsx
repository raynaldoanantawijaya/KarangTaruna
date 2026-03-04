'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

interface YouTubeFacadeProps {
    youtubeId: string;
    title: string;
    className?: string;
}

/**
 * YouTubeFacade — Shows a lightweight thumbnail image instead of loading 
 * the full YouTube iframe (~500KB-1MB JS). The iframe only loads when 
 * the user clicks play. This dramatically improves page load on mobile.
 */
export default function YouTubeFacade({ youtubeId, title, className = '' }: YouTubeFacadeProps) {
    const [showIframe, setShowIframe] = useState(false);

    const handlePlay = useCallback(() => {
        setShowIframe(true);
    }, []);

    if (showIframe) {
        return (
            <iframe
                className={className}
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        );
    }

    return (
        <button
            onClick={handlePlay}
            className={`relative cursor-pointer group border-0 p-0 bg-black ${className}`}
            aria-label={`Play video: ${title}`}
            type="button"
        >
            {/* YouTube thumbnail */}
            <Image
                src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                alt={title}
                fill
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                sizes="(max-width: 768px) 100vw, 400px"
                quality={75}
                loading="lazy"
            />

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-red-500 transition-colors group-hover:scale-110 transform duration-200">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>
        </button>
    );
}
