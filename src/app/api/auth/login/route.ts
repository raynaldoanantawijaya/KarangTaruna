import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { logActivity } from '@/lib/activity-logger';
import { signSession } from '@/lib/session';
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

const MAX_SESSIONS = 2;

/**
 * Read the true device info from HTTP headers (server-side).
 * Sec-CH-UA-* headers are sent by Chromium browsers and CANNOT be spoofed 
 * by Desktop Mode — they always reflect the real hardware.
 */
function parseDeviceFromRequest(request: Request) {
    const ua = request.headers.get('user-agent') || '';

    // Authentic Chromium Client Hint headers (not affected by Desktop Mode)
    const secPlatform = request.headers.get('sec-ch-ua-platform')?.replace(/"/g, '') || ''; // e.g. "Android"
    const secMobile = request.headers.get('sec-ch-ua-mobile') || '';                       // e.g. "?1" means mobile
    const secModel = request.headers.get('sec-ch-ua-model')?.replace(/"/g, '') || '';     // e.g. "iQOO I2218"
    const secUaBrands = request.headers.get('sec-ch-ua') || '';                              // e.g. '"Chromium";v="124", "Google Chrome";v="124"'

    const isMobileHeader = secMobile === '?1';

    // Parse browser name from sec-ch-ua brands
    let browserName = '';
    const brandMatch = secUaBrands.match(/"([^"]+)";v="(\d+)"/g);
    if (brandMatch) {
        const realBrand = brandMatch.find(b =>
            !b.toLowerCase().includes('not') &&
            !b.toLowerCase().includes('brand') &&
            !b.toLowerCase().includes('chromium')
        );
        if (realBrand) {
            const m = realBrand.match(/"([^"]+)"/);
            browserName = m ? m[1] : '';
        }
        if (!browserName) browserName = 'Chrome';
    }

    // Fallback to ua-parser-js for browser info
    const parser = new UAParser(ua);
    const uaBrowser = parser.getBrowser();
    const uaOs = parser.getOS();
    const uaDevice = parser.getDevice();

    // Determine the true OS — Sec-CH-UA-Platform is authoritative
    let trueOs = secPlatform || uaOs.name || 'Unknown';

    // If sec-ch-ua-platform says "Linux" but sec-ch-ua-mobile says "?1",
    // this is a Chromium quirk on Android — the real OS is Android
    if (trueOs === 'Linux' && isMobileHeader) {
        trueOs = 'Android';
    }

    // Build device model string
    let brand = '';
    let model = secModel; // The most accurate source

    if (!model && uaDevice.vendor) {
        brand = uaDevice.vendor;
        model = uaDevice.model || '';
    }

    // Browser label
    const finalBrowser = browserName || uaBrowser.name || 'Browser';

    return {
        brand,
        model,
        os: trueOs,
        browser: finalBrowser,
        isMobile: isMobileHeader || uaDevice.type === 'mobile' || uaDevice.type === 'tablet',
    };
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { idToken, location } = body;

        // Always detect device server-side from HTTP headers (cannot be spoofed by Desktop Mode)
        const serverDevice = parseDeviceFromRequest(request);

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
        const sessionsRef = adminDb.collection('active_sessions');
        const cutoff = Date.now() - 25 * 60 * 60 * 1000;

        // Fetch ALL sessions for this user with a simple single-field query (no index needed)
        const allUserSessionsSnap = await sessionsRef.where('userId', '==', uid).get();
        const allUserSessions = allUserSessionsSnap.docs;

        // Split into stale and active (filter in memory to avoid needing a composite index)
        const staleSessionDocs = allUserSessions.filter(doc => doc.data().createdAt < cutoff);
        const activeSessionDocs = allUserSessions.filter(doc => doc.data().createdAt >= cutoff);

        // Delete stale sessions (fire and forget)
        await Promise.all(staleSessionDocs.map(doc => doc.ref.delete()));

        const activeCount = activeSessionDocs.length;

        if (activeCount >= MAX_SESSIONS) {
            return NextResponse.json({
                error: `Maksimal ${MAX_SESSIONS} perangkat dapat login secara bersamaan. Logout dari salah satu perangkat terlebih dahulu.`,
                code: 'MAX_SESSIONS_REACHED'
            }, { status: 429 });
        }

        // Generate unique session ID for this login
        const sessionId = crypto.randomUUID();

        // Register this session in Firestore (use server-detected device info)
        await sessionsRef.doc(sessionId).set({
            userId: uid,
            sessionId,
            userName,
            role,
            deviceInfo: serverDevice,
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
            clientDevice: serverDevice
        };

        const cookieStore = await cookies();

        cookieStore.set('admin_session', signSession(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day auto logout
            path: '/',
        });

        // Log login activity (use server device)
        await logActivity(uid, sessionData.username, 'LOGIN', 'Masuk via Firebase Auth', request, { location, clientDevice: serverDevice });

        return NextResponse.json({ success: true, user: sessionData });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
}

