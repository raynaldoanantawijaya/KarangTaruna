'use client';

import { useState } from 'react';
import Image from 'next/image';

interface NewsImageProps {
    src: string;
    alt: string;
    className?: string;
}

/**
 * NewsImage — uses next/image fill mode to perfectly cover the parent container.
 * Parent must have `position: relative` and explicit height.
 */
export default function NewsImage({ src, alt, className }: NewsImageProps) {
    const fallback = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop";
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
