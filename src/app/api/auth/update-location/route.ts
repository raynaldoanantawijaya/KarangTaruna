import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, address } = body;

        if (!sessionId || !address) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const sessionRef = adminDb.collection('active_sessions').doc(sessionId);

        // Use set with merge: true or update to just update the location field
        await sessionRef.set({
            location: {
                address: address
            }
        }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update location error:', error);
        return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }
}
