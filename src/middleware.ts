import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis only if the environment variables are available
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

// Global Rate Limiter: e.g. 100 requests per 10 seconds for general API endpoints
const globalRatelimit = redis ? new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit/global',
}) : null;

// Login/Auth Rate Limiter (Anti Abuse): 20 requests per minute
const authRatelimit = redis ? new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/auth',
}) : null;

export async function middleware(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const path = request.nextUrl.pathname;

    // 0. Global Anti-Bot & Scraper Protection (Edge Level)
    const userAgent = request.headers.get('user-agent') || '';
    const userAgentLower = userAgent.toLowerCase();

    // Daftar pola User-Agent dari tools scraping terminal / programmatic
    // Pengecualian: Kita izinkan "googlebot" atau search engine khusus SEO
    const isMaliciousBot =
        (userAgentLower.includes('curl') ||
            userAgentLower.includes('wget') ||
            userAgentLower.includes('python') ||
            userAgentLower.includes('scrapy') ||
            userAgentLower.includes('postman') ||
            userAgentLower.includes('httpclient') ||
            userAgentLower.includes('playwright') ||
            userAgentLower.includes('puppeteer') ||
            userAgentLower.includes('phantom')) &&
        !userAgentLower.includes('googlebot') &&
        !userAgentLower.includes('bingbot');

    // Blokir jika terdeteksi tool terminal & backend
    if (isMaliciousBot) {
        console.warn(`[SCRAPER BLOCKED] IP: ${ip} User-Agent: ${userAgent}`);
        return new NextResponse(
            JSON.stringify({ error: 'Access Denied: Automated bots and scrapers are not permitted.' }),
            {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    // 1. Protection for /admin routes (Authentication Proxy logic)
    if (path.startsWith('/admin')) {
        const adminSession = request.cookies.get('admin_session');
        if (!adminSession) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 2. Redirect to dashboard if trying to access login while already logged in
    if (path === '/login') {
        const adminSession = request.cookies.get('admin_session');
        if (adminSession) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    // 3. Strict Auth Protection (Anti Spam for Login/Logout endpoints)
    if (path.startsWith('/api/auth') && request.method === 'POST') {
        if (authRatelimit) {
            const { success, limit, reset, remaining } = await authRatelimit.limit(ip);
            if (!success) {
                console.warn(`[BRUTE-FORCE BLOCKED] IP: ${ip} Path: ${path}`);
                return NextResponse.json({ error: 'Too Many Requests (Rate Limited - Auth)' }, {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString()
                    }
                });
            }
        }
    }

    // 4. Global API Protection (General DDoS limit)
    else if (path.startsWith('/api/')) {
        if (globalRatelimit) {
            const { success, limit, reset, remaining } = await globalRatelimit.limit(ip);
            if (!success) {
                console.warn(`[DDOS ATTEMPT BLOCKED] IP: ${ip} Path: ${path}`);
                return NextResponse.json({ error: 'Too Many Requests (Rate Limited)' }, {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString()
                    }
                });
            }
        }
    }

    // Next.js Response
    const response = NextResponse.next();
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
