import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { AdminSessionProvider } from '@/components/admin/AdminSessionContext';
import { ToastProvider } from '@/components/admin/ToastContext';
import { verifySession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import IdleTimeout from '@/components/admin/IdleTimeout';


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
            // Check if session still exists in Firestore (hasn't been revoked)
            let sessionValid = true;
            if (parsed.sessionId) {
                try {
                    const sessionDoc = await adminDb.collection('active_sessions').doc(parsed.sessionId).get();
                    if (!sessionDoc.exists) {
                        sessionValid = false;
                    }
                } catch (e) {
                    // If Firestore fails, assume valid to prevent global lockout during DB issues
                    console.warn("Failed to verify session against Firestore", e);
                }
            }

            if (!sessionValid) {
                // Session was revoked (deleted from DB)
                // We cannot delete cookies from layout directly in App Router cleanly without a route handler
                // So we'll redirect them to login, where the middleware or login page will overwrite the cookie.
                // Actually, best to redirect to a new route that clears the cookie, or we can just redirect to /login
                // and the login page will overwrite. Middlewares don't clear it.
                // Wait, redirecting to a server action or API route is better. Let's redirect to a logout route.
                redirect('/api/auth/handle-revoked-session');
            }

            user = {
                name: parsed.name,
                email: parsed.username || parsed.email
            };
            session = {
                id: parsed.id,
                sessionId: parsed.sessionId || '',
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

                <AdminSessionProvider session={session}>
                    <AdminNavbar user={user} />
                    {children}
                </AdminSessionProvider>
            </ToastProvider>
        </div>
    );
}
