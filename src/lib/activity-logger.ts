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
    isMobile?: boolean;
    touchPoints?: number;
    screenWidth?: number;
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

        // If cDevice.os is already resolved by login route (Android/Windows/etc), trust it
        const resolvedOs = cDevice?.os || osResult.name || '';
        const resolvedBrowser = (cDevice as any)?.browser || browserResult.name || '';
        const resolvedModel = cDevice?.model || deviceResult.model || '';
        const resolvedBrand = cDevice?.brand || deviceResult.vendor || '';

        if (resolvedModel || resolvedBrand) {
            // Has specific device model info
            const parts = [resolvedBrand, resolvedModel].filter(Boolean).join(' ');
            deviceString = resolvedOs ? `${parts} (${resolvedOs})` : parts;
        } else if (resolvedOs === 'Android' || resolvedOs === 'iOS') {
            // Mobile device without model name
            deviceString = resolvedBrowser
                ? `${resolvedOs} via ${resolvedBrowser}`
                : resolvedOs;
        } else if (resolvedOs) {
            // Desktop OS
            const suffix = resolvedOs.toLowerCase().includes('android') || (cDevice as any)?.isMobile ? '' : ' PC';
            deviceString = resolvedBrowser
                ? `${resolvedOs}${suffix} via ${resolvedBrowser}`
                : `${resolvedOs}${suffix}`;
        }

        // Prettify common names

        deviceString = deviceString.replace(/\s+/g, ' ').trim() || 'Unknown Device';

        // Prettify common names
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
