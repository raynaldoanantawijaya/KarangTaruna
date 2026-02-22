import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, address, latitude, longitude, accuracy } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        const sessionRef = adminDb.collection('active_sessions').doc(sessionId);

        // Build the update — merge only the fields that are provided
        const locationUpdate: Record<string, any> = {};
        if (address) locationUpdate['location.address'] = address;
        if (latitude !== undefined) locationUpdate['location.latitude'] = latitude;
        if (longitude !== undefined) locationUpdate['location.longitude'] = longitude;
        if (accuracy !== undefined) locationUpdate['location.accuracy'] = accuracy;

        if (Object.keys(locationUpdate).length > 0) {
            await sessionRef.update(locationUpdate);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update location error:', error);
        return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }
}
