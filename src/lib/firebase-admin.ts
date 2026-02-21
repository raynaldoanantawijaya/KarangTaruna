import admin from 'firebase-admin';

function initFirebaseAdmin() {
    if (admin.apps.length) return admin.app();

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        console.warn('Firebase Admin SDK: Missing environment variables. Skipping initialization.');
        return null;
    }

    try {
        return admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        });
    } catch (error) {
        console.error('Firebase Admin initialization error', error);
        return null;
    }
}

const app = initFirebaseAdmin();

// Lazy getters that only work when the app is initialized
export const adminAuth = app ? admin.auth() : (null as unknown as admin.auth.Auth);
export const adminDb = app ? admin.firestore() : (null as unknown as admin.firestore.Firestore);
