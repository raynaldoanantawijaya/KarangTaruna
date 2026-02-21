'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const startLoading = useCallback(() => {
        setLoading(true);
        setProgress(20);

        // Simulate progress
        const timer1 = setTimeout(() => setProgress(50), 200);
        const timer2 = setTimeout(() => setProgress(70), 500);
        const timer3 = setTimeout(() => setProgress(85), 1000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    useEffect(() => {
        // Complete the progress bar when route changes
        setProgress(100);
        const timer = setTimeout(() => {
            setLoading(false);
            setProgress(0);
        }, 300);

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    // Listen for click on links to start the progress bar
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');
            if (anchor && anchor.href && !anchor.target && !anchor.download) {
                const url = new URL(anchor.href, window.location.origin);
                if (url.origin === window.location.origin && url.pathname !== pathname) {
                    startLoading();
                }
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [pathname, startLoading]);

    if (!loading && progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[99999] h-[3px]">
            <div
                className="h-full bg-gradient-to-r from-primary via-sky-400 to-secondary shadow-lg shadow-primary/30 transition-all duration-300 ease-out"
                style={{
                    width: `${progress}%`,
                    opacity: progress === 100 ? 0 : 1,
                    transition: progress === 100
                        ? 'width 200ms ease-out, opacity 300ms ease-out 200ms'
                        : 'width 300ms ease-out'
                }}
            />
        </div>
    );
}
