'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GalleryImageProps {
    src: string;
    alt: string;
    className?: string;
}

/**
 * GalleryImage — optimized with next/image for automatic WebP conversion,
 * lazy loading, and responsive sizing. Falls back to placeholder on error.
 */
export default function GalleryImage({ src, alt, className }: GalleryImageProps) {
    const fallback = '/logo-kt.webp';
    const [imgSrc, setImgSrc] = useState(src || fallback);
    const [hasError, setHasError] = useState(false);

    return (
        <Image
            src={hasError ? fallback : imgSrc}
            alt={alt}
            className={className}
            width={800}
            height={600}
            quality={75}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
            onError={() => {
                if (!hasError) {
                    setImgSrc(fallback);
                    setHasError(true);
                }
            }}
        />
    );
}
