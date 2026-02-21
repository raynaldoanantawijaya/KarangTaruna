'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timersRef = useRef<NodeJS.Timeout[]>([]);
    const prevPathRef = useRef(pathname);

    const clearTimers = useCallback(() => {
        timersRef.current.forEach(t => clearTimeout(t));
        timersRef.current = [];
    }, []);

    const startLoading = useCallback(() => {
        clearTimers();
        setVisible(true);
        setProgress(15);

        // Simulate incremental progress
        timersRef.current.push(setTimeout(() => setProgress(30), 100));
        timersRef.current.push(setTimeout(() => setProgress(50), 300));
        timersRef.current.push(setTimeout(() => setProgress(65), 700));
        timersRef.current.push(setTimeout(() => setProgress(78), 1500));
        timersRef.current.push(setTimeout(() => setProgress(85), 3000));
        timersRef.current.push(setTimeout(() => setProgress(90), 5000));
    }, [clearTimers]);

    const completeLoading = useCallback(() => {
        clearTimers();
        // 1. Jump to 100% (fill the bar completely)
        setProgress(100);
        // 2. After the bar reaches the end, fade it out
        timersRef.current.push(setTimeout(() => {
            setVisible(false);
            // 3. Reset progress to 0 after fade-out animation completes
            timersRef.current.push(setTimeout(() => setProgress(0), 400));
        }, 350));
    }, [clearTimers]);

    // When route changes, complete the progress bar
    useEffect(() => {
        if (prevPathRef.current !== pathname) {
            completeLoading();
        }
        prevPathRef.current = pathname;
    }, [pathname, searchParams, completeLoading]);

    // Listen for link clicks to start the bar
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');
            if (!anchor || !anchor.href || anchor.target || anchor.download) return;

            try {
                const url = new URL(anchor.href, window.location.origin);
                // Only trigger for internal navigation to different pages
                if (url.origin === window.location.origin && url.pathname !== pathname) {
                    startLoading();
                }
            } catch {
                // Invalid URL, ignore
            }
        };

        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, [pathname, startLoading]);

    // Cleanup on unmount
    useEffect(() => clearTimers, [clearTimers]);

    if (!visible && progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none">
            <div
                className="h-full bg-gradient-to-r from-primary via-sky-400 to-secondary rounded-r-full"
                style={{
                    width: `${progress}%`,
                    opacity: visible ? 1 : 0,
                    transition: progress === 100
                        ? 'width 250ms ease-out'
                        : 'width 400ms ease-out',
                    boxShadow: visible ? '0 0 10px rgba(14, 165, 233, 0.5), 0 0 5px rgba(14, 165, 233, 0.3)' : 'none',
                }}
            />
            {/* Glow dot at the tip */}
            {visible && progress > 0 && progress < 100 && (
                <div
                    className="absolute top-0 h-[3px] w-[80px] rounded-r-full"
                    style={{
                        right: `${100 - progress}%`,
                        background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.6))',
                    }}
                />
            )}
        </div>
    );
}
