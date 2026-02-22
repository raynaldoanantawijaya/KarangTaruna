'use client';

import React, { createContext, useContext, useEffect } from 'react';

// ... (interface left alone via replace)
interface AdminSession {
    id: string;
    sessionId?: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
}

const AdminSessionContext = createContext<AdminSession | null>(null);

export function AdminSessionProvider({
    session,
    children,
}: {
    session: AdminSession | null;
    children: React.ReactNode;
}) {
    useEffect(() => {
        if (!session) return;

        // Poll every 15 seconds to check if session is still valid
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/auth/session-status');
                if (res.ok) {
                    const data = await res.json();
                    if (data.valid === false) {
                        // Session revoked from somewhere else, immediately kick out
                        window.location.href = '/api/auth/handle-revoked-session';
                    }
                }
            } catch (err) {
                // Ignore network errors so we don't accidentally log out users who 
                // temporarily lose internet connection
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [session]);

    return (
        <AdminSessionContext.Provider value={session}>
            {children}
        </AdminSessionContext.Provider>
    );
}

export function useAdminSession() {
    return useContext(AdminSessionContext);
}

/**
 * Check if user has the required permission
 * Superadmin role or 'all' permission bypasses all checks
 */
export function hasPermission(session: AdminSession | null, requiredPermission: string): boolean {
    if (!session) return false;
    if (session.role === 'superadmin') return true;
    if (session.permissions.includes('all')) return true;
    return session.permissions.includes(requiredPermission);
}
