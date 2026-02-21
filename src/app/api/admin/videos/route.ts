import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { checkAuth, logActivity } from '@/lib/activity-logger';
import { checkRateLimitAndKillSwitch } from '@/lib/rate-limit';

const COLLECTION_NAME = 'videos';

export async function GET(request: Request) {
    try {
        const currentUser = await checkAuth(request);
        if (currentUser) {
            await checkRateLimitAndKillSwitch(currentUser.id, 'GET');
        }

        const snapshot = await adminDb.collection(COLLECTION_NAME).orderBy('date', 'desc').get();
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json(data);
    } catch (error: any) {
        if (error.message === 'RATE_LIMIT_EXCEEDED' || error.message === 'KILL_SWITCH_ACTIVATED') {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }
        console.error('Error fetching videos:', error);
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const currentUser = await checkAuth(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await checkRateLimitAndKillSwitch(currentUser.id, 'POST');

        const body = await request.json();

        const newItem = {
            ...body,
            date: new Date().toISOString()
        };

        const docRef = await adminDb.collection(COLLECTION_NAME).add(newItem);

        await logActivity(
            currentUser.id,
            currentUser.username || currentUser.email,
            'ADD_VIDEO',
            `Menambahkan video: ${body.title}`,
            request
        );

        return NextResponse.json({ id: docRef.id, ...newItem });
    } catch (error: any) {
        if (error.message === 'RATE_LIMIT_EXCEEDED' || error.message === 'KILL_SWITCH_ACTIVATED') {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }
        console.error('Error saving to videos:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const currentUser = await checkAuth(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await checkRateLimitAndKillSwitch(currentUser.id, 'DELETE');

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const data = docSnap.data();

        // 1. Delete from Cloudinary if public_id exists
        if (data?.public_id) {
            await deleteFromCloudinary(data.public_id);
        }

        // 2. Delete from Firestore
        await docRef.delete();

        await logActivity(
            currentUser.id,
            currentUser.username || currentUser.email,
            'DELETE_VIDEO',
            `Menghapus video: ${data?.title || id}`,
            request
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'RATE_LIMIT_EXCEEDED' || error.message === 'KILL_SWITCH_ACTIVATED') {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }
        console.error('Error deleting from videos:', error);
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
    }
}
