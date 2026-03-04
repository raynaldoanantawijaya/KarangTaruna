import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Lazy initialization — Firebase SDK only loads when first accessed.
// Public pages (beranda, profil, kontak, berita) never call these,
// so they get zero Firebase overhead. Only login/admin pages trigger loading.
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

function getFirebaseApp(): FirebaseApp {
    if (!_app) {
        _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    }
    return _app;
}

function getFirebaseAuth(): Auth {
    if (!_auth) {
        _auth = getAuth(getFirebaseApp());
    }
    return _auth;
}

// Export lazy getters instead of eager instances
export { getFirebaseApp as getApp, getFirebaseAuth as getAuth };

// Backward compatibility — named exports that match old usage
export const app = new Proxy({} as FirebaseApp, {
    get(_, prop) {
        return (getFirebaseApp() as any)[prop];
    }
});

export const auth = new Proxy({} as Auth, {
    get(_, prop) {
        return (getFirebaseAuth() as any)[prop];
    }
});
