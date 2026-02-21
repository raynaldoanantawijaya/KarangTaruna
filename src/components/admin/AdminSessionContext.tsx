'use client';

import React, { createContext, useContext } from 'react';

interface AdminSession {
    id: string;
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
