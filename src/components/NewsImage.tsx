'use client';

import { useState } from 'react';
import Image from 'next/image';

interface NewsImageProps {
    src: string;
    alt: string;
    className?: string;
}

/**
 * NewsImage — optimized with next/image for automatic WebP conversion,
 * lazy loading, and responsive sizing. Falls back to placeholder on error.
 */
export default function NewsImage({ src, alt, className }: NewsImageProps) {
    const fallback = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop";
    const [imgSrc, setImgSrc] = useState(src || fallback);
    const [hasError, setHasError] = useState(false);

    return (
        <Image
            src={hasError ? fallback : imgSrc}
            alt={alt}
            className={className}
            width={800}
            height={450}
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
