'use client';

import { useEffect, useRef } from 'react';

export default function VisitorTracker() {
    const hasTracked = useRef(false);

    useEffect(() => {
        if (hasTracked.current) return;

        // Ensure we only track once per session/page load in development
        // In production, React.StrictMode is off so useEffect runs once

        const trackVisit = async () => {
            try {
                await fetch('/api/visitor', { method: 'POST' });
                hasTracked.current = true;
            } catch (error) {
                console.error('Failed to track visit:', error);
            }
        };

        trackVisit();
    }, []);

    return null; // This component renders nothing
}
