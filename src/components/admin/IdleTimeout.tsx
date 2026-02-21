'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastContext';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export default function IdleTimeout() {
    const router = useRouter();
    const { showToast } = useToast();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            showToast('Sesi otomatis berakhir karena tidak ada aktivitas.', 'error');
            router.push('/login');
            router.refresh(); // Ensure the layout re-fetches without the cookie
        } catch (error) {
            console.error('Logout error', error);
        }
    }, [router, showToast]);

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(logout, IDLE_TIMEOUT_MS);
    }, [logout]);

    useEffect(() => {
        // Event listeners to detect activity
        const events = ['mousemove', 'keydown', 'wheel', 'DOMMouseScroll', 'mouseWheel', 'mousedown', 'touchstart', 'touchmove', 'MSPointerDown', 'MSPointerMove'];

        const handleActivity = () => {
            resetTimer();
        };

        // Initialize timer
        resetTimer();

        // Attach listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer]);

    return null; // This component doesn't render anything
}
