'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * OptimizedImage — drop-in replacement for <img> on public pages.
 * 
 * Uses Next.js Image component which automatically:
 * - Converts to WebP format
 * - Resizes to the optimal size for the device
 * - Lazy loads images below the fold
 * - Serves from Next.js image CDN cache
 * 
 * Quality is set to 75 (good visual quality, small file size).
 * Falls back to a placeholder on error.
 */

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    fill?: boolean;
    priority?: boolean;
    fallbackSrc?: string;
    quality?: number;
    sizes?: string;
}

const DEFAULT_FALLBACK = '/logo-kt.webp';

export default function OptimizedImage({
    src,
    alt,
    className = '',
    width,
    height,
    fill = false,
    priority = false,
    fallbackSrc = DEFAULT_FALLBACK,
    quality = 75,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: OptimizedImageProps) {
    const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
    const [hasError, setHasError] = useState(false);

    // Determine if the source is a remote URL or local
    const isRemote = imgSrc.startsWith('http://') || imgSrc.startsWith('https://');
    const isLocalPath = imgSrc.startsWith('/');

    // For sources that Next.js Image can't handle (unknown remote hostnames),
    // fall back to regular img tag with explicit sizing
    const canUseNextImage = isLocalPath || isRemote;

    if (!canUseNextImage || hasError) {
        return (
            <img
                src={hasError ? fallbackSrc : imgSrc}
                alt={alt}
                className={className}
                loading="lazy"
                onError={() => {
                    if (!hasError) setHasError(true);
                }}
            />
        );
    }

    const imageProps = fill
        ? { fill: true as const, sizes }
        : { width: width || 800, height: height || 600 };

    return (
        <Image
            src={imgSrc}
            alt={alt}
            className={className}
            quality={quality}
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
            onError={() => {
                setImgSrc(fallbackSrc);
                setHasError(true);
            }}
            {...imageProps}
        />
    );
}
