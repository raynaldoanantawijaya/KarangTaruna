import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { logActivity } from '@/lib/activity-logger';
import { signSession } from '@/lib/session';
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

const MAX_SESSIONS = 2;

/**
 * Read the true device info from HTTP headers (server-side) combined with
 * client-side touch signals that Desktop Mode cannot spoof.
 *
 * Chrome Desktop Mode fakes: User-Agent, Sec-CH-UA-Platform, Sec-CH-UA-Mobile
 * Chrome Desktop Mode CANNOT fake: navigator.maxTouchPoints, navigator.platform (armv8)
 * 
 * Strategy: Use server headers for browser name + partial OS, then override 
 * "Linux" to "Android" when client reports touch capability.
 */
function parseDeviceFromRequest(
    request: Request,
    clientHints?: { touchPoints?: number; isMobile?: boolean; screenWidth?: number; model?: string; brand?: string }
) {
    const ua = request.headers.get('user-agent') || '';

    // Sec-CH-UA headers — ONLY reliable when NOT in Desktop Mode
    const secPlatform = request.headers.get('sec-ch-ua-platform')?.replace(/"/g, '') || '';
    const secMobile = request.headers.get('sec-ch-ua-mobile') || '';
    const secModel = request.headers.get('sec-ch-ua-model')?.replace(/"/g, '') || '';
    const secUaBrands = request.headers.get('sec-ch-ua') || '';

    const isMobileHeader = secMobile === '?1';

    // Parse browser name from sec-ch-ua brands (reliable even in Desktop Mode)
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

    // Use ua-parser-js as fallback for browser / os / device info
    const parser = new UAParser(ua);
    const uaBrowser = parser.getBrowser();
    const uaOs = parser.getOS();
    const uaDevice = parser.getDevice();

    // Determine OS — Sec-CH-UA-Platform header + client hints combo
    let trueOs = secPlatform || uaOs.name || 'Unknown';

    // touchPoints > 0 is the ONLY reliable signal from a touch device surviving Desktop Mode
    const hasTouchFromClient = (clientHints?.touchPoints ?? 0) > 0 || clientHints?.isMobile === true;
    const isMobile = isMobileHeader || hasTouchFromClient || uaDevice.type === 'mobile' || uaDevice.type === 'tablet';

    // Fix Chromium's Android-in-Desktop-Mode reporting Linux
    if ((trueOs === 'Linux' || trueOs === 'Unknown') && hasTouchFromClient) {
        trueOs = 'Android';
    }
    // Normal Chromium on real Android sends platform=Linux but mobile=?1
    if (trueOs === 'Linux' && isMobileHeader) {
        trueOs = 'Android';
    }

    // Device model — prefer client hint model (from userAgentData.getHighEntropyValues)
    // then sec-ch-ua-model, then UAParser
    const model = clientHints?.model || secModel || uaDevice.model || '';
    const brand = clientHints?.brand || uaDevice.vendor || '';
    const finalBrowser = browserName || uaBrowser.name || 'Browser';

    return { brand, model, os: trueOs, browser: finalBrowser, isMobile };
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { idToken, location, clientDevice } = body;

        // clientDevice contains touch signals sent by the login form JS
        // (touchPoints, isMobile, screenWidth, model, brand)
        const serverDevice = parseDeviceFromRequest(request, clientDevice || undefined);


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

