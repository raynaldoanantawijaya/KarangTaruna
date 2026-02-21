import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { AdminSessionProvider } from '@/components/admin/AdminSessionContext';
import { ToastProvider } from '@/components/admin/ToastContext';
import { verifySession } from '@/lib/session';
import IdleTimeout from '@/components/admin/IdleTimeout';
import PersistentGPSWatcher from '@/components/admin/PersistentGPSWatcher';

export const metadata: Metadata = {
    title: 'Admin Dashboard | Karang Taruna Asta Wira Dipta',
    robots: {
        index: false,
        follow: false,
    },
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // ... code truncated for brevity ...
    // Get user session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');
    let user = undefined;
    let session = null;

    if (sessionCookie) {
        const parsed = verifySession(sessionCookie.value);
        if (parsed) {
            user = {
                name: parsed.name,
                email: parsed.username || parsed.email
            };
            session = {
                id: parsed.id,
                name: parsed.name,
                email: parsed.username || parsed.email,
                role: parsed.role || 'editor',
                permissions: parsed.permissions || [],
            };
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 admin-mobile-scale">
            <ToastProvider>
                <IdleTimeout />
                <PersistentGPSWatcher />
                <AdminSessionProvider session={session}>
                    <AdminNavbar user={user} />
                    {children}
                </AdminSessionProvider>
            </ToastProvider>
        </div>
    );
}
