'use client';

import { Lock } from 'lucide-react';
import { useAdminSession, hasPermission } from './AdminSessionContext';

interface PermissionGateProps {
    permission: string;
    children: React.ReactNode;
}

/**
 * Wraps a page/section that requires a specific permission.
 * Shows a locked screen if the user doesn't have the required permission.
 */
export default function PermissionGate({ permission, children }: PermissionGateProps) {
    const session = useAdminSession();

    if (hasPermission(session, permission)) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 rounded-xl mx-4 my-8">
            <div className="text-center px-8 py-12">
                <div className="mx-auto w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Akses Ditolak
                </h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm max-w-sm">
                    Anda tidak memiliki izin untuk mengakses halaman ini.
                    Hubungi <span className="font-semibold text-gray-500 dark:text-gray-400">Super Admin</span> untuk mendapatkan perizinan.
                </p>
            </div>
        </div>
    );
}
