
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { checkAuth, logActivity } from '@/lib/activity-logger';
import { checkRateLimitAndKillSwitch } from '@/lib/rate-limit';

const POSTS_COLLECTION = 'posts';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    try {
        const currentUser = await checkAuth(request);
        if (currentUser) {
            await checkRateLimitAndKillSwitch(currentUser.id, 'GET');
        }

        const postsRef = adminDb.collection(POSTS_COLLECTION);

        if (id) {
            const doc = await postsRef.doc(id).get();
            if (!doc.exists) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }
            return NextResponse.json({ id: doc.id, ...doc.data() });
        }

        if (slug) {
            const snapshot = await postsRef.where('slug', '==', slug).limit(1).get();
            if (snapshot.empty) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }
            const doc = snapshot.docs[0];
            return NextResponse.json({ id: doc.id, ...doc.data() });
        }

        // Return all posts, ordered by createdAt descending
        const snapshot = await postsRef.orderBy('createdAt', 'desc').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error: any) {
        if (error.message === 'RATE_LIMIT_EXCEEDED' || error.message === 'KILL_SWITCH_ACTIVATED') {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const currentUser = await checkAuth(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await checkRateLimitAndKillSwitch(currentUser.id, 'POST');

        const body = await request.json();
        const postsRef = adminDb.collection(POSTS_COLLECTION);
        const now = new Date().toISOString();

        if (body.id) {
            // Update existing
            const docRef = postsRef.doc(body.id);
            const doc = await docRef.get();

            if (!doc.exists) {
                return NextResponse.json({ error: 'Item not found' }, { status: 404 });
            }

            const { id, ...updateData } = body;
            const updatedItem = { ...doc.data(), ...updateData, updatedAt: now };
            await docRef.update({ ...updateData, updatedAt: now });

            await logActivity(
                currentUser.id,
                currentUser.username || currentUser.email,
                'UPDATE_POST',
                `Memperbarui berita: ${updateData.title || updatedItem.title}`,
                request
            );

            return NextResponse.json({ success: true, data: { id: doc.id, ...updatedItem } });
        } else {
            // Create new
            // Ensure unique slug
            let baseSlug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            let uniqueSlug = baseSlug;
            let counter = 1;

            // Check for slug uniqueness in Firestore
            let slugExists = true;
            while (slugExists) {
                const existing = await postsRef.where('slug', '==', uniqueSlug).limit(1).get();
                if (existing.empty) {
                    slugExists = false;
                } else {
                    uniqueSlug = `${baseSlug}-${counter}`;
                    counter++;
                }
            }

            const newItem = {
                ...body,
                slug: uniqueSlug,
                createdAt: now,
                updatedAt: now
            };

            const docRef = await postsRef.add(newItem);

            await logActivity(
                currentUser.id,
                currentUser.username || currentUser.email,
                'CREATE_POST',
                `Membuat berita baru: ${newItem.title}`,
                request
            );

            return NextResponse.json({ success: true, data: { id: docRef.id, ...newItem } });
        }
    } catch (error) {
        console.error('Save Error:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const currentUser = await checkAuth(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        await checkRateLimitAndKillSwitch(currentUser.id, 'DELETE');

        const docRef = adminDb.collection(POSTS_COLLECTION).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const deletedData = doc.data();
        await docRef.delete();

        await logActivity(
            currentUser.id,
            currentUser.username || currentUser.email,
            'DELETE_POST',
            `Menghapus berita: ${deletedData?.title || id}`,
            request
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
    }
}
