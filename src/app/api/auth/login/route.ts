import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { logActivity } from '@/lib/activity-logger';
import { signSession } from '@/lib/session';
import crypto from 'crypto';

const MAX_SESSIONS = 2;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { idToken, location, clientDevice } = body;

        if (!idToken || typeof idToken !== 'string') {
            return NextResponse.json({ error: 'Valid ID Token string required' }, { status: 400 });
        }

        // Verify Firebase ID Token
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Lookup user data from Firestore by Firebase UID
        let role = 'superadmin';
        let permissions: string[] = ['all'];
        let userName = decodedToken.name || 'Admin User';
        let isBlocked = false;

        const usersSnapshot = await adminDb.collection('users')
            .where('uid', '==', uid)
            .limit(1)
            .get();

        if (!usersSnapshot.empty) {
            const userData = usersSnapshot.docs[0].data();
            role = userData.role || 'editor';
            permissions = userData.permissions || [];
            userName = userData.name || userName;
            isBlocked = userData.isBlocked || false;
        }

        // Block login if user is blocked
        if (isBlocked) {
            return NextResponse.json({ error: 'Akun Anda diblokir. Hubungi Super Admin.' }, { status: 403 });
        }

        // ── Active Session Limit Check ──────────────────────────────────────
        // Purge sessions older than 25 hours (safety cleanup for expired cookies)
        const sessionsRef = adminDb.collection('active_sessions');

        // Purge stale sessions for this user (older than 25 hours)
        const cutoff = Date.now() - 25 * 60 * 60 * 1000;
        const staleSessionsSnap = await sessionsRef
            .where('userId', '==', uid)
            .where('createdAt', '<', cutoff)
            .get();
        const staleDeletes = staleSessionsSnap.docs.map(doc => doc.ref.delete());
        await Promise.all(staleDeletes);

        // Count current active sessions for this user
        const activeSnap = await sessionsRef.where('userId', '==', uid).get();
        const activeCount = activeSnap.size;

        if (activeCount >= MAX_SESSIONS) {
            return NextResponse.json({
                error: `Maksimal ${MAX_SESSIONS} perangkat dapat login secara bersamaan. Logout dari salah satu perangkat terlebih dahulu.`,
                code: 'MAX_SESSIONS_REACHED'
            }, { status: 429 });
        }

        // Generate unique session ID for this login
        const sessionId = crypto.randomUUID();

        // Register this session in Firestore
        await sessionsRef.doc(sessionId).set({
            userId: uid,
            sessionId,
            userName,
            role,
            deviceInfo: clientDevice || null,
            location: location || null,
            createdAt: Date.now(),
            lastActive: Date.now(),
        });

        // ───────────────────────────────────────────────────────────────────

        const sessionData = {
            id: uid,
            sessionId, // Embed so logout can reference it
            username: decodedToken.email || 'Admin',
            role,
            permissions,
            name: userName,
            location: location || null,
            clientDevice: clientDevice || null
        };

        const cookieStore = await cookies();

        cookieStore.set('admin_session', signSession(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day auto logout
            path: '/',
        });

        // Log login activity
        await logActivity(uid, sessionData.username, 'LOGIN', 'Masuk via Firebase Auth', request, { location, clientDevice });

        return NextResponse.json({ success: true, user: sessionData });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
}
