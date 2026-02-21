'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/admin/ToastContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function PersistentGPSWatcher() {
    const router = useRouter();
    const { showToast } = useToast();
    const isLoggingOut = useRef(false);

    useEffect(() => {
        // Skip setup if already logging out
        if (isLoggingOut.current) return;

        let watchId: number;

        const handleForceLogout = async (reason: string) => {
            if (isLoggingOut.current) return;
            isLoggingOut.current = true;

            // Clear the watch
            if (watchId !== undefined) {
                navigator.geolocation.clearWatch(watchId);
            }

            try {
                // 1. Sign out from Firebase
                await signOut(auth);

                // 2. Clear Session Cookie securely via API
                await fetch('/api/auth/logout', { method: 'POST' });

                // 3. Kick user out with specific error
                showToast(`Keamanan GPS: ${reason}`, 'error');
                router.replace('/login?error=gps_disabled');
            } catch (err) {
                console.error("Force logout failed:", err);
                // Hard reload fallback
                window.location.href = '/login?error=gps_disabled';
            }
        };

        if (!navigator.geolocation) {
            handleForceLogout('Browser tidak mendukung lokasi');
            return;
        }

        // Start watching GPS continuously
        watchId = navigator.geolocation.watchPosition(
            // Success: Admin still has GPS on (do nothing but keep watching)
            (position) => {
                // We don't need to constantly spam the server with coordinate changes,
                // we just need to ensure the permission stays granted and sensor active.
            },
            // Error: Permission denied or sensor disabled!
            (error) => {
                let errorMsg = 'GPS/Lokasi dimatikan.';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMsg = 'Anda mencabut izin lokasi.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMsg = 'Sensor GPS dimatikan dari sistem.';
                }

                handleForceLogout(errorMsg);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000 // Small cache so it checks frequently
            }
        );

        return () => {
            if (watchId !== undefined) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [router, showToast]);

    return null; // This component has no UI, it runs purely in the background
}
