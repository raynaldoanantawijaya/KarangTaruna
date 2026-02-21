import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { checkAuth, logActivity } from '@/lib/activity-logger';
import { checkRateLimitAndKillSwitch } from '@/lib/rate-limit';
import { deleteFromCloudinary } from '@/lib/cloudinary';

const SETTINGS_COLLECTION = 'settings';
const PROKER_DOC = 'proker';

export const revalidate = 0; // Disable static caching for this API route

export async function GET() {
    try {
        const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(PROKER_DOC);
        const doc = await docRef.get();

        if (doc.exists) {
            return NextResponse.json(doc.data());
        } else {
            // Return default structure if it doesn't exist yet
            return NextResponse.json({
                programs: [],
                agendas: []
            });
        }
    } catch (error) {
        console.error('Error fetching proker data:', error);
        return NextResponse.json({ error: 'Failed to fetch proker data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const currentUser = await checkAuth(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await checkRateLimitAndKillSwitch(currentUser.id, 'POST');

        const body = await request.json();
        const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(PROKER_DOC);

        // Fetch old data to compare Cloudinary images
        const oldDoc = await docRef.get();
        const oldData = oldDoc.exists ? oldDoc.data() : { programs: [] };
        const oldPrograms = oldData?.programs || [];
        const newPrograms = body.programs || [];

        // Find public_ids that exist in the old programs but not in the new programs
        const newPublicIds = newPrograms.map((p: any) => p.public_id).filter(Boolean);
        const orphanedPublicIds = oldPrograms
            .map((p: any) => p.public_id)
            .filter((id: string) => id && !newPublicIds.includes(id));

        // Delete orphaned images from Cloudinary securely
        for (const publicId of orphanedPublicIds) {
            try {
                await deleteFromCloudinary(publicId);
            } catch (err) {
                console.error(`Failed to delete orphaned Cloudinary image: ${publicId}`, err);
            }
        }

        await docRef.set(body, { merge: true });

        // Log the activity
        await logActivity(
            currentUser.id,
            currentUser.username || currentUser.email,
            'UPDATE_PROKER',
            'Memperbarui pengaturan Program Kerja & Agenda',
            request
        );

        return NextResponse.json({ message: 'Proker settings updated successfully' });
    } catch (error: any) {
        if (error.message === 'RATE_LIMIT_EXCEEDED' || error.message === 'KILL_SWITCH_ACTIVATED') {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }
        console.error('Error updating proker data:', error);
        return NextResponse.json({ error: 'Failed to update proker data', details: error.message }, { status: 500 });
    }
}
