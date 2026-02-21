
import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { checkAuth, logActivity } from '@/lib/activity-logger';

const USERS_COLLECTION = 'users';

export async function GET(request: Request) {
    const currentUser = await checkAuth(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const snapshot = await adminDb.collection(USERS_COLLECTION).orderBy('createdAt', 'desc').get();
        // Remove passwords from response
        const safeUsers = snapshot.docs.map(doc => {
            const { password, ...userData } = doc.data();
            return { id: doc.id, ...userData };
        });
        return NextResponse.json(safeUsers);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const currentUser = await checkAuth(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { name, email, password, role, permissions } = body;

        // 1. Create user in Firebase Authentication (so they can login)
        let firebaseUser;
        try {
            firebaseUser = await adminAuth.createUser({
                email,
                password,
                displayName: name,
            });
        } catch (authError: any) {
            // Handle specific Firebase Auth errors
            if (authError.code === 'auth/email-already-exists') {
                return NextResponse.json({ error: 'Email sudah terdaftar di Firebase' }, { status: 400 });
            }
            if (authError.code === 'auth/invalid-email') {
                return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
            }
            if (authError.code === 'auth/weak-password') {
                return NextResponse.json({ error: 'Password terlalu lemah (minimal 6 karakter)' }, { status: 400 });
            }
            throw authError;
        }

        // 2. Save user metadata to Firestore
        const newUser = {
            name,
            email,
            uid: firebaseUser.uid, // Store Firebase Auth UID for reference
            role: role || 'editor',
            permissions: permissions || [],
            isBlocked: false,
            createdAt: new Date().toISOString()
        };

        const docRef = await adminDb.collection(USERS_COLLECTION).add(newUser);

        await logActivity(currentUser.id, currentUser.username || currentUser.email, 'CREATE_USER', `Menambahkan user baru: ${email} (${name})`, request);

        return NextResponse.json({ id: docRef.id, ...newUser });

    } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
