import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // 1. Total Visits Counter (All time)
        await redis.incr('stats:visits:total');

        // 2. Daily Visits Counter
        await redis.incr(`stats:visits:daily:${today}`);

        // 2b. Monthly Visits Counter (for Year view)
        const month = today.substring(0, 7); // YYYY-MM
        await redis.incr(`stats:visits:monthly:${month}`);

        // 3. Unique Visitors (using Set with IP)
        await redis.sadd(`stats:unique:${today}`, ip);

        // 4. Page Views (optional, if we send path in body)
        // const { path } = await req.json();
        // if (path) await redis.incr(`stats:page:${path}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Visitor tracking error:', error);
        // Fail silently to not impact user experience
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
