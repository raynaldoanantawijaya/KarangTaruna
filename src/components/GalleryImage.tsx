'use client';

import { useState } from 'react';

interface GalleryImageProps {
    src: string;
    alt: string;
    className?: string;
}

export default function GalleryImage({ src, alt, className }: GalleryImageProps) {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={() => {
                setImgSrc('https://via.placeholder.com/800x600?text=Image+Error');
            }}
        />
    );
}
