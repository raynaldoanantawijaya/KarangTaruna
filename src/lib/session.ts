import crypto from 'crypto';

const SECRET_KEY = process.env.SESSION_SECRET || 'karang_taruna_default_secure_key_12345!@#';

export function signSession(payload: any): string {
    const data = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
    return `${data}.${signature}`;
}

export function verifySession(cookieValue: string): any | null {
    if (!cookieValue) return null;

    try {
        const parts = cookieValue.split('.');
        if (parts.length !== 2) {
            // Fallback for old plain-json cookies (temporary backwards compatibility)
            // In a strict production env, we'd reject this. But to avoid logging everyone out:
            const parsed = JSON.parse(cookieValue);
            return parsed;
        }

        const [data, signature] = parts;
        const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');

        if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            return JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
        }

        console.error('Session signature verification failed!');
        return null;
    } catch (e) {
        // If it fails splitting or JSON parsing, maybe it's just raw valid JSON from the old system
        try {
            return JSON.parse(cookieValue);
        } catch {
            return null;
        }
    }
}
