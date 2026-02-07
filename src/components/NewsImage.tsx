'use client';

import { useState } from 'react';

interface NewsImageProps {
    src: string;
    alt: string;
    className?: string;
}

export default function NewsImage({ src, alt, className }: NewsImageProps) {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <img
            src={imgSrc || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop"}
            alt={alt}
            className={className}
            onError={() => {
                setImgSrc("https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop");
            }}
        />
    );
}
