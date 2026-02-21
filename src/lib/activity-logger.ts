import { adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';

const LOGS_COLLECTION = 'activity_logs';

/**
 * Helper to check permissions / active admin session.
 * Used across API routes to verify authenticated admin.
 */
export async function checkAuth(request: Request) {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    if (!session) return null;

    return verifySession(session.value);
}

function getDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('windows phone')) return 'Windows Phone';
    if (ua.includes('windows')) return 'Windows PC';
    if (ua.includes('iphone')) return 'Apple iPhone';
    if (ua.includes('ipad')) return 'Apple iPad';
    if (ua.includes('macintosh') || ua.includes('mac os')) return 'Apple Mac';
    if (ua.includes('android')) return 'Android Device';
    if (ua.includes('linux')) return 'Linux PC';
    return 'Unknown Device';
}

/**
 * Helper to log activity to Firestore `activity_logs` collection.
 */
export async function logActivity(
    userId: string,
    username: string,
    action: string,
    details: string,
    request: Request
) {
    try {
        let ip = 'unknown';
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const cfIp = request.headers.get('cf-connecting-ip');

        if (forwardedFor) {
            ip = forwardedFor.split(',')[0].trim();
        } else if (realIp) {
            ip = realIp;
        } else if (cfIp) {
            ip = cfIp;
        }

        const userAgent = request.headers.get('user-agent') || 'unknown';
        const device = getDeviceType(userAgent);

        await adminDb.collection(LOGS_COLLECTION).add({
            userId,
            userName: username,
            action,
            details,
            ip,
            userAgent,
            device,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}
