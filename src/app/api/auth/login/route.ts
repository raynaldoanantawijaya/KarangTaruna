import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { logActivity } from '@/lib/activity-logger';
import { signSession } from '@/lib/session';

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

        const sessionData = {
            id: uid,
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
