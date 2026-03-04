'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GalleryImageProps {
    src: string;
    alt: string;
    className?: string;
}

/**
 * GalleryImage — uses next/image fill mode to perfectly cover the parent container.
 * Parent must have `position: relative` and explicit height.
 */
export default function GalleryImage({ src, alt, className }: GalleryImageProps) {
    const fallback = '/logo-kt.webp';
    const [imgSrc, setImgSrc] = useState(src || fallback);
    const [hasError, setHasError] = useState(false);

    return (
        <Image
            src={hasError ? fallback : imgSrc}
            alt={alt}
            className={`object-cover ${className || ''}`}
            fill
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
