import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminDb } from '@/lib/firebase-admin';
import { verifySession } from '@/lib/session';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('admin_session');

        if (!sessionCookie) {
            return NextResponse.json({ valid: false });
        }

        const parsed = verifySession(sessionCookie.value);
        if (!parsed || !parsed.sessionId) {
            return NextResponse.json({ valid: false });
        }

        // Check if session still exists in Firestore
        const sessionDoc = await adminDb.collection('active_sessions').doc(parsed.sessionId).get();
        if (!sessionDoc.exists) {
            return NextResponse.json({ valid: false });
        }

        // Optional: Update lastActive timestamp here so we know the user is still online
        // Only do this if we want to track real-time activity, but it adds write load.
        // For now, just verifying existence is enough.

        return NextResponse.json({ valid: true });
    } catch (error) {
        console.error('API /session-status error:', error);
        // On error, assume valid to prevent false positive logouts during temporary DB issues
        return NextResponse.json({ valid: true });
    }
}
