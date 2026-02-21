import { adminDb, adminAuth } from '@/lib/firebase-admin';

// In-memory rate limiter (since Next.js serverless functions might recycle, 
// a true production app might use Redis, but for admin panel this is sufficient)
const rateLimits = new Map<string, { count: number; firstRequest: number }>();

const BURST_LIMIT_DELETE = 10; // Max 10 deletes per window
const BURST_LIMIT_POST = 20; // Max 20 creations/updates per window
const BURST_LIMIT_GET = 100; // Max reads per window
const WINDOW_MS = 60 * 1000; // 1 minute window

export async function checkRateLimitAndKillSwitch(
    userId: string,
    actionType: 'GET' | 'POST' | 'DELETE'
) {
    const now = Date.now();
    const limiterKey = `${userId}-${actionType}`;

    let record = rateLimits.get(limiterKey);

    if (!record || now - record.firstRequest > WINDOW_MS) {
        record = { count: 0, firstRequest: now };
    }

    record.count++;
    rateLimits.set(limiterKey, record);

    // 1. Check Limits
    let limit = BURST_LIMIT_GET;
    if (actionType === 'POST') limit = BURST_LIMIT_POST;
    if (actionType === 'DELETE') limit = BURST_LIMIT_DELETE;

    if (record.count > limit) {
        // 2. Kill Switch for Mass Deletions
        if (actionType === 'DELETE' && record.count > BURST_LIMIT_DELETE + 2) {
            // If they severely exceed the delete limit, auto-block the account
            await revokeAdminAccess(userId);
            throw new Error('KILL_SWITCH_ACTIVATED');
        }

        throw new Error('RATE_LIMIT_EXCEEDED');
    }
}

/**
 * Instantly blocks a user in Firestore and disables them in Firebase Auth
 */
async function revokeAdminAccess(userId: string) {
    try {
        const docRef = adminDb.collection('users').doc(userId);
        const doc = await docRef.get();

        if (doc.exists) {
            const userData = doc.data();
            // DO NOT BLOCK THE FOUNDER
            if (userData?.email === 'anantawijaya212@gmail.com') {
                console.warn('Attempted to auto-block the Founder account. Ignored.');
                return;
            }

            await docRef.update({ isBlocked: true });

            if (userData?.uid) {
                await adminAuth.updateUser(userData.uid, { disabled: true });
            }

            // Log the kill switch activation
            await adminDb.collection('activity_logs').add({
                userId: 'SYSTEM',
                userName: 'System Security',
                action: 'KILL_SWITCH',
                details: `Akun ${userData?.email || userId} diblokir otomatis karena terdeteksi melakukan penghapusan massal abnormal.`,
                ip: '127.0.0.1',
                userAgent: 'System Automated Action',
                device: 'Server',
                timestamp: new Date().toISOString()
            });
        }
    } catch (err) {
        console.error('Failed to execute kill switch on user', userId, err);
    }
}
