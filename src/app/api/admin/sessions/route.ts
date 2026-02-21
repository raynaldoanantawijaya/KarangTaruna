import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import { logActivity } from '@/lib/activity-logger';

async function getCurrentUser() {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get('admin_session')?.value;
    if (!cookieValue) return null;
    return verifySession(cookieValue);
}

// GET: List all active sessions (superadmin only) or own sessions
export async function GET() {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        let query: FirebaseFirestore.Query = adminDb.collection('active_sessions');

        // Superadmin can see all sessions; others only see their own
        if (currentUser.role !== 'superadmin' && !currentUser.permissions?.includes('all')) {
            query = query.where('userId', '==', currentUser.id);
        }

        const snap = await query.orderBy('createdAt', 'desc').get();
        const sessions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({ sessions });
    } catch (error: any) {
        console.error('Error fetching active sessions:', error);
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }
}

// DELETE: Revoke a specific session (superadmin or own session only)
export async function DELETE(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
        }

        const sessionRef = adminDb.collection('active_sessions').doc(sessionId);
        const sessionDoc = await sessionRef.get();

        if (!sessionDoc.exists) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const sessionData = sessionDoc.data();

        // Only superadmin can revoke other users' sessions
        const isSuperAdmin = currentUser.role === 'superadmin' || currentUser.permissions?.includes('all');
        const isOwn = sessionData?.userId === currentUser.id;

        if (!isSuperAdmin && !isOwn) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await sessionRef.delete();

        await logActivity(
            currentUser.id,
            currentUser.username || currentUser.name,
            'REVOKE_SESSION',
            `Mencabut sesi perangkat: ${sessionData?.deviceInfo?.model || sessionData?.deviceInfo?.os || sessionId}`,
            request
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error revoking session:', error);
        return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 });
    }
}
