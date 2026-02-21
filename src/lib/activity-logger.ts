import { adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import { UAParser } from 'ua-parser-js';

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

interface LocationData {
    latitude: number;
    longitude: number;
    address?: string;
    accuracy?: number;
}

interface DeviceInfo {
    brand?: string;
    model?: string;
    os?: string;
}

/**
 * Helper to log activity to Firestore `activity_logs` collection.
 */
export async function logActivity(
    userId: string,
    username: string,
    action: string,
    details: string,
    request: Request,
    extraData?: { location?: LocationData | null, clientDevice?: DeviceInfo | null }
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

        let loc = extraData?.location;
        let cDevice = extraData?.clientDevice;

        if (!loc || !cDevice) {
            const session = await checkAuth(request);
            if (session) {
                if (!loc) loc = session.location;
                if (!cDevice) cDevice = session.clientDevice;
            }
        }

        // Advanced Device Parsing
        const parser = new UAParser(userAgent);
        const deviceResult = parser.getDevice();
        const osResult = parser.getOS();
        const browserResult = parser.getBrowser();

        let deviceString = 'Unknown Device';

        // 1. Prioritize High-Entropy Client Hints if provided by frontend
        if (cDevice?.model || cDevice?.brand) {
            const brand = cDevice.brand || '';
            const model = cDevice.model || '';
            const os = cDevice.os || osResult.name || '';
            deviceString = `${brand} ${model} (${os})`.trim();
        }
        // 2. Fallback to UAParser (works well for older Androids, iOS, and Macs)
        else if (deviceResult.vendor || deviceResult.model) {
            const vendor = deviceResult.vendor || '';
            const model = deviceResult.model || '';
            const os = osResult.name ? ` (${osResult.name})` : '';
            deviceString = `${vendor} ${model}${os}`.trim();
        }
        // 3. Fallback for Desktop/PC (where model is typically blank but OS is known)
        else if (osResult.name) {
            const browser = browserResult.name ? ` via ${browserResult.name}` : '';
            deviceString = `${osResult.name} PC${browser}`;
        }

        // Clean up string
        deviceString = deviceString.replace(/\s+/g, ' ').trim() || 'Unknown Device';

        // If it's still missing essential info like 'Windows PC', make it prettier
        if (deviceString === 'Windows PC') deviceString = 'Windows PC';
        if (deviceString.includes('Mac OS')) deviceString = deviceString.replace('Mac OS', 'Apple Mac');

        const logEntry: any = {
            userId,
            userName: username,
            action,
            details,
            ip,
            userAgent,
            device: deviceString,
            timestamp: new Date().toISOString()
        };

        if (loc) {
            logEntry.location = loc;
        }

        await adminDb.collection(LOGS_COLLECTION).add(logEntry);
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}
