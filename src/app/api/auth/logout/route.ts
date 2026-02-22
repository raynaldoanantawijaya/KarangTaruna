import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminDb } from '@/lib/firebase-admin';
import { verifySession } from '@/lib/session';
import { logActivity } from '@/lib/activity-logger';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const cookieValue = cookieStore.get('admin_session')?.value;

        // Read GPS location captured by the client at logout time
        let logoutLocation = null;
        try {
            const body = await request.json();
            logoutLocation = body.location || null;
        } catch { /* body is empty or not JSON */ }

        if (cookieValue) {
            const session = verifySession(cookieValue);

            // Remove this session from Firestore if we have a sessionId
            if (session?.sessionId) {
                try {
                    await adminDb.collection('active_sessions').doc(session.sessionId).delete();
                } catch (err) {
                    console.error('Failed to remove session from Firestore:', err);
                }
            }

            // Log logout activity with the captured GPS location
            if (session?.id) {
                try {
                    await logActivity(
                        session.id,
                        session.username || session.name || 'Admin',
                        'LOGOUT',
                        'Keluar dari sistem',
                        request,
                        { location: logoutLocation }
                    );
                } catch (err) {
                    console.error('Failed to log logout activity:', err);
                }
            }
        }

        cookieStore.delete('admin_session');
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Logout error:', error);
        // Still delete the cookie even if cleanup fails
        const cookieStore = await cookies();
        cookieStore.delete('admin_session');
        return NextResponse.json({ success: true });
    }
}

