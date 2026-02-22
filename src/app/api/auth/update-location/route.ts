import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminDb } from '@/lib/firebase-admin';
import { verifySession } from '@/lib/session';

export async function POST(request: Request) {
    try {
        // ── Authentication Gate ──────────────────────────────────────────────
        // Verify the admin_session cookie — only the session owner can update their own location
        const cookieStore = await cookies();
        const cookieValue = cookieStore.get('admin_session')?.value;
        if (!cookieValue) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const session = verifySession(cookieValue);
        if (!session?.sessionId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }
        // ────────────────────────────────────────────────────────────────────

        const body = await request.json();
        const { sessionId, address, latitude, longitude, accuracy } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        // Prevent cross-session location poisoning — reject if caller tries to update someone else's session
        if (sessionId !== session.sessionId) {
            return NextResponse.json({ error: 'Forbidden: session mismatch' }, { status: 403 });
        }

        const sessionRef = adminDb.collection('active_sessions').doc(sessionId);

        // Build the update — only update fields that are provided and are correct types
        const locationUpdate: Record<string, any> = {};
        if (address && typeof address === 'string') locationUpdate['location.address'] = address;
        if (latitude !== undefined && typeof latitude === 'number') locationUpdate['location.latitude'] = latitude;
        if (longitude !== undefined && typeof longitude === 'number') locationUpdate['location.longitude'] = longitude;
        if (accuracy !== undefined && typeof accuracy === 'number') locationUpdate['location.accuracy'] = accuracy;

        if (Object.keys(locationUpdate).length > 0) {
            await sessionRef.update(locationUpdate);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update location error:', error);
        return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }
}
